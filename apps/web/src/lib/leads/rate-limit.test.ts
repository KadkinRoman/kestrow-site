import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { allow, ipKey, isLimited, record } from './rate-limit';

const key = (prefix: string) => `${prefix}:${Math.random().toString(36).slice(2)}`;

describe('rate-limit', () => {
  it('lets `limit` events through in the window and blocks the next one', () => {
    const k = key('ip');
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) assert.equal(allow(k, 5, 60_000, now + i), true);
    assert.equal(allow(k, 5, 60_000, now + 10), false);
    assert.equal(isLimited(k, 5, 60_000, now + 10), true);
  });

  it('the window expires', () => {
    const k = key('ip');
    for (let i = 0; i < 3; i++) record(k, 60_000, 1_000);
    assert.equal(isLimited(k, 3, 60_000, 30_000), true);
    assert.equal(isLimited(k, 3, 60_000, 61_001), false);
  });

  it('isLimited counts nothing, record counts', () => {
    const k = key('phone');
    assert.equal(isLimited(k, 1, 60_000, 0), false);
    assert.equal(isLimited(k, 1, 60_000, 0), false);
    record(k, 60_000, 0);
    assert.equal(isLimited(k, 1, 60_000, 1), true);
  });
});

describe('ipKey', () => {
  it('IPv4 as is, including IPv4 mapped into IPv6', () => {
    assert.equal(ipKey('203.0.113.7'), '203.0.113.7');
    assert.equal(ipKey('::ffff:203.0.113.7'), '203.0.113.7');
    assert.equal(ipKey('unknown'), 'unknown');
  });
  it('IPv6 per /64 network', () => {
    assert.equal(ipKey('2001:db8:abcd:12:1:2:3:4'), '2001:db8:abcd:12::/64');
    assert.equal(ipKey('2001:DB8::1'), '2001:db8:0:0::/64');
    assert.equal(ipKey('2001:db8:abcd:12::9'), ipKey('2001:db8:abcd:12:ffff::1'));
    assert.notEqual(ipKey('2001:db8:abcd:12::9'), ipKey('2001:db8:abcd:13::9'));
  });
});
