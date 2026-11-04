/**
 * On-disk request outbox. Bitrix24 did not accept a lead — the request is saved as a file and re-sent by a background
 * worker (src/lib/leads/outbox-worker.ts); a visitor's file for an already created lead is a separate job (kind = attach).
 *
 * States: `<id>.json` — waiting; `<id>.sending` — taken for sending (rename acts as a lock: a second pass or a second
 * instance will not take it; with no outcome for longer than SENDING_STALE_MS it returns to the queue); `failed/<id>.json` — given
 * up after MAX_AGE_MS (deleted FAILED_RETENTION_MS after that); `<id>.json.corrupt` — an unreadable entry.
 * The visitor's file is `<id>.bin` next to it. Writes are atomic (tmp → rename), modes 0600/0700 (no effect on Windows).
 * The outbox holds personal data: the folder is for the site process only, keep it out of backups.
 *
 * Folder — LEADS_OUTBOX_DIR (a container volume in production), `.leads-outbox` in the process working directory by default.
 */
import { randomBytes } from 'node:crypto';
import { mkdir, readdir, readFile, rename, rm, stat, utimes, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type OutboxKind = 'lead' | 'attach';

export type OutboxItem = {
  id: string;
  /** lead — create a lead; attach — attach a file to an already created lead */
  kind: OutboxKind;
  createdAt: string;
  /** How many attempts have already failed (for lead, the first one is when the request is received) */
  attempts: number;
  nextAttemptAt: string;
  lastError: string;
  formId: string;
  formTitle: string;
  /** crm.item.add fields (kind = lead) */
  fields?: Record<string, unknown>;
  /** Lead to attach the file to (kind = attach) */
  leadId?: number;
  file?: { name: string; size: number };
  /** When it was moved to failed/ */
  failedAt?: string;
};

export type OutboxCounts = { pending: number; failed: number; corrupt: number; oldestAgeSec: number | null };
export type QueuedFile = { name: string; bytes: Uint8Array };
/** Sends one entry; the string is an outcome note for the log and notification ("lead 123") */
export type SendQueued = (item: OutboxItem, file?: QueuedFile) => Promise<string | void>;
export type ProcessResult = { sent: number; retried: number; gaveUp: number; corrupt: number };

/** Delay before a retry by failed attempt number, minutes; after that the last value */
export const BACKOFF_MIN = [2, 5, 15, 30, 60];
export const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const FAILED_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
/** An entry taken for sending with no outcome for longer than this goes back to the queue (the process died mid-send) */
export const SENDING_STALE_MS = 10 * 60 * 1000;
/** Queue ceiling: beyond it visitors' files are not saved (disk protection), the requests themselves are */
export const MAX_PENDING_WITH_FILES = 500;
const ORPHAN_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const DIR_MODE = 0o700;
const FILE_MODE = 0o600;

export const outboxDir = () => process.env.LEADS_OUTBOX_DIR?.trim() || path.join(process.cwd(), '.leads-outbox');

const failedDir = (dir: string) => path.join(dir, 'failed');
const filePath = (dir: string, id: string, ext: 'json' | 'sending' | 'bin') => path.join(dir, `${id}.${ext}`);

/** `20261024032447-dc29ddec`: UTC creation time + a random tail */
export function newOutboxId(now = new Date()) {
  return `${now.toISOString().replace(/\D/g, '').slice(0, 14)}-${randomBytes(4).toString('hex')}`;
}

/** Creation time from the id (ms) — to compute queue age without reading files */
export function idTime(id: string): number | null {
  const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})-/.exec(id);
  if (!m) return null;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
}

export function backoffMs(attempts: number) {
  const minutes = BACKOFF_MIN[Math.min(Math.max(attempts, 1), BACKOFF_MIN.length) - 1];
  return minutes * 60_000;
}

