import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rename, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import {
  backoffMs,
  countOutbox,
  enqueueAttach,
  enqueueLead,
  idTime,
  newOutboxId,
  processOutbox,
  removeItem,
  type OutboxItem,
} from './outbox';

let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'kestrow-outbox-'));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const fields = { title: 'Website: request', fm: [{ typeId: 'PHONE', valueType: 'WORK', value: '+15550104820' }] };
const now = new Date('2026-10-24T00:00:00Z');
const later = (minutes: number) => new Date(now.getTime() + minutes * 60_000);
const days = (n: number) => new Date(now.getTime() + n * 24 * 3_600_000);
const pdf = () => new TextEncoder().encode('%PDF-1.4');
const names = async (d = dir) => (await readdir(d)).sort();
const base = { formId: 'zamer', formTitle: 'Test drive', fields, error: 'NETWORK: fetch failed' };
const failing = async () => {
  throw new Error('boom');
};
const readItem = async (id: string, sub = '') =>
  JSON.parse(await readFile(path.join(dir, sub, `${id}.json`), 'utf8')) as OutboxItem;

describe('outbox: id and delays', () => {
  it('id carries the creation time', () => {
    const id = newOutboxId(now);
    assert.match(id, /^20261024000000-[0-9a-f]{8}$/);
    assert.equal(idTime(id), now.getTime());
    assert.equal(idTime('garbage'), null);
  });
  it('the retry delay grows and caps at the last value', () => {
    assert.equal(backoffMs(1), 2 * 60_000);
    assert.equal(backoffMs(3), 15 * 60_000);
    assert.equal(backoffMs(99), 60 * 60_000);
  });
});

describe('outbox: enqueueing and counters', () => {
  it('enqueue writes json and file, count works by names', async () => {
    const item = await enqueueLead({ ...base, file: { name: 'a.pdf', bytes: pdf() } }, { dir, now });
    assert.equal(item.kind, 'lead');
    assert.equal(item.attempts, 1);
    assert.equal(item.nextAttemptAt, later(2).toISOString());
    assert.deepEqual(await names(), [`${item.id}.bin`, `${item.id}.json`]);
    assert.deepEqual(await countOutbox(dir, later(1)), { pending: 1, failed: 0, corrupt: 0, oldestAgeSec: 60 });
  });

  it('the id can be set in advance (it is also the lead originId)', async () => {
    const item = await enqueueLead({ ...base, id: '20261024000000-aaaaaaaa' }, { dir, now });
    assert.equal(item.id, '20261024000000-aaaaaaaa');
    assert.deepEqual(await names(), ['20261024000000-aaaaaaaa.json']);
  });

  it('an "attach file to lead" job is queued and removed', async () => {
    const task = await enqueueAttach(
      { leadId: 77, formId: 'compare', formTitle: 'Compare', file: { name: 'a.pdf', bytes: pdf() } },
      { dir, now },
    );
    assert.ok(task);
    assert.equal(task.kind, 'attach');
    assert.equal(task.leadId, 77);
    assert.equal(task.attempts, 0);
    assert.equal((await countOutbox(dir, now)).pending, 1);
    await removeItem(task.id, dir);
    assert.deepEqual(await names(), []);
  });
});

