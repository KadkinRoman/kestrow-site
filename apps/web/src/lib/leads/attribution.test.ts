import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { appendAttributionFields, attributionFromVisit, hasCampaign, readAttributionFields } from './attribution';

describe('attributionFromVisit', () => {
  it('collects UTM, ad click and external referrer', () => {
    const a = attributionFromVisit({
      search: '?utm_source=google&utm_medium=cpc&gclid=777&x=1',
      referrer: 'https://www.google.com/search?q=used+cars',
      path: '/cars',
      host: 'kestrow.example',
      now: new Date('2026-10-24T00:00:00Z'),
    });
    assert.deepEqual(a.utm, { source: 'google', medium: 'cpc' });
    assert.equal(a.clickId, 'gclid=777');
    assert.equal(a.referrer, 'https://www.google.com/search?q=used+cars');
    assert.equal(a.landing, '/cars?utm_source=google&utm_medium=cpc&gclid=777&x=1');
    assert.equal(a.capturedAt, '2026-10-24T00:00:00.000Z');
    assert.equal(hasCampaign(a), true);
  });

  it('ignores its own referrer and empty tags', () => {
    const a = attributionFromVisit({ search: '', referrer: 'https://kestrow.example/about', path: '/', host: 'kestrow.example' });
    assert.deepEqual(a.utm, {});
    assert.equal(a.referrer, undefined);
    assert.equal(a.clickId, undefined);
    assert.equal(a.landing, '/');
    assert.equal(hasCampaign(a), false);
  });

  it('truncates to 200 characters, strips brackets and control characters', () => {
    const a = attributionFromVisit({ search: `?utm_source=${'a'.repeat(300)}&utm_term=go[url=x]ogle%0Abad`, referrer: '', path: '/', host: 'h' });
    assert.equal(a.utm.source?.length, 200);
    assert.equal(a.utm.term, 'gourl=xoglebad');
  });
});

describe('form fields', () => {
  it('append → read without loss (capturedAt is not sent with the form)', () => {
    const a = attributionFromVisit({
      search: '?utm_source=facebook&gclid=abc',
      referrer: 'https://www.facebook.com/kestrow',
      path: '/offers',
      host: 'h',
    });
    const d = new FormData();
    appendAttributionFields(d, a);
    assert.equal(d.has('attr[capturedAt]'), false);
    assert.deepEqual(readAttributionFields(d), { utm: a.utm, clickId: a.clickId, referrer: a.referrer, landing: a.landing });
  });

  it('a landing page with "|" and ":" in tags is kept', () => {
    const d = new FormData();
    d.set('attr[landing]', '/cars?utm_content=k50id|0100|cid:7');
    assert.equal(readAttributionFields(d).landing, '/cars?utm_content=k50id|0100|cid:7');
  });

  it('discards garbage, trims spaces', () => {
    const d = new FormData();
    d.set('attr[referrer]', 'javascript:alert(1)');
    d.set('attr[landing]', 'http://evil');
    d.set('attr[clickId]', 'x y');
    d.set('utm[source]', ' google ');
    assert.deepEqual(readAttributionFields(d), { utm: { source: 'google' }, clickId: undefined, referrer: undefined, landing: undefined });
  });
});
