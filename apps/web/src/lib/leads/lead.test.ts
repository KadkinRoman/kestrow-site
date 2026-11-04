import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import type { LeadFormSpec } from '@/lib/content/types';
import { fallbackForm, formatMountain, leadFields, normalizePhone, parseLead, type Lead } from './lead';

type Field = LeadFormSpec['fields'][number];
const field = (name: string, type: Field['type'], extra: Partial<Field> = {}): Field => ({
  name,
  label: name,
  type,
  required: false,
  options: [],
  ...extra,
});

const form: LeadFormSpec = {
  formId: 'zamer',
  title: 'Book a test drive',
  submitLabel: 'Book',
  willSendToCrm: true,
  crmTitle: 'Website: Book a test drive',
  crmSourceId: 'CALLBACK',
  fields: [
    field('name', 'text', { label: 'Your name' }),
    field('phone', 'tel', { label: 'Phone', required: true }),
    field('email', 'email', { label: 'Email' }),
    field('comment', 'textarea', { label: 'Comment' }),
    field('way', 'radio', { label: 'Contact method', options: ['Call', 'Telegram'] }),
  ],
};

const fd = (entries: Record<string, string>) => {
  const d = new FormData();
  for (const [k, v] of Object.entries(entries)) d.set(k, v);
  return d;
};

const base = { name: 'John', phone: '+1 (555) 010-4820', agree: 'on' };

const lead = async (entries: Record<string, string> = {}, f = form) => {
  const r = await parseLead(f, fd({ ...base, ...entries }));
  assert.equal(typeof r, 'object', `expected a lead, got ${String(r)}`);
  return r as Lead;
};

describe('normalizePhone', () => {
  it('normalizes to +1XXXXXXXXXX', () => {
    assert.equal(normalizePhone('+1 (555) 010-4820'), '+15550104820');
    assert.equal(normalizePhone('15550104820'), '+15550104820');
    assert.equal(normalizePhone('555 010 4820'), '+15550104820');
  });
  it('rejects incomplete and overlong numbers', () => {
    assert.equal(normalizePhone('12345'), null);
    assert.equal(normalizePhone('+1 (555) 010-482'), null);
    assert.equal(normalizePhone('+44 20 7946 0958'), null);
    assert.equal(normalizePhone(''), null);
  });
});

describe('parseLead', () => {
  it('without consent — consent_required', async () => {
    assert.equal(await parseLead(form, fd({ name: 'J', phone: '+15550104820' })), 'consent_required');
  });
  it('without a tel field in the form description — form_misconfigured', async () => {
    assert.equal(await parseLead({ ...form, fields: [field('name', 'text')] }, fd(base)), 'form_misconfigured');
  });
  it('malformed phone — invalid_phone', async () => {
    assert.equal(await parseLead(form, fd({ ...base, phone: '123' })), 'invalid_phone');
  });
  it('empty required field — required', async () => {
    const strict = { ...form, fields: form.fields.map((x) => (x.name === 'comment' ? { ...x, required: true } : x)) };
    assert.equal(await parseLead(strict, fd(base)), 'required');
  });
  it('email and option are validated', async () => {
    assert.equal(await parseLead(form, fd({ ...base, email: 'not-mail' })), 'invalid_email');
    assert.equal(await parseLead(form, fd({ ...base, way: 'Pigeon' })), 'invalid_option');
  });
  it('text that is too long — too_long', async () => {
    assert.equal(await parseLead(form, fd({ ...base, comment: 'x'.repeat(2001) })), 'too_long');
  });
  it('collects phone, name, email and details (BB-code brackets replaced)', async () => {
    const l = await lead({ email: 'a@b.com', comment: 'blue SUV [urgent]', way: 'Telegram' });
    assert.equal(l.phone, '+15550104820');
    assert.equal(l.name, 'John');
    assert.deepEqual(l.emails, ['a@b.com']);
    assert.deepEqual(l.details, ['Comment: blue SUV (urgent)', 'Contact method: Telegram']);
  });
  it('extra[...] data and the page path', async () => {
    const l = await lead({ 'extra[promo]': 'Trade-in bonus', 'extra[Which car?]': 'Blue SUV', page: '/offers' });
    assert.deepEqual(l.details, ['Offer: Trade-in bonus', 'Which car?: Blue SUV']);
    assert.equal(l.page, '/offers');
  });
  it('a dangerous page path is dropped', async () => {
    assert.equal((await lead({ page: 'javascript:alert(1)' })).page, '');
  });
  it('reads attribution from hidden fields', async () => {
    const l = await lead({
      'utm[source]': 'google',
      'utm[medium]': 'cpc',
      'attr[clickId]': 'gclid=123',
      'attr[referrer]': 'https://www.google.com/search/',
      'attr[landing]': '/cars?utm_source=google',
    });
    assert.deepEqual(l.attribution.utm, { source: 'google', medium: 'cpc' });
    assert.equal(l.attribution.clickId, 'gclid=123');
    assert.equal(l.attribution.referrer, 'https://www.google.com/search/');
    assert.equal(l.attribution.landing, '/cars?utm_source=google');
  });
});

