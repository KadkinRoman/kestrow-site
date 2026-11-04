import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Badge({
  children,
  tone = 'accent',
  className,
}: {
  children: ReactNode;
  tone?: 'accent' | 'light';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-control px-2.5 py-1 text-xs font-semibold',
        tone === 'accent' ? 'bg-accent text-on-accent' : 'bg-bg text-fg ring-1 ring-line',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ChipList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {items.map((c) => (
        <li key={c} className="rounded-control border border-line px-3 py-1 text-sm">
          {c}
        </li>
      ))}
    </ul>
  );
}
