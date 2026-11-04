import type { Metadata } from 'next';
import Link from 'next/link';
import { Fragment } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { LeadForm } from '@/components/forms/LeadForm';
import { ModalButton } from '@/components/modals/ModalButton';
import { CheckList, SpecsGrid } from '@/components/sections/Blocks';
import { CtaBox } from '@/components/sections/Cta';
import { KitchenRail } from '@/components/sections/KitchenRail';
import { ReviewsSection } from '@/components/sections/Shared';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container, Section } from '@/components/ui/layout';
import { RichText } from '@/components/ui/RichText';
import { MobileBuyBar } from '@/components/vehicle/MobileBuyBar';
import { VehicleBadges } from '@/components/vehicle/VehicleBadges';
import { VehicleGallery } from '@/components/vehicle/VehicleGallery';
import { getKitchen, getKitchenSlugs, getSimilarKitchens } from '@/lib/content';
import { formatPrice, installmentFrom } from '@/lib/format';
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

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const TRUST = ['172-point inspection', '7-day money-back guarantee', 'Free vehicle history report', '12-month warranty'];

export default async function KitchenPage({ params }: Props) {
  const { category, slug } = await params;
  const kitchen = await getKitchen(slug);
  if (!kitchen) notFound();
  // The car moved to another body type, so redirect to its current URL
  if (kitchen.category.slug !== category) permanentRedirect(routes.kitchen(kitchen.category.slug, kitchen.slug));

  const similar = await getSimilarKitchens(kitchen.slug, kitchen.category.slug);
  const price = formatPrice(kitchen.price);
  const payment = formatPrice(installmentFrom(kitchen.price));
  const facts = [
    { label: 'Year', value: kitchen.height },
    { label: 'Mileage', value: kitchen.dimensions },
    { label: 'Fuel', value: kitchen.style && cap(kitchen.style) },
    { label: 'Drivetrain', value: kitchen.facade },
    { label: 'Color', value: kitchen.color && cap(kitchen.color) },
  ].filter((f): f is { label: string; value: string } => !!f.value);
  const leadModal = {
    type: 'lead' as const,
    title: `Check availability: ${kitchen.name}`,
    text: 'Leave your contact details. A sales consultant will confirm availability and send you the out-the-door price.',
    extra: { kitchen: kitchen.name },
  };

  return (
    <div className="pb-24 lg:pb-0">
      <section className="pt-6 pb-10">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'Cars', href: routes.catalog() },
              { label: kitchen.category.name, href: routes.category(kitchen.category.slug) },
              { label: kitchen.name },
            ]}
          />
          <div className="mt-5 grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_400px]">
            {/* 1 · Gallery */}
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              <VehicleGallery photos={kitchen.gallery} name={kitchen.name} />
            </div>

            {/* 2 · Sticky price / CTA panel */}
            <aside aria-label="Price and actions" className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start lg:sticky lg:top-24">
              <div className="rounded-card border border-line bg-bg p-5 md:p-6">
                <VehicleBadges kitchen={kitchen} />
                <h1 className="mt-3 text-3xl md:text-4xl">{kitchen.name}</h1>
                <p className="mt-2 text-fg-muted">{kitchen.shortDesc}</p>

                <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <b className="font-display tabular text-4xl md:text-5xl">{price}</b>
                  {kitchen.oldPrice && <s className="tabular text-lg text-fg-muted">{formatPrice(kitchen.oldPrice)}</s>}
                </div>
                <p className="tabular mt-1 text-lg font-semibold">≈ {payment}/mo*</p>
                <p className="mt-2 text-xs text-fg-muted">
                  *Est. payment: 5.9% APR, 72 months, $0 down, before taxes and fees. One no-haggle price; tax, title
                  and registration are added at signing.{' '}
                  <ModalButton modal={{ type: 'installment' }} unstyled className="underline underline-offset-2 hover:text-fg">
                    See terms
                  </ModalButton>
                </p>

                <div className="mt-5 grid gap-3">
                  <ModalButton size="lg" modal={leadModal}>
                    Check availability
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
                  <Link
                    href={routes.materials()}
                    className="inline-flex min-h-11 items-center justify-center text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Value my trade-in →
                  </Link>
                </div>

                <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                  {TRUST.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span aria-hidden className="text-success">
                        ✓
                      </span>
                      {t}
                    </li>
                  ))}
                  <li className="flex gap-2 text-fg-muted">
                    <span aria-hidden className="text-star">
                      ★
                    </span>
                    {REVIEW_SUMMARY.rating} from {REVIEW_SUMMARY.countLabel} reviews
                  </li>
                </ul>
              </div>
            </aside>

            {/* 3 · Specs, features, description */}
            <div className="min-w-0 space-y-10 lg:col-start-1 lg:row-start-2">
              <section aria-labelledby="key-specs">
                <h2 id="key-specs" className="text-2xl md:text-3xl">
                  Key specs
                </h2>
                <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                  {facts.map((f) => (
                    <div key={f.label} className="rounded-card bg-surface p-3">
                      <dt className="text-xs text-fg-muted">{f.label}</dt>
                      <dd className="tabular mt-0.5 font-semibold">{f.value}</dd>
                    </div>
                  ))}
                </dl>
                {kitchen.specs.length > 0 && <SpecsGrid specs={kitchen.specs} className="mt-4" />}
              </section>

              {kitchen.highlights && kitchen.highlights.length > 0 && (
                <section aria-labelledby="key-features">
                  <h2 id="key-features" className="text-2xl md:text-3xl">
                    Key features
                  </h2>
                  <CheckList
                    items={kitchen.highlights.map((h) => (
                      <Fragment key={h.title}>
                        <b>{h.title}</b> {h.text}
                      </Fragment>
                    ))}
                  />
                </section>
              )}

              {(kitchen.included?.length || kitchen.excluded?.length) && (
                <section aria-labelledby="included" className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h2 id="included" className="text-2xl md:text-3xl">
                      Included with every car
                    </h2>
                    <CheckList items={kitchen.included ?? []} />
                  </div>
                  {kitchen.excluded?.length ? (
                    <div>
                      <h2 className="text-2xl md:text-3xl">Optional extras</h2>
                      <CheckList items={kitchen.excluded} negative />
                    </div>
                  ) : null}
                </section>
              )}

              <section aria-labelledby="about">
                <h2 id="about" className="text-2xl md:text-3xl">
                  About the {kitchen.name}
                </h2>
                <RichText blocks={kitchen.description} className="mt-4 space-y-4" />
              </section>
            </div>
          </div>
        </Container>
      </section>

      <Section>
        <KitchenRail title="Similar cars" kitchens={similar} />
        <p className="mt-4 text-xs text-fg-muted">*Est. payment: 5.9% APR, 72 months, $0 down, before taxes and fees.</p>
      </Section>

      <ReviewsSection id="kitchen-reviews" />

      <CtaBox
        dark={false}
        title="Love this car but want a lower payment?"
        text="We'll find a similar car with fewer miles on the clock or a lower price, so the monthly payment fits your budget."
        aside={
          <LeadForm
            formId="cheaper"
            layout="inline"
            submitLabel="Show me cheaper options"
            extra={{ kitchen: kitchen.name }}
          />
        }
      />

      <MobileBuyBar name={kitchen.name} price={price} payment={payment} />
    </div>
  );
}