const isMissing = (e: unknown) => (e as NodeJS.ErrnoException | null)?.code === 'ENOENT';
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** "CODE: text" — Bitrix24 and Node errors have a code; otherwise "Name: text" */
export function errorText(e: unknown) {
  const err = e as { code?: unknown; name?: string; message?: string } | null;
  const code = typeof err?.code === 'string' ? err.code : '';
  return `${code || err?.name || 'Error'}: ${err?.message ?? String(e)}`;
}

const ensureDir = (dir: string) => mkdir(dir, { recursive: true, mode: DIR_MODE });

async function writeJsonAtomic(file: string, data: unknown) {
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2), { encoding: 'utf8', mode: FILE_MODE });
  await rename(tmp, file);
}

async function listNames(dir: string): Promise<string[]> {
  try {
    return await readdir(dir);
  } catch (e) {
    if (isMissing(e)) return [];
    throw e;
  }
}

const isPendingName = (n: string) => n.endsWith('.json') || n.endsWith('.sending');

async function pendingCount(dir: string) {
  return (await listNames(dir)).filter(isPendingName).length;
}

type Opts = { dir?: string; now?: Date };

async function putItem(item: OutboxItem, file: QueuedFile | undefined, dir: string) {
  await ensureDir(dir);
  if (file) await writeFile(filePath(dir, item.id, 'bin'), file.bytes, { mode: FILE_MODE });
  await writeJsonAtomic(filePath(dir, item.id, 'json'), item);
  return item;
}

/** A request Bitrix24 did not accept. The id can be set in advance — it is also the lead's originId (duplicate protection). */
export async function enqueueLead(
  input: { id?: string; formId: string; formTitle: string; fields: Record<string, unknown>; error: string; file?: QueuedFile },
  opts: Opts = {},
): Promise<OutboxItem> {
  const dir = opts.dir ?? outboxDir();
  const now = opts.now ?? new Date();
  await ensureDir(dir);

  let file = input.file;
  let fields = input.fields;
  if (file && (await pendingCount(dir)) >= MAX_PENDING_WITH_FILES) {
    // overflow: the file is not saved, the request is, and the manager gets a note
    const note = `File "${file.name}" was not saved: the site outbox is full, ask the customer to send it again`;
    fields = { ...fields, comments: [fields.comments, note].filter(Boolean).join('\n') };
    file = undefined;
  }

  const item: OutboxItem = {
    id: input.id ?? newOutboxId(now),
    kind: 'lead',
    createdAt: now.toISOString(),
    attempts: 1,
    nextAttemptAt: new Date(now.getTime() + backoffMs(1)).toISOString(),
    lastError: input.error,
    formId: input.formId,
    formTitle: input.formTitle,
    fields,
    ...(file ? { file: { name: file.name, size: file.bytes.byteLength } } : {}),
  };
  return putItem(item, file, dir);
}

/**
 * An "attach file to lead" job: written before responding to the visitor, after() tries to upload right away and removes it
 * (removeItem); if it did not make it or failed, the worker picks it up in 2 minutes. When the queue is full — null.
 */
export async function enqueueAttach(
  input: { leadId: number; formId: string; formTitle: string; file: QueuedFile },
  opts: Opts = {},
): Promise<OutboxItem | null> {
  const dir = opts.dir ?? outboxDir();
  const now = opts.now ?? new Date();
  await ensureDir(dir);
  if ((await pendingCount(dir)) >= MAX_PENDING_WITH_FILES) return null;

  const item: OutboxItem = {
    id: newOutboxId(now),
    kind: 'attach',
    createdAt: now.toISOString(),
    attempts: 0,
    nextAttemptAt: new Date(now.getTime() + backoffMs(1)).toISOString(),
    lastError: '',
    formId: input.formId,
    formTitle: input.formTitle,
    leadId: input.leadId,
    file: { name: input.file.name, size: input.file.bytes.byteLength },
  };
  return putItem(item, input.file, dir);
}

/** Remove an entry (success outside the worker) */
export async function removeItem(id: string, dir = outboxDir()) {
  await Promise.all(
    (['json', 'sending', 'bin'] as const).map((ext) => rm(filePath(dir, id, ext), { force: true })),
  );
}