describe('leadFields', () => {
  afterEach(() => {
    delete process.env.BITRIX24_LEAD_ASSIGNED_BY_ID;
  });

  it('crm.item.add fields: phone in fm, source, consent line', async () => {
    const l = await lead({ email: 'a@b.com', page: '/offers' });
    const f = leadFields(l, 'https://kestrow.example', { now: new Date('2026-10-24T02:50:00Z') });
    assert.equal(f.title, 'Website: Book a test drive');
    assert.equal(f.sourceId, 'CALLBACK');
    assert.deepEqual(f.fm, [
      { typeId: 'PHONE', valueType: 'WORK', value: '+15550104820' },
      { typeId: 'EMAIL', valueType: 'WORK', value: 'a@b.com' },
    ]);
    assert.equal(f.sourceDescription, 'Form "Book a test drive" (zamer), page https://kestrow.example/offers');
    assert.match(
      f.comments,
      /^Consent to personal data processing: given 10\/23\/2026 20:50 \(MT\) on page https:\/\/kestrow\.example\/offers, policy https:\/\/kestrow\.example\/privacy-policy$/m,
    );
    assert.equal('assignedById' in f, false);
    assert.equal('originId' in f, false);
  });

  it('originId → the lead originatorId/originId (duplicate protection on retry)', async () => {
    const f = leadFields(await lead(), 'https://s', { originId: '20261024000000-abcd1234' });
    assert.equal(f.originatorId, 'kestrow-site');
    assert.equal(f.originId, '20261024000000-abcd1234');
  });

  it('UTM → standard lead fields, referrer and click go into the comment', async () => {
    const l = await lead({
      'utm[source]': 'google',
      'utm[campaign]': 'cars',
      'attr[clickId]': 'gclid=9',
      'attr[referrer]': 'https://www.google.com/',
    });
    const f = leadFields(l, 'https://s') as Record<string, unknown>;
    assert.equal(f.utmSource, 'google');
    assert.equal(f.utmCampaign, 'cars');
    assert.equal('utmMedium' in f, false);
    assert.match(String(f.comments), /Referrer: https:\/\/www\.google\.com\//);
    assert.match(String(f.comments), /Ad click: gclid=9/);
  });

  it('assignee comes from BITRIX24_LEAD_ASSIGNED_BY_ID', async () => {
    process.env.BITRIX24_LEAD_ASSIGNED_BY_ID = '68';
    assert.equal(leadFields(await lead(), 'https://s').assignedById, 68);
  });
});

describe('fallbackForm', () => {
  it('phone is required, file and contact method present, CRM sending enabled', () => {
    const f = fallbackForm('zamer');
    assert.ok(f.fields.some((x) => x.type === 'tel' && x.required));
    assert.ok(f.fields.some((x) => x.type === 'file' && !x.required));
    assert.equal(f.willSendToCrm, true);
    assert.equal(f.formId, 'zamer');
    assert.equal(f.crmSourceId, 'CALLBACK');
    assert.equal(fallbackForm('quiz').crmSourceId, 'REPEAT_SALE');
  });
  it('a radio without options accepts any contact method', async () => {
    const l = await lead({ contactWay: 'Telegram', comment: 'I want a blue SUV' }, fallbackForm('compare'));
    assert.deepEqual(l.details, ['Comment: I want a blue SUV', 'Preferred way to reach you: Telegram']);
  });
});

describe('formatMountain', () => {
  it('converts to Mountain time', () => {
    assert.equal(formatMountain(new Date('2026-10-24T02:50:00Z')), '10/23/2026 20:50');
  });
});
