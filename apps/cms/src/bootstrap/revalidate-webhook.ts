import type { Core } from '@strapi/strapi';

const NAME = 'Next.js: site cache reset';
const EVENTS = ['entry.create', 'entry.update', 'entry.delete', 'entry.publish', 'entry.unpublish'];

type Webhook = { id: string; name: string; url: string; headers: Record<string, string>; events: string[]; isEnabled: boolean };
type WebhookStore = {
  findWebhooks(): Promise<Webhook[]>;
  createWebhook(data: Omit<Webhook, 'id'>): Promise<Webhook>;
  updateWebhook(id: string, data: Omit<Webhook, 'id'>): Promise<Webhook | null>;
};
type WebhookRunner = { add(w: Webhook): void; update(w: Webhook): void };

/**
 * Creates (or updates) a Strapi webhook → POST {FRONTEND_REVALIDATE_URL} with a secret,
 * so admin edits reset the Next.js cache right away. Does nothing without both variables.
 */
export async function ensureRevalidateWebhook(strapi: Core.Strapi) {
  const url = process.env.FRONTEND_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) return;

  const store = strapi.get('webhookStore') as WebhookStore;
  const runner = strapi.get('webhookRunner') as WebhookRunner;
  const data = { name: NAME, url, headers: { 'x-revalidate-secret': secret }, events: EVENTS, isEnabled: true };

  const existing = (await store.findWebhooks()).find((w) => w.name === NAME);
  if (!existing) {
    runner.add(await store.createWebhook(data));
    strapi.log.info(`[webhook] created: ${url}`);
    return;
  }

  const same =
    existing.url === url &&
    existing.headers?.['x-revalidate-secret'] === secret &&
    EVENTS.every((e) => existing.events.includes(e));
  if (same) return;

  // If disabled in the admin (Settings → Webhooks) we keep it that way — not re-enabled on restart
  const updated = await store.updateWebhook(existing.id, { ...data, isEnabled: existing.isEnabled });
  if (updated) runner.update(updated);
  strapi.log.info(`[webhook] updated: ${url}`);
}
