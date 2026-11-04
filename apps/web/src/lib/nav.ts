import { getKitchenCategories, getKitchensForRail, getKitchenSlugs, getKitchenTags } from '@/lib/content';
import { PRICE_RANGES } from '@/lib/content/labels';
import { routes } from '@/lib/routes';

/**
 * Header navigation as plain serializable data: built on the server, rendered by the desktop mega menu and the
 * mobile accordion alike. The information architecture lives here (not in the CMS "Main" menu).
 */
export type NavLinkItem = { label: string; href: string; hint?: string; count?: number; slug?: string };
export type NavGroup = { heading?: string; links: NavLinkItem[]; tiles?: boolean };
export type NavPromo = { title: string; text: string; cta: string; href: string; image: { url: string; alt: string } };
export type NavSection = {
  id: string;
  label: string;
  /** Plain link (no panel) when `columns` is empty */
  href: string;
  /** Panel columns; each column stacks one or more groups */
  columns: NavGroup[][];
  promo?: NavPromo;
  footer?: NavLinkItem;
  /** Path prefixes that mark the section as the current one (aria-current) */
  match: string[];
};
export type SearchSuggestion = { name: string; href: string; hint: string };
export type NavData = { sections: NavSection[]; suggestions: SearchSuggestion[]; total: number };

const catalogHref = (params: Record<string, string>) => `${routes.catalog()}?${new URLSearchParams(params).toString()}`;

export async function getNavData(): Promise<NavData> {
  const [categories, slugs, tags, cars] = await Promise.all([
    getKitchenCategories(),
    getKitchenSlugs(),
    getKitchenTags(),
    getKitchensForRail(60),
  ]);

  const counts = new Map<string, number>();
  for (const s of slugs) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  const total = slugs.length;

  const bodyTypes: NavLinkItem[] = categories.map((c) => ({
    label: c.name,
    href: routes.category(c.slug),
    slug: c.slug,
    count: counts.get(c.slug) ?? 0,
  }));

  const byPrice: NavLinkItem[] = Object.entries(PRICE_RANGES).map(([key, r]) => ({
    label: r.label,
    href: catalogHref({ price: key }),
  }));

  const sections: NavSection[] = [
    {
      id: 'shop',
      label: 'Shop cars',
      href: routes.catalog(),
      match: [routes.catalog()],
      columns: [
        [{ heading: 'By body type', links: bodyTypes, tiles: true }],
        [{ heading: 'By price', links: byPrice }],
        [
          {
            heading: 'By fuel',
            links: [
              { label: 'Hybrid', href: catalogHref({ style: 'hybrid' }) },
              { label: 'Electric', href: catalogHref({ style: 'electric' }) },
            ],
          },
          {
            heading: 'Collections',
            links: [
              ...tags.map((t) => ({ label: t.name, href: catalogHref({ tag: t.slug }) })),
              { label: 'Price drops', href: catalogHref({ sale: '1' }) },
            ],
          },
        ],
      ],
      promo: {
        title: '$1,000 trade-in bonus',
        text: 'Trade in your car when you buy from us and get $1,000 on top of its value.',
        cta: 'See the offer',
        href: routes.promos(),
        image: { url: '/images/trade-in.jpg', alt: 'Trading in a car at the Kestrow showroom' },
      },
      footer: { label: `Browse all ${total} cars`, href: routes.catalog() },
    },
    {
      id: 'sell',
      label: 'Sell or trade',
      href: routes.materials(),
      match: [routes.materials()],
      columns: [
        [
          {
            links: [
              { label: 'Value my car', href: routes.materials(), hint: 'Get a trade-in value for your car' },
              { label: 'How trade-in works', href: routes.materials(), hint: 'From the appraisal to the paperwork' },
            ],
          },
        ],
        [
          {
            links: [
              { label: '$1,000 trade-in bonus', href: routes.promos(), hint: 'Added on top of your car’s value' },
              { label: 'We pay off your loan', href: routes.materials(), hint: 'Trade in a car that is not paid off yet' },
            ],
          },
        ],
      ],
    },
    {
      id: 'finance',
      label: 'Financing',
      href: routes.payment(),
      match: [routes.payment(), routes.warranty()],
      columns: [
        [
          {
            links: [
              { label: 'Get pre-approved', href: routes.payment(), hint: 'Soft credit check, no impact on your score' },
              { label: 'Payment calculator', href: `${routes.home()}#estimate`, hint: 'See the monthly payment before you visit' },
            ],
          },
        ],
        [
          {
            links: [
              { label: 'Financing guide', href: routes.buyers(), hint: 'Rates, terms and down payment explained' },
              { label: 'Warranty & protection', href: routes.warranty(), hint: 'What is covered after you drive away' },
            ],
          },
        ],
      ],
    },
    {
      id: 'why',
      label: 'Why Kestrow',
      href: routes.about(),
      match: [routes.installation(), routes.delivery(), routes.zamer(), routes.projects(), routes.about(), routes.blog()],
      columns: [
        [
          {
            links: [
              { label: '172-point inspection', href: routes.installation(), hint: 'Every car, before it is listed' },
              { label: '7-day money-back guarantee', href: routes.warranty(), hint: 'Return it if it is not right' },
              { label: 'Home delivery', href: routes.delivery(), hint: 'Bring the car to your door' },
              { label: 'Test drive', href: routes.zamer(), hint: 'Book a time that suits you' },
            ],
          },
        ],
        [
          {
            links: [
              { label: 'Customer stories', href: routes.projects(), hint: 'Real buyers, real cars' },
              { label: 'About & team', href: routes.about(), hint: 'Who you will be talking to' },
              { label: 'Blog', href: routes.blog(), hint: 'Buying tips and guides' },
            ],
          },
        ],
      ],
    },
    { id: 'reviews', label: 'Reviews', href: routes.reviews(), match: [routes.reviews()], columns: [] },
  ];

  const suggestions: SearchSuggestion[] = [
    ...categories.map((c) => ({ name: c.name, href: routes.category(c.slug), hint: 'Body type' })),
    ...cars.map((k) => ({ name: k.name, href: routes.kitchen(k.category.slug, k.slug), hint: k.category.name })),
  ];

  return { sections, suggestions, total };
}
