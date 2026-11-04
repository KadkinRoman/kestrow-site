import Link from 'next/link';
import { Fragment } from 'react';
import { CatalogPromoCard, KitchenCard } from '@/components/sections/KitchenCard';
import { buttonClass } from '@/components/ui/Button';
import { CATALOG_PAGE_SIZE, getKitchenTags, getKitchens } from '@/lib/content';
import { COLOR_LABELS, FACADE_LABELS, PRICE_RANGES, STYLE_LABELS } from '@/lib/content/labels';
import type { KitchenFilters } from '@/lib/content/types';

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Known keys only: arbitrary URL values do not create cache entries or Strapi requests */
const known = (dict: object, v: string | undefined) => (v && Object.hasOwn(dict, v) ? v : undefined);

/** Page number from the URL: an integer ≥ 1 */
export const pageParam = (v: string | string[] | undefined) => Math.max(1, Math.floor(Number(one(v))) || 1);

/** tagSlugs — collections from Strapi: unknown ?tag= values are dropped */
export function parseCatalogParams(sp: CatalogSearchParams, tagSlugs: string[] = []) {
  const tag = one(sp.tag);
  const filters: KitchenFilters = {
    price: known(PRICE_RANGES, one(sp.price)),
    style: known(STYLE_LABELS, one(sp.style)),
    color: known(COLOR_LABELS, one(sp.color)),
    facade: known(FACADE_LABELS, one(sp.facade)),
    sale: one(sp.sale) === '1',
    hit: one(sp.hit) === '1',
    tag: tag && tagSlugs.includes(tag) ? tag : undefined,
  };
  return { filters, page: pageParam(sp.page) };
}

/** A promo card is inserted into the grid every N cards */
const PROMO_EVERY = 5;

const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4';

/**
 * Vehicle grid honoring the URL filters. Reads searchParams, so it renders
 * inside <Suspense> (Cache Components): the rest of the page stays in the static shell.
 */
export async function CatalogResults({
  category,
  searchParams,
}: {
  category?: string;
  searchParams: Promise<CatalogSearchParams>;
}) {
  const [sp, tags] = await Promise.all([searchParams, getKitchenTags()]);
  const { filters, page } = parseCatalogParams(sp, tags.map((t) => t.slug));
  // "Load more": ?page=N shows pages 1..N (each is a separate cacheable Strapi request),
  // N is capped at the real number of pages
  const load = (p: number) => getKitchens({ ...filters, category }, { page: p, pageSize: CATALOG_PAGE_SIZE });
  const first = await load(1);
  const last = Math.min(page, first.pageCount);
  const rest = await Promise.all(Array.from({ length: last - 1 }, (_, i) => load(i + 2)));
  const result = { items: [first, ...rest].flatMap((p) => p.items), total: first.total };

  const nextParams = new URLSearchParams(
    Object.entries(sp).flatMap(([k, v]) => (typeof v === 'string' && k !== 'page' ? [[k, v]] : [])),
  );
  nextParams.set('page', String(last + 1));
  const hasMore = last < first.pageCount;

  return (
    <>
      <p className="mb-4 text-sm text-fg-muted" aria-live="polite">
        {result.total} {result.total === 1 ? 'car' : 'cars'} found
      </p>
      {result.items.length ? (
        <div className={GRID}>
          {result.items.map((k, i) => (
            <Fragment key={k.slug}>
              <KitchenCard kitchen={k} />
              {(i + 1) % PROMO_EVERY === 0 && i < result.items.length - 1 && (
                <CatalogPromoCard variant={((i + 1) / PROMO_EVERY) % 2 ? 'promo' : 'quiz'} />
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="rounded-card bg-surface p-8 text-center">
          <p className="text-lg font-semibold">Nothing matches the selected filters</p>
          <p className="mt-2 text-fg-muted">Reset some filters or send a request — we will find a car for you by hand.</p>
        </div>
      )}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Link href={`?${nextParams}`} scroll={false} className={buttonClass('secondary', 'lg')}>
            Load more
          </Link>
        </div>
      )}
    </>
  );
}

/** Grid placeholder while loading (part of the static shell). */
export function CatalogResultsSkeleton() {
  return (
    <div aria-busy className={GRID}>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="aspect-[3/4] animate-pulse rounded-card bg-surface" />
      ))}
    </div>
  );
}
