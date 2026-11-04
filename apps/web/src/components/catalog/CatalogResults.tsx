import Link from 'next/link';
import { Fragment } from 'react';
import { CatalogPromoCard, KitchenCard } from '@/components/sections/KitchenCard';
import { buttonClass } from '@/components/ui/Button';
import { CATALOG_PAGE_SIZE, getKitchenTags, getKitchens } from '@/lib/content';
import { COLOR_LABELS, FACADE_LABELS, PRICE_RANGES, STYLE_LABELS } from '@/lib/content/labels';
import type { KitchenFilterOptions, KitchenFilters } from '@/lib/content/types';
import { routes } from '@/lib/routes';
import type { CategoryCount } from './CatalogFilters';
import { FilterDrawer } from './FilterDrawer';

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
const PROMO_EVERY = 6;

const GRID = 'grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Active filters as removable pills: label + URL key */
function activePills(filters: KitchenFilters, tagNames: Record<string, string>) {
  const pills: { key: string; label: string }[] = [];
  if (filters.price) pills.push({ key: 'price', label: PRICE_RANGES[filters.price].label });
  if (filters.style) pills.push({ key: 'style', label: cap(STYLE_LABELS[filters.style]) });
  if (filters.facade) pills.push({ key: 'facade', label: FACADE_LABELS[filters.facade] });
  if (filters.color) pills.push({ key: 'color', label: cap(COLOR_LABELS[filters.color]) });
  if (filters.tag) pills.push({ key: 'tag', label: tagNames[filters.tag] ?? filters.tag });
  if (filters.sale) pills.push({ key: 'sale', label: 'Price drops only' });
  if (filters.hit) pills.push({ key: 'hit', label: 'Popular picks' });
  return pills;
}

/**
 * Result bar + vehicle grid honoring the URL filters. Reads searchParams, so it renders
 * inside <Suspense> (Cache Components): the rest of the page stays in the static shell.
 */
export async function CatalogResults({
  category,
  searchParams,
  options,
  categories,
}: {
  category?: string;
  searchParams: Promise<CatalogSearchParams>;
  options: KitchenFilterOptions;
  categories: CategoryCount[];
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

  const base = category ? routes.category(category) : routes.catalog();
  const withoutKey = (key: string) => {
    const q = new URLSearchParams(
      Object.entries(sp).flatMap(([k, v]) => (typeof v === 'string' && k !== key && k !== 'page' ? [[k, v]] : [])),
    );
    return q.size ? `${base}?${q}` : base;
  };
  const pills = activePills(filters, Object.fromEntries(tags.map((t) => [t.slug, t.name])));

  const nextParams = new URLSearchParams(
    Object.entries(sp).flatMap(([k, v]) => (typeof v === 'string' && k !== 'page' ? [[k, v]] : [])),
  );
  nextParams.set('page', String(last + 1));
  const hasMore = last < first.pageCount;
  const noun = result.total === 1 ? 'car' : 'cars';

  return (
    <>
      <FilterDrawer options={options} categories={categories} category={category} total={result.total} />

      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="tabular font-display text-2xl" aria-live="polite">
          {result.total} {noun}
        </p>
        {pills.length > 0 && (
          <>
            <ul aria-label="Active filters" className="flex flex-wrap items-center gap-2">
              {pills.map((p) => (
                <li key={p.key}>
                  <Link
                    href={withoutKey(p.key)}
                    scroll={false}
                    aria-label={`Remove filter: ${p.label}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-bg pr-3 pl-4 text-sm font-medium transition-colors hover:border-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-9"
                  >
                    {p.label}
                    <span aria-hidden className="text-base leading-none text-fg-muted">
                      ×
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={base}
              scroll={false}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline sm:min-h-9"
            >
              Clear all
            </Link>
          </>
        )}
      </div>

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
          <p className="mt-2 text-fg-muted">Clear some filters or send a request — we will find a car for you by hand.</p>
          {pills.length > 0 && (
            <Link href={base} scroll={false} className={buttonClass('secondary', 'md', 'mt-4')}>
              Clear all filters
            </Link>
          )}
        </div>
      )}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Link href={`?${nextParams}`} scroll={false} className={buttonClass('secondary', 'lg')}>
            Load more
          </Link>
        </div>
      )}
      <p className="mt-8 text-xs text-fg-muted">
        *Est. payment: 5.9% APR, 72 months, $0 down, before taxes and fees.
      </p>
    </>
  );
}

/** Grid placeholder while loading (part of the static shell). */
export function CatalogResultsSkeleton() {
  return (
    <div aria-busy>
      <div className="mb-5 h-8 w-32 animate-pulse rounded-badge bg-surface" />
      <div className={GRID}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-card bg-surface" />
        ))}
      </div>
    </div>
  );
}
