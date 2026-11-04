'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type MouseEvent } from 'react';
import { cn } from '@/lib/cn';
import type { NavItem, SiteSettings } from '@/lib/content/types';
import { Socials } from './Brand';
import { navHref } from './nav-utils';

/** Burger + slide-out mobile menu with expandable groups. */
export function MobileNav({
  items,
  settings,
  className,
}: {
  items: NavItem[];
  settings: SiteSettings;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(64);
  const pathname = usePathname();

  function toggle(e: MouseEvent<HTMLButtonElement>) {
    // The panel opens right below the header (a topline may sit above it)
    const header = e.currentTarget.closest('header');
    if (header) setTop(header.getBoundingClientRect().bottom);
    setOpen((v) => !v);
  }

  // Close the menu on navigation to another page
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="flex size-10 items-center justify-center rounded-full border border-line text-lg"
      >
        {open ? '✕' : '☰'}
      </button>

      <div
        id="mobile-nav"
        hidden={!open}
        style={{ top }}
        className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto border-t border-line bg-bg"
      >
        <nav aria-label="Mobile menu" className="px-4 py-4">
          <ul className="divide-y divide-line">
            {items.map((item) =>
              item.items?.length ? (
                <li key={item.id}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-lg font-medium">
                      {item.title}
                      <span aria-hidden className="text-fg-muted transition-transform group-open:rotate-180">
                        ▾
                      </span>
                    </summary>
                    <ul className="pb-3">
                      {navHref(item) && (
                        <li>
                          <Link href={navHref(item)} className="block py-2 pl-3 text-fg-muted">
                            All {item.title.toLowerCase()}
                          </Link>
                        </li>
                      )}
                      {item.items.map((child) => (
                        <li key={child.id}>
                          <Link href={navHref(child)} className="block py-2 pl-3">
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ) : (
                <li key={item.id}>
                  {navHref(item) ? (
                    <Link href={navHref(item)} className="block py-4 text-lg font-medium">
                      {item.title}
                    </Link>
                  ) : (
                    <span className="block py-4 text-lg font-medium">{item.title}</span>
                  )}
                </li>
              ),
            )}
          </ul>

          <div className={cn('mt-6 space-y-4 border-t border-line pt-6')}>
            <a href={settings.phoneHref} className="block">
              <b className="block text-xl">{settings.phone}</b>
              <small className="text-fg-muted">{settings.workHours}</small>
            </a>
            <Socials items={settings.socials} />
          </div>
        </nav>
      </div>
    </div>
  );
}
