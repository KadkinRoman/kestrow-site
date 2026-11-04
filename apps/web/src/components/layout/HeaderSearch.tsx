'use client';

import { useRouter } from 'next/navigation';
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import type { SearchSuggestion } from '@/lib/nav';
import { routes } from '@/lib/routes';
import { SearchIcon } from './NavIcons';

const MAX = 6;

type Props = {
  suggestions: SearchSuggestion[];
  /** Called after the visitor navigated (close the surrounding layer) */
  onDone?: () => void;
  autoFocus?: boolean;
  /** true — the list flows under the field (full-screen layers); false — a dropdown */
  inline?: boolean;
  /** 48 px field for touch layers */
  large?: boolean;
  className?: string;
};

/**
 * Header search: a real field with a submit button; suggestions (body types and cars from the inventory) follow the
 * ARIA combobox pattern — arrows move the highlight, Enter opens it, Esc closes the list. Enter without a highlight
 * goes to the full inventory.
 */
export function SearchBox({ suggestions, onDone, autoFocus, inline, large, className }: Props) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const results = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    return suggestions
      .filter((s) => {
        const hay = `${s.name} ${s.hint}`.toLowerCase();
        return tokens.every((t) => hay.includes(t));
      })
      .slice(0, MAX);
  }, [query, suggestions]);

  const listOpen = open && results.length > 0;

  function go(href: string) {
    setOpen(false);
    setActive(-1);
    setQuery('');
    router.push(href);
    onDone?.();
  }

  function submit() {
    go(active >= 0 && results[active] ? results[active].href : routes.catalog());
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!results.length) return;
      e.preventDefault();
      setOpen(true);
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((a) => (a === -1 && step === -1 ? results.length - 1 : (a + step + results.length) % results.length));
    } else if (e.key === 'Escape' && listOpen) {
      // The first Esc only closes the list; the surrounding layer stays
      e.nativeEvent.stopPropagation();
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <form
      ref={rootRef}
      role="search"
      className={cn('relative', className)}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <input
        type="text"
        role="combobox"
        aria-label="Search cars"
        aria-expanded={listOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={listOpen && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        autoFocus={autoFocus}
        enterKeyHint="search"
        placeholder="Make, model or body type"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={cn(
          'w-full rounded-control border border-line bg-surface pr-12 pl-3.5 text-fg placeholder:text-fg-muted focus-visible:border-primary focus-visible:bg-bg focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary',
          large ? 'h-12 text-base' : 'h-10 text-[15px]',
        )}
      />
      <button
        type="submit"
        aria-label="Search"
        className={cn(
          'absolute top-0 right-0 flex items-center justify-center rounded-control text-fg-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-primary',
          large ? 'size-12' : 'size-10',
        )}
      >
        <SearchIcon />
      </button>

      <ul
        id={listId}
        role="listbox"
        aria-label="Suggestions"
        hidden={!listOpen}
        className={cn(
          'overflow-hidden border border-line bg-bg py-1',
          inline ? 'mt-2 rounded-card' : 'absolute top-full right-0 z-50 mt-1.5 w-[max(100%,22rem)] rounded-card shadow-card',
        )}
      >
        {results.map((r, i) => (
          <li
            key={r.href}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => setActive(i)}
            onClick={() => go(r.href)}
            className={cn(
              'flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3.5 py-2 text-[15px]',
              i === active ? 'bg-surface' : 'bg-bg',
            )}
          >
            <span className="min-w-0 truncate font-medium">{r.name}</span>
            <span className="shrink-0 text-xs text-fg-muted">{r.hint}</span>
          </li>
        ))}
      </ul>
    </form>
  );
}
