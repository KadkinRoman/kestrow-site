import Link from 'next/link';
import { Container } from '@/components/ui/layout';
import type { SiteSettings, Topline as ToplineData } from '@/lib/content/types';
import type { NavData } from '@/lib/nav';
import { HeaderBar } from './HeaderBar';
import { QuickNav } from './QuickNav';

type Props = {
  settings: SiteSettings;
  nav: NavData;
  topline: ToplineData;
};

export function Header({ settings, nav, topline }: Props) {
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

      <HeaderBar nav={nav} phone={settings.phone} phoneHref={settings.phoneHref} workHours={settings.workHours} />
      <QuickNav sections={nav.sections} />
    </>
  );
}
