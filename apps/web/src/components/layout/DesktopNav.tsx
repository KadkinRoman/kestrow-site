'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import type { NavItem } from '@/lib/content/types';
import { isActive, navHref } from './nav-utils';

/** Main menu (desktop): level 1 + dropdown level 2 (hover / focus-within). */
export function DesktopNav({ items, className }: { items: NavItem[]; className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main menu" className={className}>
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const active = isActive(item, pathname);
          const hasChildren = !!item.items?.length;
          const href = navHref(item);
          const cls = cn(
            'flex h-10 items-center gap-1 whitespace-nowrap rounded-control px-3 text-[15px] transition-colors hover:bg-surface',
            active && 'font-semibold',
          );
          const label = (
            <>
              {item.title}
              {hasChildren && (
                <span aria-hidden className="text-[10px] text-fg-muted">
                  ▾
                </span>
              )}
            </>
          );
          return (
            <li key={item.id} className="group relative">
              {href ? (
                <Link href={href} aria-current={active ? 'page' : undefined} className={cls}>
                  {label}
                </Link>
              ) : (
                // WRAPPER — group heading without a link; a button so the submenu opens from the keyboard
                <button type="button" className={cls}>
                  {label}
                </button>
              )}
              {hasChildren && (
                <div className="invisible absolute top-full left-0 z-50 pt-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="min-w-60 rounded-card border border-line bg-bg p-2 shadow-card">
                    {item.items!.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={navHref(child)}
                          className="block rounded-media px-3 py-2 text-[15px] hover:bg-surface"
                        >
                          {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
