'use client';

import { useRouter } from 'next/navigation';
import { useId, useMemo, useState, type FormEvent } from 'react';
import { BodyTypeIcon } from '@/components/ui/BodyTypeIcon';
import { buttonClass } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/routes';

export type SearchCar = { category: string; price: number };
export type SearchCategory = { slug: string; name: string; shortName: string };

/* Payment mode: the max car price a monthly budget buys at the demo terms (5.9% APR, 72 months, $0 down) */
const APR = 0.059;
const MONTHS = 72;
const priceForPayment = (pmt: number) => {
  const r = APR / 12;
  return Math.round((pmt * (1 - (1 + r) ** -MONTHS)) / r);
};

const PRICE_BANDS = [
  { id: 'any', label: 'Any price', max: Infinity },
  { id: '15000', label: 'Up to $15,000', max: 15_000 },
  { id: '25000', label: 'Up to $25,000', max: 25_000 },
  { id: '40000', label: 'Up to $40,000', max: 40_000 },
];

const PAYMENT_BANDS = [
  { id: 'any', label: 'Any payment', max: Infinity },
  { id: '250', label: 'Up to $250/mo', max: priceForPayment(250) },
  { id: '400', label: 'Up to $400/mo', max: priceForPayment(400) },
  { id: '600', label: 'Up to $600/mo', max: priceForPayment(600) },
];

/** Catalog price filter key that covers a max price (keys from lib/content/labels.ts) */
const priceKey = (max: number) => (max === Infinity ? undefined : max <= 25_000 ? 'under-25k' : max <= 40_000 ? '25k-40k' : undefined);

const fieldCls =
  'h-12 w-full rounded-control border border-line bg-bg px-3 text-[15px] text-fg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25';

/**
 * Search-first hero card: Price / Monthly payment tabs, body type and budget, "Show N cars".
 * N is counted from the inventory passed by the server; the link goes to the catalog with matching filters.
 */
export function HeroSearch({ cars, categories }: { cars: SearchCar[]; categories: SearchCategory[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<'price' | 'payment'>('payment');
  const [category, setCategory] = useState('');
  const [band, setBand] = useState('any');
  const bodyId = useId();
  const budgetId = useId();

  const bands = mode === 'price' ? PRICE_BANDS : PAYMENT_BANDS;
  const max = (bands.find((b) => b.id === band) ?? bands[0]).max;
  const count = useMemo(
    () => cars.filter((c) => (!category || c.category === category) && c.price <= max).length,
    [cars, category, max],
  );

  const href = () => {
    const base = category ? routes.category(category) : routes.catalog();
    const key = priceKey(max);
    return key ? `${base}?price=${key}` : base;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push(href());
  };

  return (
    <div className="rounded-card bg-bg p-5 text-fg shadow-modal md:p-6">
      <div role="tablist" aria-label="Search by" className="grid grid-cols-2 rounded-control bg-surface p-1 text-sm font-semibold">
        {(['payment', 'price'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setBand('any');
            }}
            className={cn('min-h-10 rounded-[4px] transition-colors', mode === m ? 'bg-bg text-ink shadow-card' : 'text-fg-muted hover:text-fg')}
          >
            {m === 'payment' ? 'Monthly payment' : 'Price'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <label htmlFor={bodyId} className="mb-1 block text-xs font-semibold text-fg-muted uppercase">
            Body type
          </label>
          <select id={bodyId} value={category} onChange={(e) => setCategory(e.target.value)} className={fieldCls}>
            <option value="">All body types</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={budgetId} className="mb-1 block text-xs font-semibold text-fg-muted uppercase">
            {mode === 'payment' ? 'Monthly budget' : 'Budget'}
          </label>
          <select id={budgetId} value={band} onChange={(e) => setBand(e.target.value)} className={fieldCls}>
            {bands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={buttonClass('primary', 'lg', 'self-end whitespace-nowrap')} aria-live="polite">
          Show {count} {count === 1 ? 'car' : 'cars'}
        </button>
      </form>
      {mode === 'payment' && (
        <p className="mt-3 text-xs text-fg-muted">Est. at 5.9% APR, 72 months, $0 down, before taxes and fees.</p>
      )}

      <ul className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-5 sm:grid-cols-6">
        {categories.map((c) => {
          const active = category === c.slug;
          return (
            <li key={c.slug}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(active ? '' : c.slug)}
                className={cn(
                  'flex w-full flex-col items-center gap-1 rounded-control px-1 py-2 text-xs font-semibold transition-colors',
                  active ? 'bg-primary/10 text-primary' : 'text-fg-muted hover:bg-surface hover:text-fg',
                )}
              >
                <BodyTypeIcon slug={c.slug} className="h-7 w-11" />
                {c.shortName}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
