import { MaterialMixer } from '@/components/catalog/MaterialMixer';
import { ModalButton } from '@/components/modals/ModalButton';
import { CtaForm } from '@/components/sections/Cta';
import { PageHero } from '@/components/sections/Hero';
import { CatalogRailSection, FaqSection, StepsSection } from '@/components/sections/Shared';
import { Section, SectionHeading } from '@/components/ui/layout';
import { Photo, staticPhoto } from '@/components/ui/Photo';
import { Tile, TileGrid } from '@/components/ui/Tile';
import { getMaterials, getPage } from '@/lib/content';
import { routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/page-meta';
import { PageSections } from '@/components/sections/PageSections';
import { OtherServices } from '@/components/sections/OtherServices';

export const generateMetadata = () =>
  pageMetadata(routes.materials(), {
    title: 'Trade-in valuation',
    description: 'Get a fair, written offer for your car in about 15 minutes, plus a $1,000 trade-in bonus when you buy from Kestrow Motors in Denver.',
  });

export default async function MaterialsPage() {
  const [materials, page] = await Promise.all([getMaterials(), getPage(routes.materials())]);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Buyer\'s guide', href: routes.buyers() }, { label: 'Trade-in' }]}
        title="Trade in your car for what it is really worth"
        lead="Tell us about your car and get a written offer in about 15 minutes. It is valid for 7 days, whether or not you buy from us."
        chips={['Written offer in 15 minutes', '$1,000 trade-in bonus', 'We pay off your loan']}
        media="Photo: trade-in appraisal"
        image={staticPhoto('trade-in.jpg', 'An appraiser inspecting a car for a trade-in offer')}
        actions={
          <ModalButton
            size="lg"
            modal={{ type: 'lead', title: 'Value my car', form: { formId: 'materials', submitLabel: 'Value my car' } }}
          >
            Value my car
          </ModalButton>
        }
      />

      <PageSections lead={page?.lead} sections={page?.sections ?? []} />

      <Section>
        <SectionHeading title="What our appraisers look at" subtitle="The same areas we check on every car we sell, so the offer reflects the real condition of yours." />
        <TileGrid cols={3} className="mt-8">
          {materials.map((m) => (
            <Tile
              key={m.slug}
              title={m.title}
              media={<Photo media={m.image} label={`Appraisal photo: ${m.title.toLowerCase()}`} sizes="(min-width: 1024px) 400px, 100vw" className="mb-4 min-h-44" />}
            />
          ))}
        </TileGrid>
      </Section>

      <StepsSection group="materials" title="How does a trade-in work?" />

      <Section>
        <SectionHeading
          title="Not sure what to buy? Start with a body type"
          subtitle="Pick a body type, fuel and budget and see the cars that fit."
        />
        <MaterialMixer />
      </Section>

      <CtaForm
        title="Curious what your car is worth?"
        text="Share the make, model, mileage and a few photos. We'll send a written offer, and add a $1,000 bonus if you buy from us."
        form={{ formId: 'materials', layout: 'inline', submitLabel: 'Value my car' }}
      />

      <CatalogRailSection title="Cars you could trade up to" subtitle="" />

      <FaqSection group="materials" />

      <OtherServices current={routes.materials()} />
    </>
  );
}
