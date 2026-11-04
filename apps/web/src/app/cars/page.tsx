import type { Metadata } from 'next';
import { CatalogView } from '@/components/catalog/CatalogView';

export const metadata: Metadata = {
  title: 'Used cars for sale in Denver',
  description: 'Browse inspected pre-owned cars in Denver: SUVs, sedans, pickups, electric cars and more. No-haggle prices, free vehicle history reports and a 7-day money-back guarantee.',
};

export default function CatalogPage({ searchParams }: PageProps<'/cars'>) {
  return <CatalogView searchParams={searchParams} />;
}
