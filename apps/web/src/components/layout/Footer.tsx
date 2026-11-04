import Link from 'next/link';
import { ModalButton } from '@/components/modals/ModalButton';
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

export function Footer({ settings, columns, legal }: Props) {
  return (
    <footer className="mt-16 bg-inverse text-on-inverse">
      <Container className="flex flex-col gap-8 border-b border-on-inverse/10 py-14 md:flex-row md:items-end md:justify-between md:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-on-inverse-muted uppercase">Find your next car</p>
          <p className="mt-4 font-display text-4xl leading-[1.02] md:text-6xl">
            Drive home something <em className="text-on-inverse-muted">you love.</em>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ModalButton
            variant="contrast"
            size="lg"
            modal={{
              type: 'lead',
              title: 'Book a test drive',
              text: 'Pick a car and a time. A sales consultant will call you back to confirm and have the car ready at the showroom.',
              form: { formId: 'zamer', submitLabel: 'Book my test drive' },
            }}
          >
            Book a test drive
          </ModalButton>
          <a href={settings.phoneHref} className="inline-flex min-h-13 items-center rounded-control border border-on-inverse/30 px-8 hover:bg-on-inverse/10">
            {settings.phone}
          </a>
        </div>
      </Container>

      <Container className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="space-y-5">
          <Logo dark />
          <p className="max-w-xs text-on-inverse-muted">{settings.tagline || 'Hand-picked pre-owned and new cars in Denver, Colorado.'}</p>
          <Socials items={settings.socials} dark />
        </div>

        {columns.map((col) => (
          <nav key={col.id} aria-label={col.title}>
            <h4 className="mb-4 text-xs font-semibold tracking-[0.16em] uppercase">{col.title}</h4>
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

        <div>
          <h4 className="mb-4 text-xs font-semibold tracking-[0.16em] uppercase">Visit the showroom</h4>
          <ul className="space-y-2.5 text-[15px]">
            <li className="text-on-inverse-muted">{settings.address}</li>
            <li className="text-on-inverse-muted">{settings.workHours}</li>
            <li>
              <a href={`mailto:${settings.email}`} className={linkCls}>
                {settings.email}
              </a>
            </li>
            <li>
              <Link href={routes.contacts()} className="underline decoration-on-inverse/40 underline-offset-4 hover:decoration-on-inverse">
                All contact details
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-on-inverse/10">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-2 py-6 text-sm text-on-inverse-muted">
          <span>© {settings.siteName} — a fictional dealership, built as a portfolio project</span>
          {legal.map((l) => (
            <Link key={l.id} href={navHref(l)} className="hover:text-on-inverse">
              {l.title}
            </Link>
          ))}
        </Container>
      </div>
    </footer>
  );
}
