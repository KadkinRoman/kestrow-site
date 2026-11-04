import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { SocialLink } from '@/lib/content/types';

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={cn('flex shrink-0 items-center gap-2.5 rounded-control', className)} aria-label="Kestrow Motors — home">
      <span
        aria-hidden
        className={cn(
          'flex size-9 items-center justify-center rounded-control font-display text-[28px] leading-none',
          dark ? 'bg-on-inverse text-ink' : 'bg-primary text-on-primary',
        )}
      >
        K
      </span>
      <span aria-hidden className="leading-none">
        <span className="block font-display text-[25px] tracking-[0.02em] uppercase">Kestrow</span>
        <span
          className={cn('mt-0.5 block text-[10px] font-semibold tracking-[0.32em] uppercase', dark ? 'text-on-inverse-muted' : 'text-fg-muted')}
        >
          Motors
        </span>
      </span>
    </Link>
  );
}

const SOCIAL_SHORT: Record<SocialLink['type'], string> = {
  instagram: 'IG',
  pinterest: 'PIN',
  facebook: 'FB',
  whatsapp: 'WA',
  telegram: 'TG',
  youtube: 'YT',
};

/** Messenger / social buttons. Icons will come from Figma — text labels for now. */
export function Socials({ items, dark, className }: { items: SocialLink[]; dark?: boolean; className?: string }) {
  return (
    <ul className={cn('flex items-center gap-2', className)}>
      {items.map((s) => (
        <li key={s.type}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={s.label}
            aria-label={s.label}
            className={cn(
              'flex size-9 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors',
              dark ? 'border-on-inverse/30 hover:bg-on-inverse/10' : 'border-line hover:border-fg',
            )}
          >
            {SOCIAL_SHORT[s.type]}
          </a>
        </li>
      ))}
    </ul>
  );
}
