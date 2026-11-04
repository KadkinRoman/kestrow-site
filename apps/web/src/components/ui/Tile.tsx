import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Props = {
  title: ReactNode;
  text?: ReactNode;
  /** Check-mark icon in a circle */
  icon?: boolean;
  number?: ReactNode;
  media?: ReactNode;
  footer?: ReactNode;
  href?: string;
  more?: string;
  dark?: boolean;
  className?: string;
};

/** Tile card: benefits, warranties, service items. */
export function Tile({ title, text, icon, number, media, footer, href, more, dark, className }: Props) {
  const content = (
    <>
      {media}
      {icon && (
        <div className={cn('mb-4 flex size-11 items-center justify-center rounded-control', dark ? 'bg-primary text-white' : 'bg-primary/10 text-primary')} aria-hidden>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10.5l4 4 8-9" />
          </svg>
        </div>
      )}
      {number !== undefined && <div className="mb-3 text-2xl font-semibold text-fg-muted">{number}</div>}
      <h3 className="text-lg font-semibold tracking-[-0.01em]">{title}</h3>
      {text && <div className={cn('mt-2 text-[15px]', dark ? 'text-on-inverse-muted' : 'text-fg-muted')}>{text}</div>}
      {footer}
      {more && <span className="mt-auto pt-4 text-sm font-medium">{more}</span>}
    </>
  );

  const cls = cn(
    'flex h-full flex-col rounded-card p-5 md:p-6',
    dark ? 'bg-inverse text-on-inverse' : 'border border-line/70 bg-paper',
    href && 'transition duration-150 hover:-translate-y-0.5 hover:border-primary',
    className,
  );

  return href ? (
    <Link href={href} className={cls}>
      {content}
    </Link>
  ) : (
    <div className={cls}>{content}</div>
  );
}

const gridCols = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-5',
} as const;

export function TileGrid({
  cols = 3,
  children,
  className,
}: {
  cols?: keyof typeof gridCols;
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('grid gap-4 md:gap-5', gridCols[cols], className)}>{children}</div>;
}
