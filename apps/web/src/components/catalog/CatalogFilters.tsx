'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useTransition, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { FilterOption, KitchenFilterOptions } from '@/lib/content/types';
import { routes } from '@/lib/routes';

export type CategoryCount = { slug: string; name: string; count: number };

/** URL keys of the inventory filters */
export const FILTER_KEYS = ['price', 'style', 'color', 'facade', 'sale', 'hit', 'tag'] as const;

type Props = {
  options: KitchenFilterOptions;
  /** Body types with the number of cars (links to the category pages) */
  categories: CategoryCount[];
  /** Current body type page */
  category?: string;
  /** The drawer shows "Updating…" while the URL change is being applied */
  onPendingChange?: (pending: boolean) => void;
  className?: string;
};

const ROW = 'flex min-h-11 cursor-pointer items-center gap-3 text-[15px]';
const INPUT =
  'size-[18px] shrink-0 cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/**
 * Inventory filters as lists of radios / checkboxes. State lives in the URL (?price=&style=…),
 * the page reads it on the server. Body types are links to the category pages (filters are kept).
 */
export function CatalogFilters({ options, categories, category, onPendingChange, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const uid = useId();

  useEffect(() => {
    onPendingChange?.(pending);
  }, [pending, onPendingChange]);

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

  const keep = new URLSearchParams(params.toString());
  keep.delete('page');
  const keepQs = keep.size ? `?${keep}` : '';
  const total = categories.reduce((s, c) => s + c.count, 0);

  const radios = (name: string, title: string, opts: FilterOption[], open: boolean) => {
    const current = params.get(name) ?? '';
    return (
      <Group title={title} open={open || !!current}>
        {[{ value: '', label: 'Any' }, ...opts].map((o) => {
          const id = `${uid}-${name}-${o.value || 'any'}`;
          return (
            <label key={id} htmlFor={id} className={ROW}>
              <input
                id={id}
                type="radio"
                name={`${uid}-${name}`}
                checked={current === o.value}
                onChange={() => apply({ [name]: o.value || null })}
                className={INPUT}
              />
              {o.label}
            </label>
          );
        })}
      </Group>
    );
  };

  const toggle = (name: 'sale' | 'hit', label: string) => {
    const id = `${uid}-${name}`;
    return (
      <label htmlFor={id} className={ROW}>
        <input
          id={id}
          type="checkbox"
          checked={params.get(name) === '1'}
          onChange={(e) => apply({ [name]: e.target.checked ? '1' : null })}
          className={INPUT}
        />
        {label}
      </label>
    );
  };

  return (
    <div className={cn('transition-opacity', pending && 'opacity-60', className)}>
      <Group title="Body type" open>
        {[{ slug: '', name: 'All body types', count: total }, ...categories].map((c) => {
          const active = (category ?? '') === c.slug;
          return (
            <Link
              key={c.slug || 'all'}
              href={`${c.slug ? routes.category(c.slug) : routes.catalog()}${keepQs}`}
              prefetch={false}
              aria-current={active ? 'page' : undefined}
              className={cn(ROW, '-mx-2 justify-between rounded-control px-2', active ? 'bg-surface font-semibold' : 'hover:bg-surface')}
            >
              <span>{c.name}</span>
              <span className="tabular text-sm text-fg-muted">{c.count}</span>
            </Link>
          );
        })}
      </Group>
      {radios('price', 'Price', options.price, true)}
      {radios('style', 'Fuel', options.style, true)}
      {radios('facade', 'Drivetrain', options.facade, false)}
      {radios('color', 'Color', options.color, false)}
      {options.tags.length > 0 && radios('tag', 'Collections', options.tags, false)}
      <Group title="More" open>
        {toggle('sale', 'Price drops only')}
        {toggle('hit', 'Popular picks')}
      </Group>
    </div>
  );
}

function Group({ title, open, children }: { title: string; open: boolean; children: ReactNode }) {
  return (
    <details open={open} className="group border-b border-line py-1 first:pt-0 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-control font-display text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        {title}
        <span aria-hidden className="text-fg-muted transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="pb-3">{children}</div>
    </details>
  );
}
