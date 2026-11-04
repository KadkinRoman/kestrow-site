'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Kitchen, KitchenCategory } from '@/lib/content/types';
import { KitchenCard } from './KitchenCard';
import { Rail } from './Rail';

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  kitchens: Kitchen[];
  /** If provided — category tabs above the rail */
  categories?: KitchenCategory[];
  perCategory?: number;
  footer?: ReactNode;
};

/** Vehicle rail with body-type tabs (home, About, Buyer's guide pages). */
export function KitchenRail({ title, subtitle, kitchens, categories, perCategory = 15, footer }: Props) {
  const [active, setActive] = useState(categories?.[0]?.slug);
  const list = (active ? kitchens.filter((k) => k.category.slug === active) : kitchens).slice(0, perCategory);

  const toolbar = categories?.length ? (
    <div role="group" aria-label="Body types" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      {categories.map((c) => (
        <button
          key={c.slug}
          type="button"
          aria-pressed={active === c.slug}
          onClick={() => setActive(c.slug)}
          className={cn(
            'min-h-10 shrink-0 rounded-control border px-4 text-sm transition-colors',
            active === c.slug ? 'border-fg bg-fg text-bg' : 'border-line hover:border-fg',
          )}
        >
          {c.shortName}
        </button>
      ))}
    </div>
  ) : undefined;

  return (
    <Rail title={title} subtitle={subtitle} toolbar={toolbar} footer={footer} key={active}>
      {list.map((k) => (
        <KitchenCard key={k.slug} kitchen={k} />
      ))}
    </Rail>
  );
}
