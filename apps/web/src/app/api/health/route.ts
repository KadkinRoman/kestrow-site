import { NextResponse } from 'next/server';
import { countOutbox, probeOutbox } from '@/lib/leads/outbox';
import { strapiBaseUrl } from '@/lib/strapi/client';

/**
 * Liveness check for monitoring: the lead queue (size, age, writability) and Strapi.
 * 503 means the queue is unreadable or not writable (leads would be lost if Bitrix24 fails), or requests
 * have waited longer than STUCK_SEC. Strapi being "down" does not fail the status by itself: the site serves pages from cache and forms
 * work from the fallback definition. Expensive checks are cached for CACHE_MS, since the endpoint is public and may be polled often.
 */
const STUCK_SEC = 15 * 60;
const STRAPI_TIMEOUT_MS = 2_000;
const CACHE_MS = 30_000;

function cached<T>(fn: () => Promise<T>) {
  let last: { at: number; value: T } | null = null;
  return async () => {
    if (last && Date.now() - last.at < CACHE_MS) return last.value;
    const value = await fn();
    last = { at: Date.now(), value };
    return value;
  };
}

const strapiHealth = cached(async (): Promise<'ok' | 'down'> => {
  try {
    const res = await fetch(`${strapiBaseUrl()}/_health`, { signal: AbortSignal.timeout(STRAPI_TIMEOUT_MS), cache: 'no-store' });
    return res.ok ? 'ok' : 'down';
  } catch {
    return 'down';
  }
});

const outboxWritable = cached(() => probeOutbox());

export async function GET() {
  const [outbox, writable, strapi] = await Promise.all([
    countOutbox().catch((e: unknown) => {
      console.error('[health] queue is unreadable:', e instanceof Error ? e.message : e);
      return null;
    }),
    outboxWritable(),
    strapiHealth(),
  ]);
  const stuck = outbox !== null && outbox.pending > 0 && (outbox.oldestAgeSec ?? 0) > STUCK_SEC;
  const ok = outbox !== null && writable && !stuck;

  return NextResponse.json(
    {
      ok,
      time: new Date().toISOString(),
      uptimeSec: Math.round(process.uptime()),
      outbox: outbox && { ...outbox, writable },
      strapi,
    },
    { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
