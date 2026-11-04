'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import type { NavSection } from '@/lib/nav';
import { MegaPanel } from './MegaMenu';
import { ChevronIcon } from './NavIcons';
import { sectionIsCurrent } from './nav-utils';

const item =
  'relative flex h-10 items-center gap-1 whitespace-nowrap rounded-control px-2 text-[15px] font-semibold transition-colors duration-150 ' +
  'hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary ' +
  'aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-2 aria-[current=page]:after:-bottom-[13px] aria-[current=page]:after:h-0.5 aria-[current=page]:after:bg-primary';

/**
 * Main navigation (desktop): W3C APG "disclosure navigation". Each section with a panel is a button
 * (`aria-expanded` / `aria-controls`); a click opens it, one panel at a time. Esc closes and returns focus to the button;
 * a click outside or focus leaving the navigation closes it (route changes and chosen links close it in the header).
 */
export function DesktopNav({
  sections,
  openId,
  setOpenId,
  className,
}: {
  sections: NavSection[];
  openId: string | null;
  setOpenId: (id: string | null) => void;
  className?: string;
}) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      buttons.current[openId]?.focus();
      setOpenId(null);
    };
    const onPointer = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenId(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [openId, setOpenId]);

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      className={className}
      onBlur={(e) => {
        if (e.relatedTarget && !navRef.current?.contains(e.relatedTarget as Node)) setOpenId(null);
      }}
    >
      {/* No positioned ancestor between <li> and <header>: panels span the header width */}
      <ul className="flex items-center">
        {sections.map((s) => {
          const current = sectionIsCurrent(s, pathname);
          if (!s.columns.length) {
            return (
              <li key={s.id}>
                <Link href={s.href} aria-current={current ? 'page' : undefined} className={item}>
                  {s.label}
                </Link>
              </li>
            );
          }
          const open = openId === s.id;
          const panelId = `nav-panel-${s.id}`;
          return (
            <li key={s.id}>
              <button
                ref={(el) => {
                  buttons.current[s.id] = el;
                }}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                aria-current={current ? 'page' : undefined}
                onClick={() => setOpenId(open ? null : s.id)}
                className={cn(item, open && 'bg-surface text-primary')}
              >
                {s.label}
                <ChevronIcon className={cn('transition-transform duration-150', open && 'rotate-180')} />
              </button>
              <div
                id={panelId}
                hidden={!open}
                className="absolute inset-x-0 top-full border-b border-line bg-bg shadow-card"
              >
                <MegaPanel section={s} onNavigate={() => setOpenId(null)} />
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
