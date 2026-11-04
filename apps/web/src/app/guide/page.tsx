import { PageHero } from '@/components/sections/Hero';
import { CatalogRailSection } from '@/components/sections/Shared';
import { Section } from '@/components/ui/layout';
import { Tile, TileGrid } from '@/components/ui/Tile';
import { getNavigation, getPage } from '@/lib/content';
import { routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/page-meta';
import { PageSections } from '@/components/sections/PageSections';

export const generateMetadata = () =>
  pageMetadata(routes.buyers(), {
    title: 'Buyer\'s guide',
    description: 'Test drives, trade-in, home delivery, the 172-point inspection, warranty and financing: everything about buying a car from Kestrow Motors.',
  });

export default async function BuyersPage() {
  const [nav, page] = await Promise.all([getNavigation('main'), getPage(routes.buyers())]);
  const buyers = nav.find((i) => i.path === routes.buyers())?.items ?? [];

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Buyer\'s guide' }]}
        title="Buyer's guide"
        lead="Everything you need to know about buying a car from Kestrow Motors, from the test drive to financing, delivery and warranty."
        media={null}
      />

      <PageSections lead={page?.lead} sections={page?.sections ?? []} />
      <Section spacing="sm">
        <TileGrid cols={3}>
          {buyers.map((i) => (
            <Tile key={i.id} title={i.title} href={i.path} more="Learn more →" />
          ))}
        </TileGrid>
      </Section>
      <CatalogRailSection />
    </>
  );
}
