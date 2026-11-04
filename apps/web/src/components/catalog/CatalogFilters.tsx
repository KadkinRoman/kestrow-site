'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/cn';
import type { FilterOption, KitchenFilterOptions } from '@/lib/content/types';

type Option = FilterOption;

type Props = { options: KitchenFilterOptions };

/** Quick picks: fixed ones + collections from Strapi (kitchen-tag: "Under 30,000 miles", "Family-friendly") */
const QUICK_BASE: { label: string; params: Record<string, string> }[] = [
  { label: 'Under $25,000', params: { price: 'under-25k' } },
  { label: 'Price drops', params: { sale: '1' } },
  { label: 'Popular', params: { hit: '1' } },
];

const FILTER_KEYS = ['price', 'style', 'color', 'facade', 'sale', 'hit', 'tag'];

/** Inventory filters. State lives in the URL (?price=&style=…); the page reads it on the server. */
export function CatalogFilters({ options }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function apply(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete('page'); // a new filter starts from the first page
    const qs = sp.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  const quick = [...QUICK_BASE, ...options.tags.map((t) => ({ label: t.label, params: { tag: t.value } }))];
  const isQuickActive = (q: Record<string, string>) => Object.entries(q).every(([k, v]) => params.get(k) === v);
  const hasFilters = FILTER_KEYS.some((k) => params.has(k));

  const select = (name: string, label: string, opts: Option[]) => (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={params.get(name) ?? ''}
        onChange={(e) => apply({ [name]: e.target.value || null })}
        className="min-h-11 w-full appearance-none rounded-control border border-line bg-bg pr-9 pl-4 text-[15px]"
      >
        <option value="">{label}</option>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-fg-muted">
        ▾
      </span>
    </label>
  );

  return (
    <div className={cn('space-y-4 transition-opacity', pending && 'opacity-60')}>
      <div>
        <div className="mb-2 text-sm text-fg-muted">Quick picks</div>
        <div className="flex flex-wrap gap-2">
          {quick.map((q) => {
            const active = isQuickActive(q.params);
            return (
              <button
                key={q.label}
                type="button"
                aria-pressed={active}
                onClick={() => apply(Object.fromEntries(Object.entries(q.params).map(([k, v]) => [k, active ? null : v])))}
                className={cn(
                  'min-h-10 rounded-control border px-4 text-sm transition-colors',
                  active ? 'border-fg bg-fg text-bg' : 'border-line hover:border-fg',
                )}
              >
                {q.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto_auto]">
        {select('price', 'Price', options.price)}
        {select('style', 'Fuel', options.style)}
        {select('color', 'Color', options.color)}
        {select('facade', 'Drivetrain', options.facade)}
        <label className="flex min-h-11 items-center gap-2 px-1 text-[15px]">
          <input
            type="checkbox"
            checked={params.get('sale') === '1'}
            onChange={(e) => apply({ sale: e.target.checked ? '1' : null })}
          />
          Price drops only
        </label>
        {hasFilters && (
          <button
            type="button"
            onClick={() => apply(Object.fromEntries(FILTER_KEYS.map((k) => [k, null])))}
            className="min-h-11 px-2 text-sm text-fg-muted underline underline-offset-2 hover:text-fg"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
