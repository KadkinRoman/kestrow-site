import type { SiteSettings } from '@/lib/content/types';
import { REVIEW_SUMMARY } from '@/lib/trust';

/**
 * schema.org card of the business for search engines (rendered once in the root layout).
 * AutoDealer is the schema.org type for a car dealership.
 */
export function businessJsonLd(settings: SiteSettings, siteUrl: string) {
  const [street, city, regionZip] = settings.address.split(',').map((s) => s.trim());
  const [region, postalCode] = (regionZip ?? '').split(' ');
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: settings.siteName,
    description: 'Hand-picked pre-owned cars in Denver, Colorado: 172-point inspection, no-haggle prices, financing and home delivery.',
    url: siteUrl,
    image: `${siteUrl}/opengraph-image.jpg`,
    telephone: settings.phone,
    email: settings.email || undefined,
    priceRange: '$$',
    address: street
      ? { '@type': 'PostalAddress', streetAddress: street, addressLocality: city, addressRegion: region, postalCode, addressCountry: 'US' }
      : undefined,
    areaServed: ['Denver, CO', 'Front Range, CO'],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '20:00',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: REVIEW_SUMMARY.rating,
      reviewCount: REVIEW_SUMMARY.count,
    },
  };
}
