'use client';

import { Children, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** How many cards are visible on different screens */
const ITEM_WIDTH = {
  /** vehicle cards: 1.15 / 2 / 3 / 4 */
  cards: 'w-[85%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2*1.25rem)/3)] xl:w-[calc((100%-3*1.25rem)/4)]',
  /** offers: 1.1 / 2 / 3 */
  wide: 'w-[88%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2*1.25rem)/3)]',
  /** vertical video reviews: 2.2 / 3 / 4 / 5 */
  narrow:
    'w-[44%] sm:w-[calc((100%-2*1rem)/3)] lg:w-[calc((100%-3*1.25rem)/4)] xl:w-[calc((100%-4*1.25rem)/5)]',
  /** team photos: 1.2 / 2 / 2.4 */
  team: 'w-[82%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-1.25rem)/2.4)]',
} as const;

export type RailVariant = keyof typeof ITEM_WIDTH;

type Props = {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Below the heading: review links, category tabs, etc. */
  toolbar?: ReactNode;
  /** Below the rail: "View all" button */
  footer?: ReactNode;
  variant?: RailVariant;
  ariaLabel?: string;
  children: ReactNode;
};

/** Horizontal rail (slider) on CSS scroll-snap with arrows. No external libraries. */
export function Rail({ title, subtitle, toolbar, footer, variant = 'cards', ariaLabel, children }: Props) {
  const ref = useRef<HTMLUListElement>(null);
  const items = Children.toArray(children);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div className="max-w-3xl">
          {title && <h2 className="text-2xl font-semibold md:text-4xl">{title}</h2>}
          {subtitle && <p className="mt-3 text-fg-muted md:text-lg">{subtitle}</p>}
        </div>
        <div className="hidden shrink-0 gap-2 md:flex">
          <ArrowButton label="Previous" onClick={() => scroll(-1)}>
            ←
          </ArrowButton>
          <ArrowButton label="Next" onClick={() => scroll(1)}>
            →
          </ArrowButton>
        </div>
      </div>

      {toolbar && <div className="mt-4">{toolbar}</div>}

      <ul
        ref={ref}
        aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
        className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:gap-5"
      >
        {items.map((child, i) => (
          <li key={i} className={cn('shrink-0 snap-start', ITEM_WIDTH[variant])}>
            {child}
          </li>
        ))}
      </ul>

      {footer && <div className="mt-6 flex flex-wrap gap-3">{footer}</div>}
    </div>
  );
}

function ArrowButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-full border border-line text-lg transition-colors hover:border-fg"
    >
      {children}
    </button>
  );
}
