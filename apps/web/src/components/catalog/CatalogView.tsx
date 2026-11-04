import { Suspense } from 'react';
import { LeadForm } from '@/components/forms/LeadForm';
import { CtaBox } from '@/components/sections/Cta';
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';
import { Container, Section, SectionHeading } from '@/components/ui/layout';
import { getKitchenCategories, getKitchenFilterOptions, getKitchens } from '@/lib/content';
import type { KitchenCategory } from '@/lib/content/types';
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
  const [categories, options] = await Promise.all([getKitchenCategories(), getKitchenFilterOptions()]);
  // Cars per body type (unfiltered; each request is cached)
  const counts = await Promise.all(
    categories.map(async (c) => ({
      slug: c.slug,
      name: c.name,
      count: (await getKitchens({ category: c.slug }, { pageSize: 1 })).total,
    })),
  );

  const crumbs: Crumb[] = category
    ? [{ label: 'Cars', href: routes.catalog() }, { label: category.name }]
    : [{ label: 'Cars' }];

  return (
    <>
      <section className="pt-6 pb-6">
        <Container>
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-5 text-4xl md:text-6xl">{category ? category.name : 'Cars for sale in Denver'}</h1>
          <p className="mt-3 max-w-3xl text-fg-muted md:text-lg">
            Hand-picked pre-owned cars with a 172-point inspection, a free vehicle history report and a transparent, no-haggle price.
          </p>
        </Container>
      </section>

      <section className="pb-12">
        <Container className="grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
          <aside aria-label="Filters" className="no-scrollbar hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-surface" />}>
              <CatalogFilters options={options} categories={counts} category={category?.slug} />
            </Suspense>
          </aside>
          <div className="min-w-0">
            <Suspense fallback={<CatalogResultsSkeleton />}>
              <CatalogResults category={category?.slug} searchParams={searchParams} options={options} categories={counts} />
            </Suspense>
          </div>
        </Container>
      </section>

      <CtaBox
        dark={false}
        title="Can't see the car you want? Tell us what to look for"
        text="Send us a link or a listing of a car you like. We will search our network and auction access for a similar one in your budget."
        aside={<LeadForm formId="catalog-photo" layout="inline" submitLabel="Find this car for me" />}
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
