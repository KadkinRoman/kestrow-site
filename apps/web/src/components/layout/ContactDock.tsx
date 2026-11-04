'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import type { SocialLink } from '@/lib/content/types';

const MESSENGERS = new Set<SocialLink['type']>(['whatsapp', 'telegram']);

/**
 * Floating "Contact" button in the bottom-right corner: phone and messengers from the site settings.
 * Icons will come from Figma — text labels for now.
 */
export function ContactDock({ phone, phoneHref, socials }: { phone: string; phoneHref: string; socials: SocialLink[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const messengers = socials.filter((s) => MESSENGERS.has(s.type));

  // Close on navigation to another page
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  // cn doesn't merge Tailwind classes — so no buttonClass + overrides
  const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
  const link = cn(
    'flex min-h-11 w-full items-center gap-2 rounded-control border border-fg/25 px-4 text-[15px] font-medium',
    'text-fg transition-colors hover:border-fg',
    focus,
  );

  return (
    <div ref={rootRef} className="fixed right-6 bottom-6 z-30 hidden flex-col items-end gap-3 md:flex print:hidden">
      <div
        id={panelId}
        hidden={!open}
        className="w-64 rounded-card border border-line bg-bg p-3 shadow-modal"
      >
        <p className="px-1 pb-2 text-sm text-fg-muted">Contact us</p>
        <ul className="flex flex-col gap-2">
          <li>
            <a href={phoneHref} className={link} onClick={() => setOpen(false)}>
              <span aria-hidden>📞</span>
              {phone}
            </a>
          </li>
          {messengers.map((s) => (
            <li key={s.type}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={link}
                onClick={() => setOpen(false)}
              >
                Message us on {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          'inline-flex min-h-13 items-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-on-primary',
          'shadow-card transition-colors hover:bg-primary-hover',
          focus,
        )}
      >
        <span aria-hidden>{open ? '✕' : '💬'}</span>
        {open ? 'Close' : 'Contact'}
      </button>
    </div>
  );
}
