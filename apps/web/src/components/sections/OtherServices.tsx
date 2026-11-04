import { LinksRow } from '@/components/sections/Blocks';
import { Section, SectionHeading } from '@/components/ui/layout';
import { routes } from '@/lib/routes';

/** All pages of the Buyer's guide section */
const SERVICES = [
  { href: routes.zamer(), label: 'Test drive' },
  { href: routes.materials(), label: 'Trade-in' },
  { href: routes.delivery(), label: 'Home delivery' },
  { href: routes.installation(), label: '172-point inspection' },
  { href: routes.warranty(), label: 'Warranty' },
  { href: routes.payment(), label: 'Financing' },
];

/** "Other services": six pages of the section excluding the current one */
export function OtherServices({ current }: { current: string }) {
  return (
    <Section>
      <SectionHeading title="Other services" />
      <LinksRow links={SERVICES.filter((s) => s.href !== current)} />
    </Section>
  );
}
