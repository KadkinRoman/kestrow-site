import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { enqueueLead, type OutboxItem } from './outbox';
import { runOutboxOnce } from './outbox-worker';

const ENV = ['LEADS_SEND_TO_CRM', 'LEADS_OUTBOX_DIR', 'BITRIX24_WEBHOOK_URL', 'LEADS_ALERT_TG_BOT_TOKEN'] as const;
const saved: Partial<Record<(typeof ENV)[number], string | undefined>> = {};
let dir: string;

beforeEach(async () => {
  for (const k of ENV) saved[k] = process.env[k];
  dir = await mkdtemp(path.join(tmpdir(), 'kestrow-worker-'));
  process.env.LEADS_OUTBOX_DIR = dir;
  delete process.env.BITRIX24_WEBHOOK_URL;
  delete process.env.LEADS_ALERT_TG_BOT_TOKEN;
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
  for (const k of ENV) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

const base = {
  formId: 'zamer',
  formTitle: 'Test drive',
  fields: { title: 'Website: request', fm: [{ typeId: 'PHONE', valueType: 'WORK', value: '+15550104820' }] },
  error: 'NETWORK: fetch failed',
};
/** An entry whose retry time has already come */
const due = () => enqueueLead(base, { dir, now: new Date(Date.now() - 10 * 60_000) });

describe('outbox-worker', () => {
  it('does not touch the outbox without LEADS_SEND_TO_CRM=true (dev)', async () => {
    delete process.env.LEADS_SEND_TO_CRM;
    const item = await due();
    assert.deepEqual(await runOutboxOnce(), { sent: 0, retried: 0, gaveUp: 0, corrupt: 0 });
    assert.deepEqual(await readdir(dir), [`${item.id}.json`]);
  });

  it('with LEADS_SEND_TO_CRM=true and no webhook the attempt is counted and no network call is made', async () => {
    process.env.LEADS_SEND_TO_CRM = 'true';
    const item = await due();
    const r = await runOutboxOnce();
    assert.equal(r.retried, 1);
    const saved = JSON.parse(await readFile(path.join(dir, `${item.id}.json`), 'utf8')) as OutboxItem;
    assert.equal(saved.attempts, 2);
    assert.match(saved.lastError, /^NO_WEBHOOK/);
  });
});
