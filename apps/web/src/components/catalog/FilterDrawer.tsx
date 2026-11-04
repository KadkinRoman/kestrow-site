'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { buttonClass } from '@/components/ui/Button';
import type { KitchenFilterOptions } from '@/lib/content/types';
import { CatalogFilters, FILTER_KEYS, type CategoryCount } from './CatalogFilters';

const subscribe = () => () => {};

type Props = {
  options: KitchenFilterOptions;
  categories: CategoryCount[];
  category?: string;
  /** Number of cars for the current filters */
  total: number;
};

/**
 * Phones: a sticky bar "Filters (n)" under the header and a full-screen drawer with the same filter lists.
 * The drawer is a portal into <body> (a fixed layer must not live inside the sticky bar).
 */
export function FilterDrawer({ options, categories, category, total }: Props) {
  const params = useSearchParams();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const count = FILTER_KEYS.filter((k) => params.has(k)).length;

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  return (
    <div className="sticky top-[var(--header-offset,3.5rem)] z-30 -mx-4 mb-4 flex items-center justify-between gap-3 border-b border-line bg-bg px-4 py-2 sm:-mx-6 sm:px-6 lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={buttonClass('secondary', 'md', 'gap-2')}
      >
        <svg aria-hidden width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 5h14M6 10h8M9 15h2" />
        </svg>
        Filters{count > 0 && ` (${count})`}
      </button>

      {open &&
        mounted &&
        createPortal(
          <Drawer onClose={close}>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-2">
              <CatalogFilters options={options} categories={categories} category={category} onPendingChange={setPending} />
            </div>
            <div className="flex items-center gap-3 border-t border-line bg-bg px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              {count > 0 && (
                <Link href={pathname} scroll={false} className="inline-flex min-h-12 items-center px-2 text-sm font-semibold underline underline-offset-4">
                  Clear all
                </Link>
              )}
              <button type="button" onClick={close} className={buttonClass('primary', 'lg', 'flex-1')}>
                {pending ? 'Updating…' : `Show ${total} ${total === 1 ? 'car' : 'cars'}`}
              </button>
            </div>
          </Drawer>,
          document.body,
        )}
    </div>
  );
}

function Drawer({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    root?.querySelector<HTMLElement>('button')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !root) return;
      const items = [...root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, summary')].filter(
        (el) => el.offsetParent !== null,
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Filters" className="fixed inset-0 z-[60] flex h-dvh flex-col bg-bg">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <h2 className="text-2xl">Filters</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="flex size-11 items-center justify-center rounded-control text-2xl focus-visible:outline-2 focus-visible:outline-primary"
        >
          <span aria-hidden>×</span>
        </button>
      </div>
      {children}
    </div>
  );
}
