import Link from 'next/link';
import { Suspense } from 'react';
import { LeadForm } from '@/components/forms/LeadForm';
import { ModalButton } from '@/components/modals/ModalButton';
import { PromoCard } from '@/components/sections/Cards';
import { CtaBox, FinalCta } from '@/components/sections/Cta';
import { Rail } from '@/components/sections/Rail';
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';
import { Container, Section, SectionHeading } from '@/components/ui/layout';
import { Photo, staticPhoto } from '@/components/ui/Photo';
import { Tile, TileGrid } from '@/components/ui/Tile';
import {
  getKitchenCategories,
  getKitchenFilterOptions,
  getPromos,
  getSettings,
} from '@/lib/content';
import type { KitchenCategory } from '@/lib/content/types';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/routes';
import { CatalogFilters } from './CatalogFilters';
import { CatalogResults, CatalogResultsSkeleton, type CatalogSearchParams } from './CatalogResults';

export type { CatalogSearchParams };

export async function CatalogView({
  category,
  searchParams,
}: {
  category?: KitchenCategory;
  searchParams: Promise<CatalogSearchParams>;
}) {
  const [categories, options, promos, settings] = await Promise.all([
    getKitchenCategories(),
    getKitchenFilterOptions(),
    getPromos(),
    getSettings(),
  ]);

  const crumbs: Crumb[] = category
    ? [{ label: 'Cars', href: routes.catalog() }, { label: category.name }]
    : [{ label: 'Cars' }];

  return (
    <>
      {/* 1 · Heading, categories and filters */}
      <section className="pt-6 pb-8">
        <Container>
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-6 text-3xl font-semibold md:text-5xl">
            {category ? category.name : 'Cars for sale in Denver'}
          </h1>
          <p className="mt-3 max-w-3xl text-fg-muted md:text-lg">
            Hand-picked pre-owned cars with a 172-point inspection, a free vehicle history report and a transparent, no-haggle price.
          </p>

          <nav aria-label="Body types" className="mt-6">
            <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              {[{ slug: '', name: 'All' }, ...categories].map((c) => {
                const active = (category?.slug ?? '') === c.slug;
                return (
                  <li key={c.slug || 'all'} className="shrink-0">
                    <Link
                      href={c.slug ? routes.category(c.slug) : routes.catalog()}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'inline-flex min-h-10 items-center rounded-control border px-4 text-sm transition-colors',
                        active ? 'border-fg bg-fg text-bg' : 'border-line hover:border-fg',
                      )}
                    >
                      {c.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-6">
            <Suspense>
              <CatalogFilters options={options} />
            </Suspense>
          </div>
        </Container>
      </section>

      {/* 2 · Offers in the inventory — a rail of compact cards (final prototype) */}
      <Section spacing="sm">
        <Rail title="Choose a special offer for your next car" variant="wide" ariaLabel="Offers">
          {promos.map((p) => (
            <PromoCard key={p.slug} promo={p} showTerm period={settings.promoPeriod} />
          ))}
        </Rail>
      </Section>

      {/* 3 · Vehicle cards (depend on URL filters — streamed) */}
      <Section spacing="sm">
        <Suspense fallback={<CatalogResultsSkeleton />}>
          <CatalogResults category={category?.slug} searchParams={searchParams} />
        </Suspense>
      </Section>

      {/* 4 · Can't see the car you want */}
      <CtaBox
        dark={false}
        title="Can't see the car you want? Tell us what to look for"
        text="Send us a link or a listing of a car you like. We will search our network and auction access for a similar one in your budget."
        aside={<LeadForm formId="catalog-photo" layout="inline" submitLabel="Find this car for me" />}
      />

      {/* 5 · Offer comparison: photo of the paperwork, three steps, button (final prototype) */}
      <CtaBox
        title="Already have an offer from another dealer? We will try to beat it"
        text="Send us the quote. We will compare the price, fees and warranty, and come back with our own offer."
        actions={
          <ModalButton
            variant="contrast"
            size="lg"
            modal={{
              type: 'lead',
              title: "Beat a competitor's offer",
              text: 'Attach the quote you received. We will compare the price, fees and warranty and send you our own offer.',
              form: { formId: 'compare', submitLabel: 'Send me a better offer' },
            }}
          >
            Send me a better offer
          </ModalButton>
        }
        aside={
          <div className="grid gap-4">
            <Photo media={staticPhoto('financing.jpg', 'Dealer quote and financing paperwork on a desk')} label="Photo of the quote" ratio="16/10" sizes="(min-width: 1024px) 480px, 100vw" />
            <ol className="grid gap-2 text-sm sm:grid-cols-3">
              {['Send the dealer quote you have', 'We compare price, fees and warranty', 'We send you our own offer'].map((step, i) => (
                <li key={step} className="rounded-card bg-on-inverse/10 p-3">
                  <b className="text-on-inverse-muted">0{i + 1}</b>
                  <div className="mt-1">{step}</div>
                </li>
              ))}
            </ol>
          </div>
        }
      />

      {/* 6 · Hold a car / trade-in */}
      <Section>
        <TileGrid cols={2}>
          <Tile
            title="Hold your car for 48 hours"
            text="Found the one but need time? Send a request and we will keep it off the market while you arrange financing or a trade-in."
            footer={
              <div className="mt-5">
                <ModalButton
                  modal={{
                    type: 'lead',
                    title: 'Hold my car',
                    text: 'Leave your contact details and the car you like. We will reserve it for you and call to confirm.',
                    form: { submitLabel: 'Hold my car' },
                  }}
                >
                  Hold my car
                </ModalButton>
              </div>
            }
          />
          <Tile
            title="Have a car to trade in?"
            text="Get a written offer in minutes. Your trade-in value goes straight toward your next car."
            footer={
              <div className="mt-5">
                <ModalButton
                  variant="secondary"
                  modal={{
                    type: 'lead',
                    title: 'Trade-in valuation',
                    text: 'Tell us about your current car. We will send you a written offer, valid for 7 days.',
                    form: { formId: 'materials', submitLabel: 'Value my car' },
                  }}
                >
                  Value my car
                </ModalButton>
              </div>
            }
          />
        </TileGrid>
      </Section>

      {/* 7 · Final call to action */}
      <FinalCta
        title="We will find a car that fits your life"
        text="Answer a few questions about your budget and must-haves. We will send you cars that match, with real prices."
        socials={settings.socials}
        aside={
          <ModalButton variant="contrast" size="lg" className="w-full" modal={{ type: 'quiz' }}>
            Find your car
          </ModalButton>
        }
      />

      {category?.description && (
        <Section>
          <SectionHeading title={category.name} />
          <p className="mt-4 max-w-3xl text-fg-muted">{category.description}</p>
        </Section>
      )}
    </>
  );
}