describe('outbox: processing', () => {
  it('does not touch an entry before its retry time', async () => {
    await enqueueLead(base, { dir, now });
    let calls = 0;
    const r = await processOutbox({
      dir,
      now: later(1),
      send: async () => {
        calls++;
      },
    });
    assert.equal(calls, 0);
    assert.deepEqual(r, { sent: 0, retried: 0, gaveUp: 0, corrupt: 0 });
  });

  it('success: sent with the file, cleaned up, onSent with a note', async () => {
    const item = await enqueueLead({ ...base, file: { name: 'a.pdf', bytes: pdf() } }, { dir, now });
    const got: { id: string; file?: string }[] = [];
    const sent: string[] = [];
    const r = await processOutbox({
      dir,
      now: later(3),
      send: async (i, f) => {
        got.push({ id: i.id, file: f && new TextDecoder().decode(f.bytes) });
        return 'lead 1';
      },
      onSent: async (i, info) => {
        sent.push(`${i.id}:${info}`);
      },
    });
    assert.deepEqual(r, { sent: 1, retried: 0, gaveUp: 0, corrupt: 0 });
    assert.deepEqual(got, [{ id: item.id, file: '%PDF-1.4' }]);
    assert.deepEqual(sent, [`${item.id}:lead 1`]);
    assert.deepEqual(await names(), []);
  });

  it('error: attempt counted, lastError with the code, retry on schedule', async () => {
    const item = await enqueueLead(base, { dir, now });
    const fail = async () => {
      throw Object.assign(new Error('fetch failed'), { code: 'NETWORK' });
    };
    assert.equal((await processOutbox({ dir, now: later(3), send: fail })).retried, 1);
    const saved = await readItem(item.id);
    assert.equal(saved.attempts, 2);
    assert.equal(saved.lastError, 'NETWORK: fetch failed');
    assert.equal(saved.nextAttemptAt, later(8).toISOString());
    // the second failure scheduled a retry in 5 minutes — minute 4 is too early
    assert.equal((await processOutbox({ dir, now: later(4), send: fail })).retried, 0);
    assert.equal((await processOutbox({ dir, now: later(9), send: fail })).retried, 1);
  });

  it('after the first error the pass stops — the rest wait for the next one', async () => {
    await enqueueLead({ ...base, formId: 'a' }, { dir, now });
    await enqueueLead({ ...base, formId: 'b' }, { dir, now: later(0.01) });
    let calls = 0;
    const r = await processOutbox({
      dir,
      now: later(3),
      send: async () => {
        calls++;
        throw new Error('down');
      },
    });
    assert.equal(calls, 1);
    assert.deepEqual([r.sent, r.retried], [0, 1]);
  });

  it('does not take an entry already being sent, returns a stuck one', async () => {
    const item = await enqueueLead(base, { dir, now });
    const claim = path.join(dir, `${item.id}.sending`);
    await rename(path.join(dir, `${item.id}.json`), claim);
    await utimes(claim, later(3), later(3));
    let calls = 0;
    const send = async () => {
      calls++;
    };
    await processOutbox({ dir, now: later(5), send });
    assert.equal(calls, 0, 'fresh .sending — someone else is sending');
    // 11 minutes after the claim — sending did not finish, the entry goes back to the queue
    await processOutbox({ dir, now: later(14), send });
    assert.deepEqual(await names(), [`${item.id}.json`]);
    await processOutbox({ dir, now: later(15), send });
    assert.equal(calls, 1);
    assert.deepEqual(await names(), []);
  });

  it('an unreadable entry goes to .corrupt and the counter', async () => {
    await writeFile(path.join(dir, '20261024000000-deadbeef.json'), '{not json', 'utf8');
    const r = await processOutbox({ dir, now, send: async () => {} });
    assert.equal(r.corrupt, 1);
    assert.deepEqual(await names(), ['20261024000000-deadbeef.json.corrupt']);
    assert.equal((await countOutbox(dir, now)).corrupt, 1);
  });

  it('older than a week — to failed with failedAt and a notification; failed is cleaned 30 days after giving up', async () => {
    const item = await enqueueLead(base, { dir, now: days(-8) });
    const gaveUp: string[] = [];
    const r = await processOutbox({
      dir,
      now,
      send: failing,
      onGiveUp: async (i) => {
        gaveUp.push(i.id);
      },
    });
    assert.equal(r.gaveUp, 1);
    assert.deepEqual(gaveUp, [item.id]);
    assert.equal((await readItem(item.id, 'failed')).failedAt, now.toISOString());
    const c = await countOutbox(dir, now);
    assert.deepEqual([c.pending, c.failed], [0, 1]);
    await processOutbox({ dir, now: days(29), send: failing });
    assert.equal((await countOutbox(dir)).failed, 1);
    await processOutbox({ dir, now: days(31), send: failing });
    assert.equal((await countOutbox(dir)).failed, 0);
  });

  it('an orphaned .bin older than a day is deleted, a fresh one stays', async () => {
    const orphan = path.join(dir, '20261024000000-0badf00d.bin');
    await writeFile(orphan, 'x');
    await utimes(orphan, days(-2), days(-2));
    const fresh = path.join(dir, '20261024000000-00000001.bin');
    await writeFile(fresh, 'y');
    await utimes(fresh, now, now);
    await processOutbox({ dir, now, send: async () => {} });
    assert.deepEqual(await names(), ['20261024000000-00000001.bin']);
  });
});
