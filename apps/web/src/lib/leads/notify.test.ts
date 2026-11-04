import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import {
  deliveredLeadMessage,
  gaveUpLeadMessage,
  lostLeadMessage,
  queuedLeadMessage,
  sendTelegram,
  telegramConfigured,
} from './notify';
import type { OutboxItem } from './outbox';

const fields = {
  name: 'John',
  fm: [{ typeId: 'PHONE', valueType: 'WORK', value: '+15550104820' }],
  comments: 'Comment: urgent',
  sourceDescription: 'Form "Book a test drive" (zamer)',
};

const item: OutboxItem = {
  id: '20261024000000-abcd1234',
  kind: 'lead',
  createdAt: '2026-10-24T00:00:00.000Z',
  attempts: 1,
  nextAttemptAt: '2026-10-24T00:02:00.000Z',
  lastError: 'NETWORK: TypeError ENOTFOUND',
  formId: 'zamer',
  formTitle: 'Book a test drive',
  fields,
};

describe('notify: texts', () => {
  it('queued — form, contact, details, error', () => {
    const t = queuedLeadMessage(item);
    assert.match(t, /Book a test drive \(zamer\)/);
    assert.match(t, /Name: John/);
    assert.match(t, /Phone: \+15550104820/);
    assert.match(t, /Comment: urgent/);
    assert.match(t, /CRM error: NETWORK: TypeError ENOTFOUND/);
  });
  it('lost — warning and contact', () => {
    const t = lostLeadMessage({ fields, formTitle: 'Book a test drive', error: 'NETWORK' });
    assert.match(t, /NOT SAVED/);
    assert.match(t, /Phone: \+15550104820/);
  });
  it('delivered and given up', () => {
    assert.match(deliveredLeadMessage(item, 'lead 123'), /delivered to Bitrix24 \(lead 123\)/);
    assert.match(gaveUpLeadMessage(item), /failed/);
  });
});

describe('notify: sending', () => {
  afterEach(() => {
    delete process.env.LEADS_ALERT_TG_BOT_TOKEN;
    delete process.env.LEADS_ALERT_TG_CHAT_ID;
  });
  it('sends nothing without Telegram settings', async () => {
    assert.equal(telegramConfigured(), false);
    assert.equal(await sendTelegram('x'), false);
  });
});
