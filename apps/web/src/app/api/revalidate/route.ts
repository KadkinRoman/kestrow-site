import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * Content cache invalidation via a Strapi webhook (entry.create/update/delete/publish/unpublish).
 * Strapi registers the webhook itself on startup (apps/cms/src/bootstrap/revalidate-webhook.ts)
 * with the header x-revalidate-secret = REVALIDATE_SECRET.
 */
function secretOk(received: string | null) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    console.warn('[revalidate] REVALIDATE_SECRET is not set, so Strapi webhooks are rejected and the cache lives for up to an hour');
    return false;
  }
  if (!received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!secretOk(request.headers.get('x-revalidate-secret'))) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    event?: string;
    uid?: string;
    entry?: { publishedAt?: string | null };
  };

  // Saving a draft (Draft & Publish) does not change the site, so the cache is left alone
  const isDraftSave =
    (body.event === 'entry.create' || body.event === 'entry.update') && body.entry?.publishedAt === null;
  if (isDraftSave) return NextResponse.json({ ok: true, skipped: 'draft' });

  // Called from a webhook (not a Server Action): { expire: 0 } makes the next request get fresh data immediately.
  // There is little content, so we expire the whole 'strapi' tag and don't need to track relations (body type → cars, menus).
  revalidateTag('strapi', { expire: 0 });

  return NextResponse.json({ ok: true, event: body.event ?? null, uid: body.uid ?? null });
}
