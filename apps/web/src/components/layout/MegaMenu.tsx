import Link from 'next/link';
import { BodyTypeIcon } from '@/components/ui/BodyTypeIcon';
import { Container } from '@/components/ui/layout';
import { Photo } from '@/components/ui/Photo';
import { cn } from '@/lib/cn';
import type { NavGroup, NavSection } from '@/lib/nav';
import { ArrowIcon } from './NavIcons';

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

function Heading({ children }: { children: string }) {
  return <p className="mb-3 text-xs font-bold tracking-[0.12em] text-fg-muted uppercase">{children}</p>;
}

function Group({ group, onNavigate }: { group: NavGroup; onNavigate: () => void }) {
  if (group.tiles) {
    return (
      <div>
        {group.heading && <Heading>{group.heading}</Heading>}
        <ul className="grid grid-cols-3 gap-2">
          {group.links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={onNavigate}
                className={cn(
                  'flex h-full flex-col items-start gap-2 rounded-card border border-line p-3 transition-colors duration-150 hover:border-primary hover:bg-surface',
                  focus,
                )}
              >
                <BodyTypeIcon slug={l.slug ?? ''} className="text-ink" />
                <span className="text-[15px] leading-tight font-semibold">{l.label}</span>
                <span className="tabular -mt-1 text-xs text-fg-muted">{l.count} cars</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div>
      {group.heading && <Heading>{group.heading}</Heading>}
      <ul>
        {group.links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              onClick={onNavigate}
              className={cn('group/link -mx-2 block rounded-control px-2 py-2 transition-colors hover:bg-surface', focus)}
            >
              <span className="text-[15px] font-semibold group-hover/link:text-primary">{l.label}</span>
              {l.hint && <span className="block text-sm text-fg-muted">{l.hint}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Content of one mega panel (desktop): link groups in columns, an optional promo tile, a footer link. */
export function MegaPanel({ section, onNavigate }: { section: NavSection; onNavigate: () => void }) {
  const wide = !!section.promo;
  return (
    <Container className="py-6">
      <div
        className={cn(
          'grid gap-x-8 gap-y-6',
          wide ? 'grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)]' : 'max-w-4xl grid-cols-2',
        )}
      >
        {section.columns.map((col, i) => (
          <div key={i} className="space-y-6">
            {col.map((g, j) => (
              <Group key={j} group={g} onNavigate={onNavigate} />
            ))}
          </div>
        ))}

        {section.promo && (
          <Link
            href={section.promo.href}
            onClick={onNavigate}
            className={cn(
              'group flex flex-col overflow-hidden rounded-card bg-inverse text-on-inverse transition-shadow hover:shadow-card',
              focus,
            )}
          >
            <Photo media={section.promo.image} label={section.promo.image.alt} ratio="16/9" sizes="280px" rounded={false} />
            <span className="flex flex-1 flex-col gap-1 p-4">
              <span className="font-display text-2xl leading-none">{section.promo.title}</span>
              <span className="text-sm text-on-inverse-muted">{section.promo.text}</span>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold">
                {section.promo.cta}
                <ArrowIcon className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </span>
          </Link>
        )}
      </div>

      {section.footer && (
        <div className="mt-6 border-t border-line pt-4">
          <Link
            href={section.footer.href}
            onClick={onNavigate}
            className={cn('inline-flex items-center gap-1.5 rounded-control text-[15px] font-semibold text-primary hover:text-primary-hover', focus)}
          >
            {section.footer.label}
            <ArrowIcon />
          </Link>
        </div>
      )}
    </Container>
  );
}
