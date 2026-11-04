import Link from 'next/link';
import { ModalButton } from '@/components/modals/ModalButton';
import { Container } from '@/components/ui/layout';
import type { NavItem, SiteSettings, Topline as ToplineData } from '@/lib/content/types';
import { Logo, Socials } from './Brand';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';

type Props = {
  settings: SiteSettings;
  navigation: NavItem[];
  topline: ToplineData;
};

export function Header({ settings, navigation, topline }: Props) {
  return (
    <>
      {topline.enabled && (
        <div className="bg-inverse text-[13px] tracking-wide text-on-inverse">
          <Container className="flex min-h-9 items-center justify-center gap-3 py-1.5 text-center">
            <span>{topline.text}</span>
            {topline.link && (
              <Link href={topline.link.href} className="font-medium text-on-inverse underline decoration-on-inverse/40 underline-offset-4 hover:decoration-on-inverse">
                {topline.link.label}
              </Link>
            )}
          </Container>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-line/70">
        {/* Frosted background on its own layer: backdrop-filter on the header itself would become the containing
            block of the fixed mobile menu panel inside it and collapse the panel to the header height */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-bg/85 backdrop-blur-md backdrop-saturate-150" />
        <Container className="flex h-16 items-center gap-6 xl:h-20">
          <Logo tagline={settings.tagline} />

          <DesktopNav items={navigation} className="hidden flex-1 justify-center xl:flex" />

          <div className="ml-auto flex shrink-0 items-center gap-4 xl:ml-0">
            <a href={settings.phoneHref} className="hidden text-right leading-tight md:block">
              <b className="block font-semibold whitespace-nowrap">{settings.phone}</b>
              <small className="text-xs text-fg-muted">{settings.workHours}</small>
            </a>
            <div className="hidden lg:block">
              <ModalButton
                size="sm"
                modal={{
                  type: 'lead',
                  title: 'Book a test drive',
                  text: 'Pick a car and a time. A sales consultant will call you back to confirm and have the car ready at the showroom.',
                  form: { formId: 'zamer', submitLabel: 'Book my test drive' },
                }}
              >
                Book a test drive
              </ModalButton>
            </div>
            <a
              href={settings.phoneHref}
              aria-label={`Call: ${settings.phone}`}
              className="flex size-10 items-center justify-center rounded-full border border-line bg-paper md:hidden"
            >
              <span aria-hidden>☎</span>
            </a>
            <Socials items={settings.socials} className="hidden 2xl:flex" />
            <MobileNav items={navigation} settings={settings} className="xl:hidden" />
          </div>
        </Container>
      </header>
    </>
  );
}
