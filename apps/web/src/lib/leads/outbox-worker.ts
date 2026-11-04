/**
 * Background worker for the lead outbox: every LEADS_OUTBOX_INTERVAL_SEC (default 120 s) it sends the deferred
 * entries to Bitrix24. Started once per process from src/instrumentation.ts. Server-side Node code only.
 * Works only with LEADS_SEND_TO_CRM=true — in dev the outbox (even one copied from production) never reaches the portal.
 */
import { addLead, addLeadComment, findLeadByOriginId } from './bitrix24';
import { formatMountain, ORIGINATOR_ID } from './lead';
import { deliveredLeadMessage, gaveUpLeadMessage, sendTelegram } from './notify';
import { countOutbox, outboxDir, probeOutbox, processOutbox, type OutboxItem, type ProcessResult, type QueuedFile } from './outbox';

const DEFAULT_INTERVAL_SEC = 120;
const FIRST_RUN_DELAY_MS = 30_000;
const NOTHING: ProcessResult = { sent: 0, retried: 0, gaveUp: 0, corrupt: 0 };

type WithWorker = typeof globalThis & { __kestrowOutboxWorker?: boolean; __kestrowOutboxGateWarned?: boolean };

const missingFileNote = (name: string) =>
  `The customer attached the file "${name}", but it failed to upload. Ask them to send it again.`;

async function attachQueuedFile(leadId: number, item: OutboxItem, file?: QueuedFile) {
  if (!item.file) return;
  if (!file) {
    // the .bin could not be read — at least warn the manager
    await addLeadComment(leadId, missingFileNote(item.file.name));
    return;
  }
  const data = new File([new Uint8Array(file.bytes)], file.name);
  await addLeadComment(leadId, `File from the "${item.formTitle}" form on the website`, { data, name: file.name });
}

/** Sends one entry: a lead (with duplicate protection by originId) or a file for a lead */
export async function sendQueuedItem(item: OutboxItem, file?: QueuedFile): Promise<string> {
  if (item.kind === 'attach') {
    if (!item.leadId) throw new Error('attach entry without leadId');
    await attachQueuedFile(item.leadId, item, file);
    return `file for lead ${item.leadId}`;
  }
  if (!item.fields) throw new Error('lead entry without fields');

  // The first attempt may have timed out after the lead was created — check by originId
  let leadId = await findLeadByOriginId(item.id).catch((e: unknown) => {
    console.warn(`[outbox] duplicate check by originId failed (${e instanceof Error ? e.message : e}) — creating the lead`);
    return null;
  });
  let created = false;
  if (!leadId) {
    const note = `Sent from the site outbox: Bitrix24 was unavailable at ${formatMountain(new Date(item.createdAt))} (MT), attempt ${item.attempts + 1}`;
    const comments = [item.fields.comments, note].filter(Boolean).join('\n');
    leadId = await addLead({ ...item.fields, originatorId: ORIGINATOR_ID, originId: item.id, comments });
    created = true;
  }

  if (item.file) {
    try {
      await attachQueuedFile(leadId, item, file);
    } catch (e) {
      console.error(`[outbox] file "${item.file.name}" was not attached to lead ${leadId}: ${e instanceof Error ? e.message : e}`);
      await addLeadComment(leadId, missingFileNote(item.file.name)).catch(() => undefined);
    }
  }
  return created ? `lead ${leadId}` : `lead ${leadId} already existed`;
}

export async function runOutboxOnce(): Promise<ProcessResult> {
  if (process.env.LEADS_SEND_TO_CRM !== 'true') {
    const g = globalThis as WithWorker;
    if (!g.__kestrowOutboxGateWarned) {
      g.__kestrowOutboxGateWarned = true;
      console.warn('[outbox] outbox not processed: LEADS_SEND_TO_CRM is not true (live leads are not sent in dev)');
    }
    return NOTHING;
  }
  const result = await processOutbox({
    send: sendQueuedItem,
    onSent: async (item, info) => {
      if (item.kind === 'lead') await sendTelegram(deliveredLeadMessage(item, info ?? undefined));
    },
    onGiveUp: async (item) => {
      await sendTelegram(gaveUpLeadMessage(item));
    },
  });
  if (result.sent || result.retried || result.gaveUp || result.corrupt) {
    console.info(
      `[outbox] sent ${result.sent}, deferred ${result.retried}, given up ${result.gaveUp}, unreadable ${result.corrupt}`,
    );
  }
  return result;
}

export function startOutboxWorker() {
  const g = globalThis as WithWorker;
  if (g.__kestrowOutboxWorker) return;
  g.__kestrowOutboxWorker = true;

  if (process.env.NODE_ENV === 'production' && !process.env.LEADS_OUTBOX_DIR?.trim()) {
    console.error('[outbox] LEADS_OUTBOX_DIR is not set: the outbox in the app directory is lost on redeploy — mount a volume');
  }
  probeOutbox()
    .then((ok) => {
      if (!ok) console.error('[outbox] OUTBOX UNAVAILABLE: requests will be lost if Bitrix24 fails (see /api/health)');
    })
    .catch(() => undefined);

  const intervalMs = Math.max(10, Number(process.env.LEADS_OUTBOX_INTERVAL_SEC) || DEFAULT_INTERVAL_SEC) * 1000;
  const tick = () => {
    runOutboxOnce().catch((e: unknown) => console.error('[outbox] outbox processing failed:', e instanceof Error ? e.message : e));
  };
  // unref: the timers do not keep the process alive on shutdown
  setTimeout(tick, Math.min(FIRST_RUN_DELAY_MS, intervalMs)).unref();
  setInterval(tick, intervalMs).unref();

  countOutbox()
    .then((c) => {
      if (c.pending || c.failed || c.corrupt) {
        console.info(`[outbox] at startup: ${c.pending} pending, ${c.failed} given up, ${c.corrupt} unreadable (${outboxDir()})`);
      }
    })
    .catch(() => undefined);
}
