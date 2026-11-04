'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { Promo, PromoKind } from '@/lib/content/types';
import type { PromoPeriod } from '@/lib/format';
import { PromoCard } from './Cards';

const FILTERS: { value: PromoKind | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'sale', label: 'Deals' },
  { value: 'gift', label: 'Bonuses' },
];

/** Offers grid with an "All / Deals / Bonuses" filter. period — the shared term from settings. */
export function PromoGrid({ promos, period }: { promos: Promo[]; period?: PromoPeriod }) {
  const [filter, setFilter] = useState<PromoKind | 'all'>('all');
  const list = filter === 'all' ? promos : promos.filter((p) => p.kind === filter);

  return (
    <>
      <div role="group" aria-label="Offer type" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'min-h-10 rounded-control border px-4 text-sm transition-colors',
              filter === f.value ? 'border-fg bg-fg text-bg' : 'border-line hover:border-fg',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {list.map((p) => (
          <PromoCard key={p.slug} promo={p} showTerm period={period} />
        ))}
      </div>
    </>
  );
}
