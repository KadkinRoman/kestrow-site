import type { Metadata } from 'next';
import Link from 'next/link';
import { Fragment } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { LeadForm } from '@/components/forms/LeadForm';
import { ModalButton } from '@/components/modals/ModalButton';
import { CheckList, SpecsGrid } from '@/components/sections/Blocks';
import { CtaBox, QuizCta } from '@/components/sections/Cta';
import { KitchenRail } from '@/components/sections/KitchenRail';
import {
  BlogTeaserSection,
  GuaranteesSection,
  PromosRailSection,
  ReviewsSection,
  StepsSection,
} from '@/components/sections/Shared';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Container, Section, SectionHeading } from '@/components/ui/layout';
import { Photo } from '@/components/ui/Photo';
import { Tile, TileGrid } from '@/components/ui/Tile';
import { RichText } from '@/components/ui/RichText';
import { getKitchen, getKitchenSlugs, getSimilarKitchens } from '@/lib/content';
import { discountPercent, formatPrice, installmentFrom } from '@/lib/format';
import { routes } from '@/lib/routes';
import { atLeastOne } from '@/lib/static-params';
import { REVIEW_SUMMARY } from '@/lib/trust';

// The page depends entirely on the slug, and 404 and 308 must be sent as HTTP statuses (SEO), so the params
// check is not hidden inside <Suspense>: navigating here may wait for the server. Known slugs are prerendered.
export const instant = false;

type Props = { params: Promise<{ category: string; slug: string }> };

export async function generateStaticParams() {
  return atLeastOne(await getKitchenSlugs(), ['category', 'slug']);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const kitchen = await getKitchen((await params).slug);
  if (!kitchen) return {};
  return {
    title: kitchen.seo?.title ?? `${kitchen.name} for sale in Denver`,
    description: kitchen.seo?.description ?? `${kitchen.shortDesc}. ${formatPrice(kitchen.price)}, inspected and ready to drive at Kestrow Motors in Denver.`,
  };
}

