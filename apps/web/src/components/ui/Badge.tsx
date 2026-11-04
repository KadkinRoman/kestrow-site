import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Badge({
  children,
  tone = 'accent',
  className,
}: {
  children: ReactNode;
  /** accent — signal orange (price drop), success — green (great price), ink — dark (just arrived), light — neutral */
  tone?: 'accent' | 'light' | 'success' | 'ink';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-badge px-2 py-1 text-[11px] font-bold tracking-wide uppercase',
        tone === 'accent' && 'bg-accent text-on-accent',
        tone === 'success' && 'bg-success text-white',
        tone === 'ink' && 'bg-ink text-white',
        tone === 'light' && 'bg-bg text-fg ring-1 ring-line',
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
        <li key={c} className="rounded-badge bg-surface px-2.5 py-1 text-sm font-medium">
          {c}
        </li>
      ))}
    </ul>
  );
}
