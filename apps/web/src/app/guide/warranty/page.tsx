import { ModalButton } from '@/components/modals/ModalButton';
import { CtaForm } from '@/components/sections/Cta';
import { PageHero } from '@/components/sections/Hero';
import { staticPhoto } from '@/components/ui/Photo';
import { CatalogRailSection, FaqSection, StepsSection } from '@/components/sections/Shared';
import { Section, SectionHeading } from '@/components/ui/layout';
import { Tile, TileGrid } from '@/components/ui/Tile';
import { routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/page-meta';
import { PageSections } from '@/components/sections/PageSections';
import { OtherServices } from '@/components/sections/OtherServices';
import { getPage } from '@/lib/content';

export const generateMetadata = () =>
  pageMetadata(routes.warranty(), {
    title: 'Warranty & protection plans',
    description: 'Every Kestrow Motors car includes a 12-month / 12,000-mile limited powertrain warranty, with extended protection plans up to 5 years. What is covered and how to claim.',
  });

export default async function WarrantyPage() {
  const page = await getPage(routes.warranty());
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Buyer\'s guide', href: routes.buyers() }, { label: 'Warranty' }]}
        title="A 12-month warranty on every car, extendable to 5 years"
        lead="If a covered powertrain problem comes up during the warranty period, contact Kestrow Motors and we'll diagnose it and arrange the repair."
        chips={['12 months / 12,000 miles', 'Extended plans up to 5 years', 'Repairs at our service center']}
        media="Photo: warranty"
        image={staticPhoto('warranty.jpg', 'A Kestrow Motors technician explaining warranty coverage to a customer')}
        actions={
          <ModalButton
            size="lg"
            modal={{
              type: 'lead',
              title: 'Ask a warranty question',
              form: { formId: 'warranty', submitLabel: 'Send question' },
            }}
          >
            Ask a warranty question
          </ModalButton>
        }
      />

      <PageSections lead={page?.lead} sections={page?.sections ?? []} />

      <Section>
        <SectionHeading
          title="What the warranty covers"
          subtitle="The included limited powertrain warranty covers mechanical failures of the parts that make the car go. Extended plans add more components and more years."
        />
        <TileGrid cols={4} className="mt-8">
          <Tile icon title="Engine" text="Internal lubricated parts, including pistons, camshafts and the oil pump." />
          <Tile icon title="Transmission" text="Gears, torque converter and internal parts of the automatic or manual transmission." />
          <Tile icon title="Drive system" text="Axles, driveshaft, differential and, on electric cars, the drive unit." />
          <Tile icon title="Extended plans" text="Add coverage for electronics, A/C, suspension and more, for up to 5 years." />
        </TileGrid>
      </Section>

      <StepsSection group="warranty" title="How to make a warranty claim" />

      <CtaForm
        title="Questions about your warranty?"
        text="Send a request and our service team will help you sort it out."
        form={{ formId: 'warranty', layout: 'inline', submitLabel: 'Ask a question' }}
      />

      <CatalogRailSection title="Cars built to last" subtitle="" />

      <FaqSection group="warranty" />

      <OtherServices current={routes.warranty()} />
    </>
  );
}
