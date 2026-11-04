import { LeadForm } from '@/components/forms/LeadForm';
import { ModalButton } from '@/components/modals/ModalButton';
import { ProjectCase } from '@/components/sections/Cards';
import { CostEstimator } from '@/components/sections/CostEstimator';
import { CtaBox, FinalCta, QuizCta } from '@/components/sections/Cta';
import { HeroDealer } from '@/components/sections/Hero';
import { HeroSearch } from '@/components/sections/HeroSearch';
import { KitchenRail } from '@/components/sections/KitchenRail';
import { ProofStrip } from '@/components/sections/ProofStrip';
import {
  BlogTeaserSection,
  CatalogRailSection,
  FaqSection,
  PromosRailSection,
  ReviewsSection,
  StepsSection,
} from '@/components/sections/Shared';
import { Button } from '@/components/ui/Button';
import { Section, SectionHeading } from '@/components/ui/layout';
import { Photo, staticPhoto } from '@/components/ui/Photo';
import { Tile, TileGrid } from '@/components/ui/Tile';
import { getHitKitchens, getKitchenCategories, getKitchensForRail, getProjects, getSettings } from '@/lib/content';
import { formatPrice } from '@/lib/format';
import { routes } from '@/lib/routes';
import { PRICE_FROM, REVIEW_SUMMARY } from '@/lib/trust';

/** Timeline of the home "order stages" (5 steps in the CMS: the car buying process) */
const STEP_LABELS = ['Online', 'Same day', '30 min', '1 hour', 'Same day'];

