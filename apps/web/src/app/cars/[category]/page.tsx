import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogView } from '@/components/catalog/CatalogView';
import { getKitchenCategories, getKitchenCategory } from '@/lib/content';
import { atLeastOne } from '@/lib/static-params';

// The page depends entirely on the slug, and 404 and 308 must be sent as HTTP statuses (SEO), so the params
// check is not hidden inside <Suspense>: navigating here may wait for the server. Known slugs are prerendered.
export const instant = false;

type Props = PageProps<'/cars/[category]'>;

export async function generateStaticParams() {
  return atLeastOne((await getKitchenCategories()).map((c) => ({ category: c.slug })), ['category']);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getKitchenCategory((await params).category);
  if (!category) return {};
  // Acronyms (SUVs) keep their case, other body-type names go lowercase mid-sentence
  const label = /^[A-Z]{2,}/.test(category.name) ? category.name : category.name.toLowerCase();
  return {
    title: category.seo?.title ?? `Used ${label} for sale in Denver`,
    description: category.seo?.description ?? `Inspected pre-owned ${label} at Kestrow Motors in Denver, CO: no-haggle prices, free history reports and a 7-day money-back guarantee.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await getKitchenCategory((await params).category);
  if (!category) notFound();
  return <CatalogView category={category} searchParams={searchParams} />;
}
