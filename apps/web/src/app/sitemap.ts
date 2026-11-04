import type { MetadataRoute } from 'next';
import { getArticleSlugs, getKitchenCategories, getKitchenSlugs, getProjects } from '@/lib/content';
import { routes } from '@/lib/routes';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** sitemap.xml: static pages + inventory body types, cars, customer stories and articles from Strapi */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, kitchens, projects, articles] = await Promise.all([
    getKitchenCategories(),
    getKitchenSlugs(),
    getProjects(),
    getArticleSlugs(),
  ]);

  const url = (path: string) => new URL(path, siteUrl).toString();
  const main = [routes.home(), routes.catalog(), routes.promos(), routes.projects(), routes.reviews(), routes.blog()];
  const info = [
    routes.about(),
    routes.contacts(),
    routes.buyers(),
    routes.zamer(),
    routes.materials(),
    routes.delivery(),
    routes.installation(),
    routes.warranty(),
    routes.payment(),
  ];

  return [
    ...main.map((p) => ({ url: url(p), changeFrequency: 'weekly' as const, priority: p === '/' ? 1 : 0.8 })),
    ...info.map((p) => ({ url: url(p), changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...categories.map((c) => ({ url: url(routes.category(c.slug)), changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...kitchens.map((k) => ({ url: url(routes.kitchen(k.category, k.slug)), changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...projects.map((p) => ({ url: url(routes.project(p.slug)), changeFrequency: 'monthly' as const, priority: 0.5 })),
    ...articles.map((a) => ({ url: url(routes.article(a.slug)), changeFrequency: 'monthly' as const, priority: 0.5 })),
  ];
}
