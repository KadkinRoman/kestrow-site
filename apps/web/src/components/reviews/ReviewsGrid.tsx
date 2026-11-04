import Link from 'next/link';
import { Fragment } from 'react';
import { PromoCard, ReviewCard, ReviewTextCard } from '@/components/sections/Cards';
import { buttonClass } from '@/components/ui/Button';
import { getPromos, getReviews } from '@/lib/content';
import type { PromoPeriod } from '@/lib/format';

const PAGE_SIZE = 10;
/** After every five reviews — an offer card (frame: 6th and 12th cells) */
const PROMO_EVERY = 5;
const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * Reviews grid: text (source, neighborhood, ★, link) and video (preview → modal), with offers in between.
 * "Load more" — ?page=N (the first N×10 reviews); reads searchParams, so it sits inside <Suspense>.
 */
export async function ReviewsGrid({ searchParams, period }: { searchParams: SearchParams; period?: PromoPeriod }) {
  const [sp, reviews, promos] = await Promise.all([searchParams, getReviews(), getPromos()]);
  const page = Math.max(1, Math.floor(Number(one(sp.page))) || 1);
  const shown = reviews.slice(0, page * PAGE_SIZE);
  const hasMore = shown.length < reviews.length;
  // trade-in bonus (the main offer) goes first, then round-robin
  const promoList = [...promos].sort((a, b) => Number(b.isMain) - Number(a.isMain));

  if (!shown.length) return <p className="text-fg-muted">Reviews are coming soon.</p>;

  return (
    <>
      <div className={GRID}>
        {shown.map((r, i) => (
          <Fragment key={r.id}>
            {r.videoUrl ? <ReviewCard review={r} /> : <ReviewTextCard review={r} />}
            {promoList.length > 0 && (i + 1) % PROMO_EVERY === 0 && (
              <PromoCard promo={promoList[((i + 1) / PROMO_EVERY - 1) % promoList.length]} showTerm period={period} />
            )}
          </Fragment>
        ))}
      </div>
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Link href={`?page=${page + 1}`} scroll={false} className={buttonClass('secondary', 'lg')}>
            Load more
          </Link>
        </div>
      )}
    </>
  );
}

export function ReviewsGridSkeleton() {
  return (
    <div aria-busy className={GRID}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="min-h-56 animate-pulse rounded-card bg-surface" />
      ))}
    </div>
  );
}