/** Counters by file names — without reading contents (health is polled often) */
export async function countOutbox(dir = outboxDir(), now = new Date()): Promise<OutboxCounts> {
  const names = await listNames(dir);
  const failed = (await listNames(failedDir(dir))).filter((n) => n.endsWith('.json')).length;
  let pending = 0;
  let corrupt = 0;
  let oldest: number | null = null;
  for (const n of names) {
    if (n.endsWith('.corrupt')) {
      corrupt++;
      continue;
    }
    if (!isPendingName(n)) continue;
    pending++;
    const t = idTime(n);
    if (t !== null) {
      const age = now.getTime() - t;
      if (oldest === null || age > oldest) oldest = age;
    }
  }
  return { pending, failed, corrupt, oldestAgeSec: oldest === null ? null : Math.max(0, Math.round(oldest / 1000)) };
}

/** Probe write: the directory exists and is writable by the process (otherwise requests are lost when Bitrix24 fails) */
export async function probeOutbox(dir = outboxDir()): Promise<boolean> {
  try {
    await ensureDir(dir);
    const probe = path.join(dir, `.probe-${process.pid}-${randomBytes(2).toString('hex')}`);
    await writeFile(probe, 'ok', { mode: FILE_MODE });
    await rm(probe, { force: true });
    return true;
  } catch (e) {
    console.error(`[outbox] outbox directory is not writable (${dir}): ${message(e)}`);
    return false;
  }
}

let running = false;

/**
 * One pass over the queue. An entry is taken with a lock (rename → .sending), sent, and removed on success —
 * a cleanup failure is only logged and does not cause a re-send. On a send error the attempt is counted and
 * the next one scheduled; older than maxAgeMs — to failed/ + onGiveUp. After the first error the pass stops
 * (the CRM is probably down) — the remaining entries wait for the next pass.
 */
export async function processOutbox(opts: {
  send: SendQueued;
  onSent?: (item: OutboxItem, info?: string | void) => Promise<void>;
  onGiveUp?: (item: OutboxItem) => Promise<void>;
  dir?: string;
  now?: Date;
  maxAgeMs?: number;
}): Promise<ProcessResult> {
  const result: ProcessResult = { sent: 0, retried: 0, gaveUp: 0, corrupt: 0 };
  if (running) return result;
  running = true;
  try {
    const dir = opts.dir ?? outboxDir();
    const now = opts.now ?? new Date();
    const maxAgeMs = opts.maxAgeMs ?? MAX_AGE_MS;

    const names = await listNames(dir);
    await recoverStale(dir, names, now);
    const ids = names.filter((n) => n.endsWith('.json')).map((n) => n.slice(0, -'.json'.length)).sort();

    for (const id of ids) {
      const jsonFile = filePath(dir, id, 'json');
      const claim = filePath(dir, id, 'sending');

      let item: OutboxItem;
      try {
        item = JSON.parse(await readFile(jsonFile, 'utf8')) as OutboxItem;
        if (!item || typeof item !== 'object' || item.id !== id) throw new Error('contents do not look like an outbox entry');
      } catch (e) {
        if (isMissing(e)) continue;
        await rename(jsonFile, `${jsonFile}.corrupt`).catch(() => undefined);
        console.error(`[outbox] entry ${id} is unreadable, renamed to .corrupt: ${message(e)}`);
        result.corrupt++;
        continue;
      }
      if (Date.parse(item.nextAttemptAt) > now.getTime()) continue;

      // Lock: rename is atomic — the loser gets ENOENT and skips the entry
      try {
        await rename(jsonFile, claim);
        await utimes(claim, now, now);
      } catch {
        continue;
      }

      let file: QueuedFile | undefined;
      if (item.file) {
        try {
          file = { name: item.file.name, bytes: await readFile(filePath(dir, id, 'bin')) };
        } catch (e) {
          console.error(`[outbox] file of entry ${id} could not be read — sending without it: ${message(e)}`);
        }
      }

      let info: string | void = undefined;
      let failure: unknown = null;
      try {
        info = await opts.send(item, file);
      } catch (e) {
        failure = e;
      }

      if (failure === null) {
        result.sent++;
        // Cleanup is separate from sending: its failure must not cause a re-send
        try {
          await rm(claim, { force: true });
          await rm(filePath(dir, id, 'bin'), { force: true });
        } catch (e) {
          console.error(`[outbox] entry ${id} was sent but its outbox files were not deleted: ${message(e)}`);
        }
        await opts.onSent?.(item, info).catch((e: unknown) => console.error('[outbox] onSent:', message(e)));
        continue;
      }

      const attempts = item.attempts + 1;
      const updated: OutboxItem = {
        ...item,
        attempts,
        lastError: errorText(failure),
        nextAttemptAt: new Date(now.getTime() + backoffMs(attempts)).toISOString(),
      };
      try {
        if (now.getTime() - Date.parse(item.createdAt) > maxAgeMs) {
          await ensureDir(failedDir(dir));
          await writeJsonAtomic(filePath(failedDir(dir), id, 'json'), { ...updated, failedAt: now.toISOString() });
          await rm(claim, { force: true });
          if (item.file) await rename(filePath(dir, id, 'bin'), filePath(failedDir(dir), id, 'bin')).catch(() => undefined);
          result.gaveUp++;
          await opts.onGiveUp?.(updated).catch((e: unknown) => console.error('[outbox] onGiveUp:', message(e)));
        } else {
          await writeJsonAtomic(jsonFile, updated);
          await rm(claim, { force: true });
          result.retried++;
        }
      } catch (e) {
        // .sending stays — it returns to the queue after SENDING_STALE_MS
        console.error(`[outbox] state of entry ${id} was not saved: ${message(e)}`);
      }
      break;
    }

    await housekeeping(dir, now);
  } finally {
    running = false;
  }
  return result;
}

