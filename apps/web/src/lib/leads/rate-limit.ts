/**
 * In-process rate limiting for requests: at most `limit` events per `windowMs` per key
 * (IP, phone). Reset on restart; that is enough for a single process on a VPS.
 */
const hits = new Map<string, number[]>();

/** Hard cap on the number of keys: when exceeded, stale ones are pruned first, then the oldest */
const MAX_KEYS = 5000;

const recent = (key: string, windowMs: number, now: number) =>
  (hits.get(key) ?? []).filter((t) => now - t < windowMs);

/** true — the limit is exhausted (counts nothing) */
export function isLimited(key: string, limit: number, windowMs: number, now = Date.now()) {
  return recent(key, windowMs, now).length >= limit;
}

/** Count an event */
export function record(key: string, windowMs: number, now = Date.now()) {
  const list = recent(key, windowMs, now);
  list.push(now);
  hits.delete(key); // Map insertion order = recency of the last event
  hits.set(key, list);
  if (hits.size > MAX_KEYS) prune(windowMs, now);
}

/** Check and count at once: true — allowed */
export function allow(key: string, limit: number, windowMs: number, now = Date.now()) {
  if (isLimited(key, limit, windowMs, now)) return false;
  record(key, windowMs, now);
  return true;
}

function prune(windowMs: number, now: number) {
  for (const [key, list] of hits) {
    if (!list.some((t) => now - t < windowMs)) hits.delete(key);
  }
  for (const key of hits.keys()) {
    if (hits.size <= MAX_KEYS * 0.8) break;
    hits.delete(key);
  }
}

/**
 * Rate-limit key for an address. IPv6 is counted per /64 network (one client has many addresses), IPv4 as is;
 * IPv4 mapped into IPv6 (::ffff:1.2.3.4) counts as IPv4.
 */
export function ipKey(ip: string) {
  if (!ip.includes(':')) return ip;
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
  if (mapped) return mapped[1];
  const [head, tail = ''] = ip.split('::');
  const h = head ? head.split(':') : [];
  const t = tail ? tail.split(':') : [];
  const groups = [...h, ...Array<string>(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t];
  return `${groups
    .slice(0, 4)
    .map((g) => g.toLowerCase().replace(/^0+(?=.)/, ''))
    .join(':')}::/64`;
}
