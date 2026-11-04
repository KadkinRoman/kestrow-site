/**
 * Notifications to managers about requests that did not reach Bitrix24 — to Telegram via the Bot API.
 * Setup: LEADS_ALERT_TG_BOT_TOKEN (bot token — a secret, never logged) and LEADS_ALERT_TG_CHAT_ID
 * (managers' chat). Without them no notification is sent; the log only keeps the outbox entry id.
 * Messages include the customer's contacts (managers need to call back while the CRM is down).
 */
import type { OutboxItem } from './outbox';

const TIMEOUT_MS = 10_000;
/** Telegram's limit is 4096 characters; cut by code points so an emoji is not split */
const MAX_TEXT = 3500;

export const telegramConfigured = () =>
  !!(process.env.LEADS_ALERT_TG_BOT_TOKEN?.trim() && process.env.LEADS_ALERT_TG_CHAT_ID?.trim());

const cut = (text: string) => Array.from(text).slice(0, MAX_TEXT).join('');

/** true — delivered. Errors go to the log without the request URL (it contains the token). */
export async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.LEADS_ALERT_TG_BOT_TOKEN?.trim();
  const chatId = process.env.LEADS_ALERT_TG_CHAT_ID?.trim();
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: cut(text), disable_web_page_preview: true }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[notify] Telegram responded ${res.status}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[notify] Telegram unavailable:', e instanceof Error ? e.name : e);
    return false;
  }
}

type LeadFieldsView = {
  name?: string;
  fm?: { typeId: string; value: string }[];
  comments?: string;
  sourceDescription?: string;
};

function contactLines(fields: Record<string, unknown> | undefined) {
  const f = (fields ?? {}) as LeadFieldsView;
  const phone = f.fm?.find((x) => x.typeId === 'PHONE')?.value;
  const email = f.fm?.find((x) => x.typeId === 'EMAIL')?.value;
  return [f.name && `Name: ${f.name}`, phone && `Phone: ${phone}`, email && `Email: ${email}`];
}

const join = (lines: (string | false | undefined)[]) => lines.filter(Boolean).join('\n');

/** A request in the outbox: who, how to reach them, what they asked for — so you can call back while the CRM is down */
export function queuedLeadMessage(item: OutboxItem): string {
  const f = (item.fields ?? {}) as LeadFieldsView;
  return join([
    '⚠️ A Kestrow Motors website request did not reach Bitrix24. It has been saved and the site will retry on its own.',
    `Form: ${item.formTitle} (${item.formId})`,
    ...contactLines(item.fields),
    f.comments && `Details:\n${f.comments}`,
    f.sourceDescription && `Source: ${f.sourceDescription}`,
    `CRM error: ${item.lastError}`,
    'Until the CRM is back, contact the customer manually. When the request reaches the CRM, you will get a "delivered" message.',
  ]);
}

/** Both Bitrix24 and the on-disk outbox refused — the only trace of the request */
export function lostLeadMessage(input: { fields: Record<string, unknown>; formTitle: string; error: string }): string {
  const f = input.fields as LeadFieldsView;
  return join([
    '❗ A Kestrow Motors website request was NOT SAVED: Bitrix24 rejected the lead and the on-disk outbox is unavailable. This message is the only copy.',
    `Form: ${input.formTitle}`,
    ...contactLines(input.fields),
    f.comments && `Details:\n${f.comments}`,
    `CRM error: ${input.error}`,
    'Create the lead manually and check the site server (disk space, permissions on the outbox folder).',
  ]);
}

/** A deferred request reached the CRM — so the customer is not handled twice */
export function deliveredLeadMessage(item: OutboxItem, info?: string): string {
  return join([
    `✅ A request from the outbox was delivered to Bitrix24${info ? ` (${info})` : ''}.`,
    `Form: ${item.formTitle}`,
    ...contactLines(item.fields),
    'If you have already contacted the customer manually, note it in the lead.',
  ]);
}

export function gaveUpLeadMessage(item: OutboxItem): string {
  return join([
    `❗ Entry ${item.id} was never sent to Bitrix24 (${item.attempts} attempts over a week). Moved to the failed folder — manual handling required.`,
    `Form: ${item.formTitle}${item.kind === 'attach' ? ` (file for lead ${item.leadId})` : ''}`,
    ...contactLines(item.fields),
    `Last error: ${item.lastError}`,
  ]);
}

/** Report a request waiting in the outbox. Call after responding to the visitor (after()). */
export async function notifyLeadQueued(item: OutboxItem) {
  await deliver(queuedLeadMessage(item), `request ${item.id} waits in the outbox without a notification`);
}

/** Report a lost request (Bitrix24 and the outbox both failed at once) */
export async function notifyLeadLost(input: { fields: Record<string, unknown>; formTitle: string; error: string }) {
  await deliver(lostLeadMessage(input), 'request lost, nobody to notify');
}

async function deliver(text: string, ifUnconfigured: string) {
  if (process.env.NODE_ENV !== 'production') console.info(`[notify] Telegram:\n${text}`);
  if (!telegramConfigured()) {
    console.warn(`[notify] Telegram not configured — ${ifUnconfigured}`);
    return;
  }
  const ok = await sendTelegram(text);
  if (!ok) console.error('[notify] notification not delivered');
}