/** Entries stuck in .sending (the process died mid-send) go back to the queue */
async function recoverStale(dir: string, names: string[], now: Date) {
  for (const n of names) {
    if (!n.endsWith('.sending')) continue;
    const id = n.slice(0, -'.sending'.length);
    const claim = path.join(dir, n);
    try {
      const s = await stat(claim);
      if (now.getTime() - s.mtimeMs < SENDING_STALE_MS) continue;
      const jsonFile = filePath(dir, id, 'json');
      const hasJson = await stat(jsonFile).then(() => true, () => false);
      if (hasJson) await rm(claim, { force: true });
      else await rename(claim, jsonFile);
      console.warn(`[outbox] entry ${id} returned to the queue: sending did not finish`);
    } catch {
      // gone between readdir and stat
    }
  }
}

/** failed/ — deleted FAILED_RETENTION_MS after giving up; orphaned .tmp and .bin without an entry — after a day */
async function housekeeping(dir: string, now: Date) {
  const fdir = failedDir(dir);
  for (const n of await listNames(fdir)) {
    if (!n.endsWith('.json')) continue;
    const f = path.join(fdir, n);
    try {
      const item = JSON.parse(await readFile(f, 'utf8')) as OutboxItem;
      if (now.getTime() - Date.parse(item.failedAt ?? item.createdAt) > FAILED_RETENTION_MS) {
        await rm(f, { force: true });
        await rm(filePath(fdir, n.slice(0, -'.json'.length), 'bin'), { force: true });
      }
    } catch {
      // unreadable — left in place, visible to the eye
    }
  }

  const names = await listNames(dir);
  const alive = new Set(names.filter(isPendingName).map((n) => n.replace(/\.(json|sending)$/, '')));
  for (const n of names) {
    const orphan = n.endsWith('.tmp') || (n.endsWith('.bin') && !alive.has(n.slice(0, -'.bin'.length)));
    if (!orphan) continue;
    const f = path.join(dir, n);
    try {
      const s = await stat(f);
      if (now.getTime() - s.mtimeMs > ORPHAN_MAX_AGE_MS) await rm(f, { force: true });
    } catch {
      // gone
    }
  }
}
