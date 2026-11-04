import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Faq as FaqItem, OrderStage, Spec } from '@/lib/content/types';

/** Steps (order, payment, warranty…): 01, 02, 03 … */
export function Steps({ items, labels, className }: { items: OrderStage[]; labels?: string[]; className?: string }) {
  const cols =
    items.length >= 6 ? 'lg:grid-cols-6' : items.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4';
  return (
    <ol className={cn('mt-8 grid gap-4 sm:grid-cols-2', cols, className)}>
      {items.map((s, i) => (
        <li key={s.id} className="relative rounded-card border border-line border-t-4 border-t-primary bg-paper p-5">
          <div className="flex items-baseline justify-between gap-3">
            <b className="font-display text-4xl text-primary tabular">{String(i + 1).padStart(2, '0')}</b>
            {labels?.[i] && <span className="text-xs font-medium tracking-wide text-fg-muted uppercase">{labels[i]}</span>}
          </div>
          <h3 className="mt-3 font-semibold">{s.title}</h3>
          {s.text && <p className="mt-2 text-sm text-fg-muted">{s.text}</p>}
        </li>
      ))}
    </ol>
  );
}

/** FAQ accordion on <details>: works without JS, name — only one item open at a time. */
export function Faq({ items, name = 'faq' }: { items: FaqItem[]; name?: string }) {
  return (
    <div className="mt-8 divide-y divide-line border-y border-line">
      {items.map((f) => (
        <details key={f.id} name={name} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold">
            {f.question}
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-control bg-surface text-primary transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="max-w-3xl pb-6 text-fg-muted md:text-lg">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

/** Marquee with company figures. */
export function Ticker({ items }: { items: [value: string, label: string][] }) {
  const row = items.map(([v, l]) => (
    <span key={v + l} className="flex shrink-0 items-baseline gap-2 px-6">
      <b className="font-display text-3xl font-normal md:text-4xl">{v}</b>
      <span className="text-fg-muted">{l}</span>
    </span>
  ));
  return (
    <div className="overflow-hidden border-y border-line py-6" aria-label="Company figures">
      <div className="flex w-max animate-ticker">
        {row}
        <div aria-hidden className="flex">
          {row}
        </div>
      </div>
    </div>
  );
}

/** Row of links: "Other services", "You may also like". */
export function LinksRow({ links }: { links: { href: string; label: string }[] }) {
  return (
    <ul className="mt-6 flex flex-wrap gap-3">
      {links.map((l) => (
        <li key={l.href}>
          <Link
            href={l.href}
            className="inline-flex min-h-11 items-center rounded-control border border-line px-5 transition-colors hover:border-fg"
          >
            {l.label} →
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Specs grid: "key — value". */
export function SpecsGrid({ specs, className }: { specs: Spec[]; className?: string }) {
  return (
    <dl className={cn('grid gap-x-10 sm:grid-cols-2', className)}>
      {specs.map((s) => (
        <div key={s.label} className="flex justify-between gap-6 border-b border-line py-3">
          <dt className="text-fg-muted">{s.label}</dt>
          <dd className="text-right">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** List with check marks (or crosses). */
export function CheckList({ items, negative }: { items: ReactNode[]; negative?: boolean }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className={cn('mt-0.5 shrink-0', negative ? 'text-fg-muted' : 'text-success')}>
            {negative ? '—' : '✓'}
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