export default async function KitchenPage({ params }: Props) {
  const { category, slug } = await params;
  const kitchen = await getKitchen(slug);
  if (!kitchen) notFound();
  // The car moved to another body type, so redirect to its current URL
  if (kitchen.category.slug !== category) permanentRedirect(routes.kitchen(kitchen.category.slug, kitchen.slug));

  const similar = await getSimilarKitchens(kitchen.slug, kitchen.category.slug);
  const discount = discountPercent(kitchen.price, kitchen.oldPrice);

  return (
    <>
      {/* 1 · Photos, price, buttons */}
      <section className="pt-6 pb-10">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'Cars', href: routes.catalog() },
              { label: kitchen.category.name, href: routes.category(kitchen.category.slug) },
              { label: kitchen.name },
            ]}
          />
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
            <div>
              <Photo media={kitchen.gallery[0]} label="Main car photo" ratio="4/3" priority sizes="(min-width: 1024px) 700px, 100vw" />
              {kitchen.gallery.length > 1 && (
                <div className="mt-3 grid grid-cols-6 gap-2">
                  {kitchen.gallery.slice(0, 6).map((m, i) => (
                    <Photo key={i} media={m} label={`Photo ${i + 1}`} ratio="1/1" sizes="120px" />
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                {discount > 0 && <Badge>−{discount}%</Badge>}
                {kitchen.badge && <Badge tone="light">{kitchen.badge}</Badge>}
              </div>
              <h1 className="mt-4 text-3xl font-semibold md:text-5xl">{kitchen.name}</h1>
              <p className="mt-2 text-fg-muted">{kitchen.shortDesc}</p>
              <div className="mt-6 flex flex-wrap items-baseline gap-x-4">
                <b className="font-display text-4xl font-normal md:text-5xl">{formatPrice(kitchen.price)}</b>
                {kitchen.oldPrice && <s className="text-lg text-fg-muted">{formatPrice(kitchen.oldPrice)}</s>}
              </div>
              <div className="mt-2 text-fg-muted">
                Estimated payment from {formatPrice(installmentFrom(kitchen.price))}/mo{' '}
                <ModalButton modal={{ type: 'installment' }} unstyled className="underline underline-offset-2">
                  see terms
                </ModalButton>
              </div>
              <p className="mt-4 text-sm text-fg-muted">
                One no-haggle price. Tax, title and registration are added at signing; there are no hidden dealer
                fees on top.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ModalButton
                  size="lg"
                  modal={{
                    type: 'lead',
                    title: `Get today's price on the ${kitchen.name}`,
                    text: 'Leave your contact details. A sales consultant will confirm availability and send you the out-the-door price.',
                    extra: { kitchen: kitchen.name },
                  }}
                >
                  Reserve this car
                </ModalButton>
                <ModalButton
                  size="lg"
                  variant="secondary"
                  modal={{
                    type: 'lead',
                    title: 'Book a test drive',
                    text: 'Pick a time and we will have the car cleaned and ready at the showroom.',
                    form: { formId: 'zamer', submitLabel: 'Book now' },
                    extra: { kitchen: kitchen.name },
                  }}
                >
                  Book a test drive
                </ModalButton>
              </div>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg-muted">
                <li>
                  <span className="text-star" aria-hidden>
                    ★★★★★{' '}
                  </span>
                  {REVIEW_SUMMARY.rating} from {REVIEW_SUMMARY.countLabel} reviews
                </li>
                <li>✓ 172-point inspection</li>
                <li>✓ 7-day money-back guarantee</li>
                <li>✓ Free vehicle history report</li>
              </ul>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-card bg-surface p-4 text-sm">
                <span>Right now you get a $1,000 trade-in bonus when you trade in your current car.</span>
                <Link href={routes.promos()} className="font-medium underline underline-offset-2">
                  Offer details
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2 · Specifications */}
      <Section>
        <SectionHeading title="Vehicle details" />
        <SpecsGrid specs={kitchen.specs} className="mt-6" />
      </Section>

      {/* 3 · What the price includes */}
      {(kitchen.included?.length || kitchen.excluded?.length) && (
        <Section>
          <SectionHeading title="What the price includes" />
          <TileGrid cols={2} className="mt-6">
            <Tile title="Included with every car" footer={<CheckList items={kitchen.included ?? []} />} />
            <Tile title="Optional extras" footer={<CheckList items={kitchen.excluded ?? []} negative />} />
          </TileGrid>
        </Section>
      )}

      {/* 4 · Description */}
      <Section>
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading title={`About the ${kitchen.name}`} />
            <RichText blocks={kitchen.description} className="mt-4 space-y-4" />
            {kitchen.highlights && (
              <CheckList
                items={kitchen.highlights.map((h) => (
                  <Fragment key={h.title}>
                    <b>{h.title}</b> {h.text}
                  </Fragment>
                ))}
              />
            )}
          </div>
          <Photo media={kitchen.gallery[1] ?? kitchen.gallery[0]} label="Interior and detail photos" sizes="(min-width: 1024px) 600px, 100vw" className="min-h-80" />
        </div>
      </Section>

      {/* 5 · Want it for less */}
      <CtaBox
        title="Love this car but want a lower payment?"
        text="We'll find a similar car with fewer miles on the clock or a lower price, so the monthly payment fits your budget."
        aside={
          <LeadForm
            formId="cheaper"
            layout="inline"
            dark
            submitLabel="Show me cheaper options"
            extra={{ kitchen: kitchen.name }}
          />
        }
      />

      {/* 6 · Similar cars, right after "Want it for less" (final prototype) */}
      <Section>
        <KitchenRail title="Similar cars" kitchens={similar} />
      </Section>

      {/* 7 · Stages */}
      <StepsSection group="kitchen" title="How to buy this car">
        <ModalButton
          modal={{
            type: 'lead',
            title: 'Book a test drive',
            text: 'A sales consultant will confirm a time and have the car ready for you.',
            form: { formId: 'zamer', submitLabel: 'Book my test drive' },
          }}
        >
          Book a test drive
        </ModalButton>
        <Button href={routes.zamer()} variant="secondary">
          How buying works
        </Button>
      </StepsSection>

      {/* 8 · Offers */}
      <PromosRailSection title="Offers and bonuses for you" subtitle="Special offers on your next car." />

      {/* 9 · Reviews */}
      <ReviewsSection id="kitchen-reviews" />

      {/* 10 · Guarantees */}
      <GuaranteesSection />

      {/* 11 · Quiz */}
      <QuizCta />

      {/* 12 · Blog */}
      <BlogTeaserSection />

      {/* 13 · Final call to action */}
      <CtaBox
        title="Want this car in your driveway?"
        text="Leave your phone number and a sales consultant will send you the out-the-door price and a monthly payment estimate."
        aside={
          <div className="flex flex-wrap gap-3">
            <ModalButton
              variant="contrast"
              size="lg"
              modal={{
                type: 'lead',
                title: "Get today's price",
                text: 'Leave your phone number and a sales consultant will confirm availability and the price.',
                extra: { kitchen: kitchen.name },
              }}
            >
              {"Get today's price"}
            </ModalButton>
            <ModalButton
              variant="inverse"
              size="lg"
              modal={{
                type: 'lead',
                title: 'Book a test drive',
                text: 'Pick a time and we will have the car cleaned and ready at the showroom.',
                form: { formId: 'zamer', submitLabel: 'Book now' },
              }}
            >
              Book a test drive
            </ModalButton>
          </div>
        }
      />
    </>
  );
}