export default async function HomePage() {
  const [settings, projects, hits, categories, inventory] = await Promise.all([
    getSettings(),
    getProjects(2),
    getHitKitchens(10),
    getKitchenCategories(),
    getKitchensForRail(60),
  ]);

  return (
    <>
      {/* 1 · Hero: search-first — body type + budget (price or monthly payment) → "Show N cars" */}
      <HeroDealer
        eyebrow="Pre-owned cars · Denver, Colorado"
        title={
          <>
            Find your next car.
            <br />
            <span className="text-primary-light">Know the payment first.</span>
          </>
        }
        lead={`Every car passes a 172-point inspection and comes with one no-haggle price, a 7-day money-back guarantee and free delivery within 100 miles. Cars from ${formatPrice(PRICE_FROM)}.`}
        search={
          <HeroSearch
            cars={inventory.map((k) => ({ category: k.category.slug, price: k.price }))}
            categories={categories.map((c) => ({ slug: c.slug, name: c.name, shortName: c.shortName }))}
          />
        }
        proof={
          <div>
            <div className="flex items-baseline gap-2">
              <b className="font-display text-4xl tabular">{REVIEW_SUMMARY.rating}</b>
              <span className="text-star" aria-hidden>
                ★★★★★
              </span>
            </div>
            <p className="text-sm text-fg-muted">{REVIEW_SUMMARY.countLabel} reviews on {REVIEW_SUMMARY.source}</p>
            <ul className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
              <li>✓ 172-point inspection</li>
              <li>✓ 7-day money-back guarantee</li>
              <li>✓ Pre-approval with no credit impact</li>
            </ul>
          </div>
        }
      />

      {/* 2 · Proof points */}
      <ProofStrip />

      {/* 3 · Inventory */}
      <CatalogRailSection />

      {/* 4 · Payment calculator: the price question answered before the visitor has to ask */}
      <div className="bg-surface/60">
        <CostEstimator />
      </div>

      {/* 5 · Reviews */}
      <ReviewsSection />

      {/* 6 · Benefits (bento) */}
      <Section>
        <SectionHeading
          eyebrow="Why Kestrow"
          title="Buying a car without the usual dealership games"
          subtitle="One price on the windshield, one team from the test drive to the paperwork, and a guarantee that lets you change your mind."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-6 md:gap-5">
          <Tile
            dark
            icon
            href={routes.installation()}
            title="172-point inspection on every car"
            text="Our technicians check the engine, brakes, tires, electronics and body before a car is allowed on the lot — and we share the full report."
            more="About the inspection →"
            className="md:col-span-3"
          />
          <Tile
            icon
            href={`${routes.about()}#inspection-center`}
            title="Our own inspection center"
            text="Reconditioning happens in-house, so we know exactly what was checked, fixed and replaced."
            more="About the inspection center →"
            className="md:col-span-3"
          />
          <Tile
            icon
            href={`${routes.about()}#team`}
            title="One team, start to finish"
            text="Sales consultants, finance managers, technicians and a delivery coordinator under one roof."
            more="Meet the team →"
            className="md:col-span-2"
          />
          <Tile
            icon
            href={routes.warranty()}
            title="12-month warranty included"
            text="Every car comes with a 12-month / 12,000-mile limited powertrain warranty, with extended plans up to 5 years."
            more="About the warranty →"
            className="md:col-span-2"
          />
          <Tile
            icon
            href={routes.payment()}
            title="Financing from 5.9% APR"
            text="Get pre-approved in 2 minutes with a soft credit check, then pick the term and monthly payment that fit."
            more="Financing →"
            className="md:col-span-2"
          />
        </div>
      </Section>

      {/* 7 · Process with a timeline */}
      <StepsSection
        group="home"
        eyebrow="How it works"
        title="Buy your car in under an hour at the dealership"
        subtitle="Choose online, drive it, sort out trade-in and financing, sign — and drive home or have it delivered."
        labels={STEP_LABELS}
      >
        <ModalButton
          size="lg"
          modal={{
            type: 'lead',
            title: 'Book a test drive',
            text: 'A sales consultant will call you back, confirm the car is ready and set up a time that suits you.',
            form: { formId: 'zamer', submitLabel: 'Book my test drive' },
          }}
        >
          Book a test drive
        </ModalButton>
      </StepsSection>

      {/* 8 · Customer stories */}
      <Section>
        <SectionHeading
          eyebrow="Recent deliveries"
          title="Cars our customers drove home this year"
          subtitle="Real buyers, real budgets: what they were looking for, what we found and what they paid."
        />
        <div className="mt-4">
          {projects.map((p) => (
            <ProjectCase key={p.slug} project={p} />
          ))}
        </div>
        <Button href={routes.projects()} variant="secondary">
          View all stories
        </Button>
      </Section>

      {/* 9 · Lead form: beat a competitor's offer */}
      <CtaBox
        eyebrow="Price match"
        title="Got an offer from another dealer? We'll beat it"
        text="Send us the listing or the written offer. We'll compare it like for like and come back with a better out-the-door price on a similar car."
        aside={
          <ModalButton
            variant="contrast"
            size="lg"
            className="w-full"
            modal={{
              type: 'lead',
              title: "We'll beat the other dealer's offer",
              text: 'Attach the listing or the written offer. The Kestrow team will find a comparable car and send you a better price.',
              form: { formId: 'compare', submitLabel: 'Send me a better offer' },
            }}
          >
            Send us the offer
          </ModalButton>
        }
      />

      {/* 10 · Offers */}
      <PromosRailSection />

      {/* 11 · Quiz */}
      <QuizCta />

      {/* 12 · Inspection center */}
      <Section id="inspection-center">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeading eyebrow="Inspected in Denver" title="The Kestrow inspection center" />
            <p className="mt-5 text-lg text-fg-muted">
              Every car on our lot goes through our own service bays first. Our technicians work through 172 checkpoints
              and fix or replace what falls short, so what you test drive is what you take home.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href={`${routes.about()}#inspection-center`}>Inside the inspection center</Button>
              <Button href={routes.materials()} variant="secondary">
                Trade-in
              </Button>
            </div>
          </div>
          <Photo
            media={staticPhoto('inspection-1.jpg', 'Technician inspecting a car on a lift in the service bay')}
            label="Inspection center"
            ratio="16/11"
            sizes="(min-width: 1024px) 620px, 100vw"
          />
        </div>
        <TileGrid cols={4} className="mt-10">
          <Tile title="172 checkpoints" text="Engine, transmission, brakes, suspension, electronics, interior and body." />
          <Tile title="Reconditioned in-house" text="Worn tires, brakes and fluids are replaced before the car is listed." />
          <Tile title="Full history report" text="Accidents, service records and title status, free with every car." />
          <Tile title="Certified technicians" text="The people who inspect your car also stand behind the warranty." />
        </TileGrid>
      </Section>

      {/* 13 · Test drive */}
      <CtaBox
        dark={false}
        eyebrow="Free, no obligation"
        title="Book a test drive"
        text="Pick a car, pick a time. We'll have it warmed up, cleaned and ready at the showroom — or bring it to you within 100 miles of Denver."
        actions={
          <Button href={routes.zamer()} variant="secondary">
            How a test drive works
          </Button>
        }
        aside={
          <div className="rounded-card bg-paper p-5 shadow-card md:p-6">
            <h3 className="text-lg font-semibold">Book your test drive</h3>
            <p className="mt-2 text-sm text-fg-muted">
              Tell us which car you like and when. A sales consultant confirms within the hour.
            </p>
            <LeadForm formId="zamer" layout="inline" submitLabel="Book a test drive" className="mt-4" />
          </div>
        }
      />

      {/* 14 · Most viewed */}
      <Section>
        <KitchenRail title="Most-viewed cars" subtitle="The cars Denver drivers are looking at right now." kitchens={hits} />
      </Section>

      {/* 15 · Blog */}
      <BlogTeaserSection />

      {/* 16 · FAQ */}
      <FaqSection group="home" />

      {/* 17 · Final call to action */}
      <FinalCta
        title="Let's find your next car"
        text="Tell us what you're looking for and what you'd like to spend. A sales consultant will send you matching cars and a monthly payment estimate within the hour."
        socials={settings.socials}
      />
    </>
  );
}
