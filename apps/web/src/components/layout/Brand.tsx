import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { SocialLink } from '@/lib/content/types';

export function Logo({ tagline, className, dark }: { tagline?: string; className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={cn('flex shrink-0 items-center gap-3', className)} aria-label="Kestrow Motors — home">
      <span
        aria-hidden
        className={cn(
          'flex size-10 items-center justify-center rounded-[11px] font-display text-[26px] leading-none',
          dark ? 'bg-on-inverse text-inverse' : 'bg-primary text-on-primary',
        )}
      >
        K
      </span>
      <span className="leading-none">
        <span className="block font-display text-[27px] tracking-[-0.01em]">Kestrow</span>
        {tagline && (
          <small className={cn('mt-1 hidden text-[11px] tracking-[0.14em] uppercase sm:block xl:hidden 2xl:block', dark ? 'text-on-inverse-muted' : 'text-fg-muted')}>
            {tagline}
          </small>
        )}
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
