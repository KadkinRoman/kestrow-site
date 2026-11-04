import Link from 'next/link';
import { Container } from '@/components/ui/layout';
import type { NavItem, SiteSettings } from '@/lib/content/types';
import { routes } from '@/lib/routes';
import { Logo, Socials } from './Brand';
import { navHref } from './nav-utils';

type Props = {
  settings: SiteSettings;
  columns: NavItem[];
  legal: NavItem[];
};

const linkCls = 'text-on-inverse-muted transition-colors hover:text-on-inverse';

/** Guarantees strip above the footer columns — the dealership's promises in one line each */
const GUARANTEES: [title: string, text: string, href: string][] = [
  ['172-point inspection', 'Every car, before it is listed', routes.installation()],
  ['7-day money-back', 'Changed your mind? Bring it back', routes.warranty()],
  ['12-month warranty', 'Powertrain cover, 12,000 miles', routes.warranty()],
  ['Free delivery', 'Within 100 miles of Denver', routes.delivery()],
];

export function Footer({ settings, columns, legal }: Props) {
  return (
    <footer className="mt-16 bg-inverse text-on-inverse">
      <div className="border-b border-on-inverse/10 bg-inverse-2">
        <Container className="grid grid-cols-2 gap-px py-0 lg:grid-cols-4">
          {GUARANTEES.map(([title, text, href]) => (
            <Link key={title} href={href} className="group flex items-start gap-3 py-6 pr-4">
              <span aria-hidden className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-primary text-white">
                ✓
              </span>
              <span>
                <b className="block font-display text-lg tracking-wide group-hover:text-primary-light">{title}</b>
                <span className="text-sm text-on-inverse-muted">{text}</span>
              </span>
            </Link>
          ))}
        </Container>
      </div>

      <Container className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="space-y-5">
          <Logo dark />
          <div>
            <a href={settings.phoneHref} className="font-display text-3xl tabular hover:text-primary-light">
              {settings.phone}
            </a>
            <p className="mt-1 text-sm text-on-inverse-muted">{settings.workHours}</p>
          </div>
          <p className="max-w-xs text-sm text-on-inverse-muted">
            {settings.address}
            <br />
            <a href={`mailto:${settings.email}`} className={linkCls}>
              {settings.email}
            </a>
          </p>
          <Socials items={settings.socials} dark />
        </div>

        {columns.map((col) => (
          <nav key={col.id} aria-label={col.title}>
            <h4 className="mb-4 font-display text-base tracking-wide uppercase">{col.title}</h4>
            <ul className="space-y-2.5 text-[15px]">
              {col.items?.map((item) => (
                <li key={item.id}>
                  <Link href={navHref(item)} className={linkCls}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="border-t border-on-inverse/10">
        <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-6 text-sm text-on-inverse-muted">
          <span>© {settings.siteName} · a fictional dealership, built as a portfolio project</span>
          <span className="flex flex-wrap gap-x-6 gap-y-2">
            {legal.map((l) => (
              <Link key={l.id} href={navHref(l)} className="hover:text-on-inverse">
                {l.title}
              </Link>
            ))}
            <Link href={routes.contacts()} className="hover:text-on-inverse">
              Contact
            </Link>
          </span>
        </Container>
      </div>
    </footer>
  );
}
