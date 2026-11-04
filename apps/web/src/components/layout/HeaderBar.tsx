'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ModalButton } from '@/components/modals/ModalButton';
import { Container } from '@/components/ui/layout';
import { cn } from '@/lib/cn';
import type { NavData } from '@/lib/nav';
import { Logo } from './Brand';
import { DesktopNav } from './DesktopNav';
import { SearchBox } from './HeaderSearch';
import { MobileNav, SearchLayer } from './MobileNav';
import { PhoneIcon, SearchIcon } from './NavIcons';

const HIDE_AFTER = 120;
const iconButton =
  'flex size-11 items-center justify-center rounded-control text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary';

/**
 * The sticky header row. Desktop (≥1024 px): logo, disclosure nav with mega panels, search, phone, pre-approval button.
 * Phones: logo, search, call, "Menu". The header hides on scroll down (after 120 px) and returns on any scroll up; it
 * never hides while a panel, the menu or the search layer is open. Full-screen layers are portals (see Layer).
 */
export function HeaderBar({
  nav,
  phone,
  phoneHref,
  workHours,
}: {
  nav: NavData;
  phone: string;
  phoneHref: string;
  workHours: string;
}) {
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  // A route change closes everything
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenId(null);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  const locked = openId !== null || menuOpen || searchOpen;
  const lockedRef = useRef(locked);
  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = Math.max(0, window.scrollY);
        if (lockedRef.current || y <= HIDE_AFTER) setHidden(false);
        else if (y > last) setHidden(true);
        else if (y < last) setHidden(false);
        last = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Sticky elements under the header (the mobile filter bar) follow its visible height: 0 while it is hidden
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const apply = () =>
      document.documentElement.style.setProperty('--header-offset', hidden && !locked ? '0px' : `${el.offsetHeight}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hidden, locked]);

  const bodyTypes = nav.sections[0]?.columns[0]?.[0]?.links ?? [];

  return (
    <header
      ref={headerRef}
      // Keyboard focus inside a hidden header brings it back
      onFocusCapture={() => setHidden(false)}
      className={cn(
        'sticky top-0 z-40 border-b border-line bg-bg transition-transform duration-300 ease-out motion-reduce:transition-none',
        hidden && !locked && '-translate-y-full',
      )}
    >
      <Container className="flex h-14 items-center gap-3 lg:h-[68px] 2xl:max-w-[1480px]">
        <Logo />

        <DesktopNav sections={nav.sections} openId={openId} setOpenId={setOpenId} className="hidden shrink-0 lg:block" />

        <div className="ml-auto flex items-center gap-1 lg:min-w-0 lg:flex-1 lg:justify-end lg:gap-3">
          {/* ≥1280 px: the field itself; below: an icon that opens the search layer */}
          <SearchBox suggestions={nav.suggestions} className="hidden max-w-[360px] min-w-36 flex-1 xl:block" />
          <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search cars" aria-haspopup="dialog" className={cn(iconButton, 'xl:hidden')}>
            <SearchIcon />
          </button>

          {/* Phone: number from 1400 px (hours from 1536 px), an icon below */}
          <a href={phoneHref} aria-label={`Call us: ${phone}`} title={phone} className={cn(iconButton, 'min-[1400px]:hidden')}>
            <PhoneIcon />
          </a>
          <a href={phoneHref} className="hidden shrink-0 text-right leading-tight min-[1400px]:block">
            <b className="tabular block text-[15px] font-semibold whitespace-nowrap">{phone}</b>
            <small className="hidden text-xs text-fg-muted 2xl:block">{workHours}</small>
          </a>

          <div className="hidden shrink-0 lg:block">
            <ModalButton
              size="sm"
              className="whitespace-nowrap"
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

          <div className="ml-1 lg:hidden">
            <MobileNav
              open={menuOpen}
              setOpen={setMenuOpen}
              sections={nav.sections}
              suggestions={nav.suggestions}
              phone={phone}
              phoneHref={phoneHref}
            />
          </div>
        </div>
      </Container>

      <SearchLayer
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        suggestions={nav.suggestions}
        quickLinks={bodyTypes.map((b) => ({ label: b.label, href: b.href }))}
      />
    </header>
  );
}
