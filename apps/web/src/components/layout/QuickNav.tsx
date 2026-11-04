'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavSection } from '@/lib/nav';
import { routes } from '@/lib/routes';

const QUICK = ['shop', 'sell', 'finance'];

/** Phones, home and inventory only: the three main destinations in plain sight under the header (44 px targets). */
export function QuickNav({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();
  if (pathname !== routes.home() && pathname !== routes.catalog()) return null;

  return (
    <nav aria-label="Quick links" className="border-b border-line bg-bg lg:hidden">
      <ul className="flex divide-x divide-line">
        {QUICK.map((id) => {
          const s = sections.find((x) => x.id === id);
          if (!s) return null;
          return (
            <li key={id} className="flex-1">
              <Link
                href={s.href}
                className="flex min-h-11 items-center justify-center px-2 text-sm font-semibold whitespace-nowrap hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
              >
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
