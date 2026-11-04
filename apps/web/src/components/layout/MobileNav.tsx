'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ModalButton } from '@/components/modals/ModalButton';
import { buttonClass } from '@/components/ui/Button';
import { BodyTypeIcon } from '@/components/ui/BodyTypeIcon';
import { cn } from '@/lib/cn';
import type { NavGroup, NavSection, SearchSuggestion } from '@/lib/nav';
import { SearchBox } from './HeaderSearch';
import { Layer } from './Layer';
import { ArrowIcon, ChevronIcon, CloseIcon, SearchIcon } from './NavIcons';
import { Logo } from './Brand';

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary';

function MobileGroup({ group, onNavigate }: { group: NavGroup; onNavigate: () => void }) {
  return (
    <div className="px-4 pb-3">
      {group.heading && <p className="pt-2 pb-1 text-xs font-bold tracking-[0.12em] text-fg-muted uppercase">{group.heading}</p>}
      {group.tiles ? (
        <ul className="grid grid-cols-2 gap-2">
          {group.links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={onNavigate}
                className={cn('flex min-h-14 items-center gap-3 rounded-card border border-line px-3 py-2', focus)}
              >
                <BodyTypeIcon slug={l.slug ?? ''} className="h-6 w-9 shrink-0 text-ink" />
                <span className="leading-tight">
                  <span className="block text-[15px] font-semibold">{l.label}</span>
                  <span className="tabular text-xs text-fg-muted">{l.count} cars</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul>
          {group.links.map((l) => (
            <li key={l.label}>
              <Link href={l.href} onClick={onNavigate} className={cn('block min-h-11 py-2', focus)}>
                <span className="text-base font-medium">{l.label}</span>
                {l.hint && <span className="block text-sm text-fg-muted">{l.hint}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** "Menu" button + full-screen panel (portal): search on top, accordion sections, sticky call / pre-approval row. */
export function MobileNav({
  open,
  setOpen,
  sections,
  suggestions,
  phone,
  phoneHref,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  sections: NavSection[];
  suggestions: SearchSuggestion[];
  phone: string;
  phoneHref: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-control border-[1.5px] border-ink bg-bg px-3.5 text-[15px] font-semibold text-ink transition-colors hover:bg-ink hover:text-on-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <svg viewBox="0 0 24 24" aria-hidden className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        Menu
      </button>

      <Layer open={open} onClose={close} label="Menu">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
          <Logo />
          <button
            type="button"
            onClick={close}
            className={buttonClass('secondary', 'md')}
          >
            <CloseIcon />
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4">
            <SearchBox suggestions={suggestions} onDone={close} inline large />
          </div>

          <nav aria-label="Main">
            <ul className="border-t border-line">
              {sections.map((s) => {
                if (!s.columns.length) {
                  return (
                    <li key={s.id} className="border-b border-line">
                      <Link
                        href={s.href}
                        onClick={close}
                        className={cn('flex min-h-14 items-center justify-between px-4 text-lg font-semibold', focus)}
                      >
                        {s.label}
                        <ArrowIcon className="text-fg-muted" />
                      </Link>
                    </li>
                  );
                }
                const isOpen = expanded === s.id;
                const panelId = `mobile-panel-${s.id}`;
                return (
                  <li key={s.id} className="border-b border-line">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setExpanded(isOpen ? null : s.id)}
                      className={cn('flex min-h-14 w-full items-center justify-between px-4 text-left text-lg font-semibold', focus)}
                    >
                      {s.label}
                      <ChevronIcon className={cn('size-5 text-fg-muted transition-transform duration-150', isOpen && 'rotate-180')} />
                    </button>
                    <div id={panelId} hidden={!isOpen}>
                      {s.columns.flat().map((g, i) => (
                        <MobileGroup key={i} group={g} onNavigate={close} />
                      ))}
                      {s.promo && (
                        <div className="px-4 pb-3">
                          <Link
                            href={s.promo.href}
                            onClick={close}
                            className={cn('flex items-center justify-between rounded-card bg-inverse px-4 py-3 text-on-inverse', focus)}
                          >
                            <span className="leading-tight">
                              <span className="block font-display text-xl">{s.promo.title}</span>
                              <span className="text-sm text-on-inverse-muted">{s.promo.cta}</span>
                            </span>
                            <ArrowIcon />
                          </Link>
                        </div>
                      )}
                      {s.footer && (
                        <div className="px-4 pb-4">
                          <Link
                            href={s.footer.href}
                            onClick={close}
                            className={cn('inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-primary', focus)}
                          >
                            {s.footer.label}
                            <ArrowIcon />
                          </Link>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="shrink-0 border-t border-line bg-bg px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex gap-2">
            <a href={phoneHref} className={buttonClass('secondary', 'md', 'flex-1')} aria-label={`Call us: ${phone}`}>
              Call us
            </a>
            <div className="flex flex-[1.4]" onClick={close}>
              <ModalButton
                className="flex-1"
                modal={{
                  type: 'lead',
                  title: 'Get pre-approved',
                  text: 'Tell us a little about yourself. We run a soft credit check that does not affect your credit score, and show your rate and monthly payment.',
                  form: { formId: 'payment', submitLabel: 'Check my rate' },
                }}
              >
                Get pre-approved
              </ModalButton>
            </div>
          </div>
        </div>
      </Layer>
    </>
  );
}

/** Search layer for phones (and the 1024–1279 px range, where the field does not fit in the header). */
export function SearchLayer({
  open,
  onClose,
  suggestions,
  quickLinks,
}: {
  open: boolean;
  onClose: () => void;
  suggestions: SearchSuggestion[];
  quickLinks: { label: string; href: string }[];
}) {
  return (
    <Layer open={open} onClose={onClose} label="Search cars">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-4">
        <SearchIcon className="shrink-0 text-fg-muted" />
        <p className="flex-1 font-display text-xl">Search cars</p>
        <button type="button" onClick={onClose} className={buttonClass('secondary', 'md')}>
          <CloseIcon />
          Close
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <SearchBox suggestions={suggestions} onDone={onClose} inline large autoFocus />
        <p className="mt-6 mb-2 text-xs font-bold tracking-[0.12em] text-fg-muted uppercase">Browse by body type</p>
        <ul className="flex flex-wrap gap-2">
          {quickLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={onClose}
                className="inline-flex min-h-11 items-center rounded-control border border-line px-4 text-[15px] font-medium hover:border-primary"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Layer>
  );
}
