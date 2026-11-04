import { ModalButton } from '@/components/modals/ModalButton';
import { CtaForm } from '@/components/sections/Cta';
import { PageHero } from '@/components/sections/Hero';
import { staticPhoto } from '@/components/ui/Photo';
import { CatalogRailSection, FaqSection } from '@/components/sections/Shared';
import { Section, SectionHeading } from '@/components/ui/layout';
import { Tile, TileGrid } from '@/components/ui/Tile';
import { routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/page-meta';
import { PageSections } from '@/components/sections/PageSections';
import { OtherServices } from '@/components/sections/OtherServices';
import { getPage } from '@/lib/content';

export const generateMetadata = () =>
  pageMetadata(routes.zamer(), {
    title: 'Book a test drive',
    description: 'Book a free, no-obligation test drive at Kestrow Motors in Denver, CO, or at your home within 100 miles. Cars are cleaned and ready when you arrive.',
  });

export default async function ZamerPage() {
  const page = await getPage(routes.zamer());
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Buyer\'s guide', href: routes.buyers() }, { label: 'Test drive' }]}
        title="Book a test drive"
        lead="Pick a car and a time. We'll have it cleaned, charged or fuelled and ready, with a sales consultant who answers questions and never pushes."
        chips={['Free, no obligation', 'At the showroom or at your home', 'Car ready on arrival', 'No sales pressure']}
        media="Photo: test drive"
        image={staticPhoto('test-drive.jpg', 'A customer driving a car on a test drive near Denver')}
        actions={
          <ModalButton
            size="lg"
            modal={{ type: 'lead', title: 'Book a test drive', form: { formId: 'zamer', submitLabel: 'Book my test drive' } }}
          >
            Book a test drive
          </ModalButton>
        }
      />

      <PageSections lead={page?.lead} sections={page?.sections ?? []} />

      <Section>
        <SectionHeading title="What does a test drive include?" />
        <TileGrid cols={5} className="mt-8">
          <Tile number="1" title="Walk-around" text="Go over the car, its inspection report and the vehicle history report together." />
          <Tile number="2" title="Seat and controls" text="Adjust the seat, mirrors and infotainment, and pair your phone." />
          <Tile number="3" title="City and highway" text="A route that covers stop-and-go, bumps and highway speeds, usually 20–30 minutes." />
          <Tile number="4" title="Questions" text="Ask about ownership costs, features, service history and warranty." />
          <Tile number="5" title="Next step" text="Reserve the car, get your trade-in valued or see your monthly payment." />
        </TileGrid>
      </Section>

      <Section>
        <SectionHeading title="Key terms" />
        <TileGrid cols={4} className="mt-8">
          <Tile title="Appointment" text="Booked online or by phone; walk-ins welcome." />
          <Tile title="Driver's license" text="Bring a valid license and proof of insurance." />
          <Tile title="Trade-in" text="Bring your current car and we'll value it while you drive." />
          <Tile title="Price estimate" text="Out-the-door price and monthly payment for the car you drove." />
        </TileGrid>
      </Section>

      <Section>
        <SectionHeading title="Why test drive before you decide" />
        <TileGrid cols={4} className="mt-8">
          {['Feel how it drives', 'Check comfort and visibility', 'Test the features you will use', 'Decide with confidence'].map(
            (t) => (
              <Tile key={t} icon title={t} />
            ),
          )}
        </TileGrid>
      </Section>

      <CtaForm
        title="Found a car you like? Drive it before you decide"
        text="Tell us which car and when. We'll confirm within the hour and have it ready for you."
        form={{ formId: 'zamer', layout: 'inline', submitLabel: 'Book my test drive' }}
      />

      <CatalogRailSection title="Cars you can test drive this week" subtitle="" />

      <FaqSection group="measurement" />

      <OtherServices current={routes.zamer()} />
    </>
  );
}
