import { ModalButton } from '@/components/modals/ModalButton';
import { Ticker } from '@/components/sections/Blocks';
import { CtaForm, FinalCta } from '@/components/sections/Cta';
import { PageHero } from '@/components/sections/Hero';
import { Rail } from '@/components/sections/Rail';
import {
  CatalogRailSection,
  GuaranteesSection,
  ReviewsSection,
  StepsSection,
} from '@/components/sections/Shared';
import { Button } from '@/components/ui/Button';
import { Section, SectionHeading } from '@/components/ui/layout';
import { Avatar, Photo, staticPhoto } from '@/components/ui/Photo';
import { Tile, TileGrid } from '@/components/ui/Tile';
import { getMaterials, getSettings, getTeam } from '@/lib/content';
import { routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/page-meta';

export const generateMetadata = () =>
  pageMetadata(routes.about(), {
    title: 'About us',
    description: 'Kestrow Motors sells hand-picked pre-owned cars in Denver, CO. Our own inspection center, a 172-point inspection on every car and a 7-day money-back guarantee.',
  });

export default async function AboutPage() {
  const [settings, materials, team] = await Promise.all([getSettings(), getMaterials(), getTeam()]);

  return (
    <>
      {/* 1 · Hero */}
      <PageHero
        crumbs={[{ label: 'About' }]}
        title="Kestrow Motors: inspected pre-owned cars in Denver, CO"
        lead="We hand-pick, inspect and guarantee every car we sell, so buying one feels straightforward instead of stressful."
        media="Showroom"
        image={staticPhoto('showroom-1.jpg', 'The Kestrow Motors showroom in Denver with cars on display')}
        actions={
          <>
            <Button href={routes.catalog()} size="lg">
              Browse inventory
            </Button>
            <ModalButton size="lg" variant="secondary" modal={{ type: 'lead', title: 'Get a price quote' }}>
              Get a price quote
            </ModalButton>
          </>
        }
      >
        <TileGrid cols={4} className="mt-8">
          {['172-point inspection', '7-day money-back guarantee', 'No-haggle prices', 'Free delivery within 100 miles'].map(
            (t) => (
              <Tile key={t} title={t} />
            ),
          )}
        </TileGrid>
      </PageHero>

      {/* 2 · Why choose us */}
      <Section>
        <SectionHeading title="Why choose Kestrow Motors" />
        <TileGrid cols={3} className="mt-8">
          <Tile icon title="Our own inspection center" text="We check and recondition every car ourselves, from the first test to the final detail." />
          <Tile icon title="Matched to how you drive" text="Commuting, family trips, towing or weekend adventures: we help you find the right fit." />
          <Tile icon title="A wide choice of cars" text="SUVs, sedans, pickups, electric cars and sports cars across many makes and budgets." />
          <Tile icon title="Transparent from the start" text="One no-haggle price, a free vehicle history report and the full inspection results for every car." />
          <Tile icon title="12-month warranty" text="A limited powertrain warranty on every car, with extended plans up to 5 years." />
          <Tile icon title="No middlemen" text="Sales, financing, service and delivery all happen under one roof." />
        </TileGrid>
      </Section>

      {/* 3 · Numbers */}
      <Section spacing="sm" bleed>
        <Ticker
          items={[
            ['172', 'inspection points'],
            ['6,500+', 'cars sold since 2014'],
            ['4.8★', 'from 1,240 reviews'],
            ['7 days', 'money-back guarantee'],
            ['12 months', 'warranty included'],
            ['100 miles', 'free delivery'],
            ['from 5.9%', 'APR financing'],
          ]}
        />
      </Section>

      {/* 4 · Inspection center */}
      <Section id="inspection-center">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading title="We inspect everything ourselves" />
            <p className="mt-4 text-lg">
              The Kestrow inspection center is right behind our showroom on Larkspur Avenue. That lets us control quality,
              repairs and timing without sending cars to outside shops.
            </p>
            <div className="mt-6">
              <Button href={routes.installation()} variant="secondary">
                About the inspection
              </Button>
            </div>
          </div>
          <Photo media={staticPhoto('inspection-2.jpg', 'Technician checking brakes on a car in the service bay')} label="Inspection center" ratio="16/10" sizes="(min-width: 1024px) 600px, 100vw" />
        </div>
        <TileGrid cols={4} className="mt-8">
          {(
            [
              ['Modern diagnostic equipment', 'inspection-1.jpg'],
              ['Quality control', 'inspection-4.jpg'],
              ['Genuine and OEM-grade parts', 'inspection-2.jpg'],
              ['In-house technicians', 'inspection-3.jpg'],
            ] as const
          ).map(([t, img]) => (
            <Tile key={t} title={t} media={<Photo media={staticPhoto(img, t)} label={t} sizes="300px" className="mb-4 min-h-36" />} />
          ))}
        </TileGrid>
      </Section>

      {/* 5 · Team */}
      <Section id="team">
        <Rail
          title="The people behind your car"
          subtitle="Every customer has a dedicated sales consultant, from the first question to the day you drive home."
          variant="team"
        >
          {['showroom-1.jpg', 'showroom-2.jpg', 'showroom-3.jpg', 'showroom-4.jpg', 'inspection-1.jpg'].map((img, n) => (
            <Photo key={img} media={staticPhoto(img, `Kestrow Motors showroom and service photo ${n + 1}`)} label={`Dealership photo ${n + 1}`} sizes="(min-width: 1024px) 520px, 85vw" className="min-h-72 md:min-h-96" />
          ))}
        </Rail>
        {/* Staff cards from Strapi ("Employee", isTeam) → the "Employee" modal */}
        <TileGrid cols={4} className="mt-8">
          {team.map((e) => (
            <ModalButton key={e.id} unstyled modal={{ type: 'employee', employee: e }} className="h-full text-left">
              <Tile title={e.name} text={e.role} media={<Avatar name={e.name} media={e.photo} className="mb-4 size-20 text-2xl" />} more="Learn more →" />
            </ModalButton>
          ))}
        </TileGrid>
      </Section>

      {/* 6 · Lead form: test drive */}
      <CtaForm
        title="Book a test drive"
        text="Pick a car and a time. A sales consultant will have it ready at the showroom, or bring it to you."
        actions={
          <Button href={routes.zamer()} variant="inverse">
            How a test drive works
          </Button>
        }
        form={{ formId: 'zamer', layout: 'inline', submitLabel: 'Book my test drive' }}
      />

      {/* 7 · How we work */}
      <StepsSection group="about" title="From first click to the keys in your hand">
        <Button href={routes.zamer()} variant="secondary">
          Learn more about test drives
        </Button>
      </StepsSection>

      {/* 8 · What is included */}
      <Section>
        <SectionHeading title="What every Kestrow car includes" />
        <TileGrid cols={3} className="mt-8">
          <Tile title="172-point inspection" text="Engine, brakes, tires, electronics and body, checked by our technicians." />
          <Tile title="Vehicle history report" text="Accidents, service records and title status, free with every car." />
          <Tile title="Reconditioning" text="Worn tires, brakes and fluids are replaced before the car is listed." />
          <Tile title="One no-haggle price" text="The price you see is the price you pay, plus tax, title and registration." />
          <Tile title="Delivery option" text="We bring the car to your door, free within 100 miles of Denver." />
          <Tile title="12-month warranty" text="A 12-month / 12,000-mile limited powertrain warranty on every car." />
        </TileGrid>
      </Section>

      {/* 9 · Inventory */}
      <CatalogRailSection />

      {/* 10 · Reviews */}
      {/* "See more reviews" → the Reviews page */}
      <ReviewsSection />

      {/* 11 · Inspection areas (CMS "material" collection) */}
      <Section>
        <SectionHeading
          title="What our technicians check"
          subtitle="Every inspection covers these areas and more. Anything that falls short is repaired or replaced before the car goes on sale."
        />
        <TileGrid cols={5} className="mt-8">
          {materials.slice(0, 5).map((m) => (
            <Tile key={m.slug} title={m.title} media={<Photo media={m.image} label={m.title} sizes="240px" className="mb-4 min-h-28" />} />
          ))}
        </TileGrid>
        <div className="mt-6">
          <Button href={routes.installation()} variant="secondary">
            Learn more about the inspection
          </Button>
        </div>
      </Section>

      {/* 12 · Guarantees */}
      <GuaranteesSection
        title="Kestrow stands behind every car"
        withLink={false}
        items={[
          '12-month / 12,000-mile warranty',
          '7-day money-back guarantee',
          'One no-haggle price, no hidden dealer fees',
          'Inspected in our own service bays',
          'Free vehicle history report',
        ]}
      />

      {/* 13 · Final call to action */}
      <FinalCta
        title="Let's talk about your next car"
        text="Tell us what you're after. A sales consultant will suggest matching cars, a trade-in value and a monthly payment estimate."
        socials={settings.socials}
      />
    </>
  );
}
