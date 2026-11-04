/**
 * Single access point to content: Strapi REST → domain types.
 *
 * Every function is cached ('use cache'): the data lands in the static shell of the pages,
 * lifetime — cacheLife('hours'). Invalidated by a Strapi webhook to /api/revalidate (tag 'strapi').
 */
import { cacheLife, cacheTag } from 'next/cache';
import { isNotFound, strapiGet, strapiGetAll, type Query, type StrapiList, type StrapiSingle } from '@/lib/strapi/client';
import {
  mapArticle,
  mapAuthor,
  mapCategory,
  mapFaq,
  mapForm,
  mapKitchen,
  mapMaterial,
  mapNavItem,
  mapPage,
  mapProject,
  mapPromo,
  mapQuiz,
  mapReview,
  mapSettings,
  mapStage,
  mapTag,
  mapTopline,
} from '@/lib/strapi/map';
import type {
  RawArticle,
  RawAuthor,
  RawCategory,
  RawFaq,
  RawForm,
  RawKitchen,
  RawKitchenTag,
  RawMaterial,
  RawNavItem,
  RawPage,
  RawProject,
  RawPromo,
  RawQuiz,
  RawReview,
  RawSetting,
  RawStage,
  RawTag,
  RawTopline,
} from '@/lib/strapi/raw';
import { COLOR_LABELS, FACADE_LABELS, PRICE_RANGES, STYLE_LABELS, toOptions } from './labels';
import type {
  ContentGroup,
  Kitchen,
  KitchenFilterOptions,
  KitchenFilters,
  LeadFormDef,
  LeadFormSpec,
  Paginated,
  Promo,
} from './types';

export type * from './types';

export const CATALOG_PAGE_SIZE = 12;
export const BLOG_PAGE_SIZE = 9;

/** Cache lifetime and tags. Call as the first line inside a function with 'use cache'. */
function cacheFor(...types: string[]) {
  cacheLife('hours');
  cacheTag('strapi', ...types.map((t) => `strapi:${t}`));
}

const toPaginated = <R, T>(res: StrapiList<R>, map: (r: R) => T): Paginated<T> => ({
  items: res.data.map(map),
  total: res.meta.pagination.total,
  page: res.meta.pagination.page,
  pageSize: res.meta.pagination.pageSize,
  pageCount: Math.max(1, res.meta.pagination.pageCount),
});

/* ---------- Settings and navigation ---------- */

/** An empty Strapi single type returns 404 — then null; other errors are rethrown (Next serves the previous version) */
async function getSingle<T>(path: string, params?: Query): Promise<T | null> {
  try {
    return (await strapiGet<StrapiSingle<T>>(path, params)).data;
  } catch (e) {
    if (isNotFound(e)) return null;
    throw e;
  }
}

export async function getSettings() {
  'use cache';
  cacheFor('setting');
  const data = await getSingle<RawSetting>('/setting', { populate: '*' });
  if (!data) throw new Error('Strapi: Site Settings are not filled in (single type setting)');
  return mapSettings(data);
}

export async function getTopline() {
  'use cache';
  cacheFor('topline');
  return mapTopline(await getSingle<RawTopline>('/topline'));
}

/** Menu from the Navigation plugin: main — header, footer — footer columns, legal — bottom line */
export async function getNavigation(slug: 'main' | 'footer' | 'legal') {
  'use cache';
  cacheTag('strapi', 'strapi:navigation');
  try {
    const items = await strapiGet<RawNavItem[]>(`/navigation/render/${slug}`, { type: 'TREE' });
    cacheLife('hours');
    return items.map(mapNavItem);
  } catch (e) {
    // No menu with that slug (the plugin responds 500) or Strapi is unavailable: a site without a menu is better
    // than a 500 on every page. Cached briefly so the menu comes back on its own.
    console.error(`[navigation] menu "${slug}" not loaded:`, e instanceof Error ? e.message : e);
    cacheLife('minutes');
    return [];
  }
}

/* ---------- Inventory (Strapi "kitchen" types = vehicles) ---------- */

const KITCHEN_LIST_POPULATE = { category: true, gallery: true };
// Second sort key is id: otherwise entries with equal values jump between pages
const CREATED_SORT = ['createdAt:asc', 'id:asc'];
const SEO_POPULATE = { populate: ['ogImage'] };

export async function getKitchenCategories() {
  'use cache';
  cacheFor('kitchen-category');
  const res = await strapiGet<StrapiList<RawCategory>>('/kitchen-categories', {
    sort: ['order:asc', 'id:asc'],
    populate: { seo: SEO_POPULATE },
    pagination: { pageSize: 100 },
  });
  return res.data.map(mapCategory);
}

export async function getKitchenCategory(slug: string) {
  'use cache';
  cacheFor('kitchen-category');
  const res = await strapiGet<StrapiList<RawCategory>>('/kitchen-categories', {
    filters: { slug: { $eq: slug } },
    populate: { seo: SEO_POPULATE },
  });
  return res.data[0] ? mapCategory(res.data[0]) : null;
}

/** Inventory filters → Strapi filters */
function kitchenFilters(f: KitchenFilters): Query {
  const q: Query = {};
  // A car without a body type has no /cars/[category]/[slug] address — it is left out of lists
  q.category = f.category ? { slug: { $eq: f.category } } : { id: { $notNull: true } };
  if (f.style) q.style = { $eq: f.style };
  if (f.color) q.color = { $eq: f.color };
  if (f.facade) q.facade = { $eq: f.facade };
  if (f.sale) q.oldPrice = { $notNull: true };
  if (f.hit) q.isHit = { $eq: true };
  if (f.tag) q.tags = { slug: { $eq: f.tag } };
  const range = f.price ? PRICE_RANGES[f.price] : undefined;
  if (range) q.price = { $gte: range.min, ...(range.max ? { $lt: range.max } : {}) };
  return q;
}

export async function getKitchens(
  filters: KitchenFilters = {},
  { page = 1, pageSize = CATALOG_PAGE_SIZE }: { page?: number; pageSize?: number } = {},
): Promise<Paginated<Kitchen>> {
  'use cache';
  cacheFor('kitchen');
  const res = await strapiGet<StrapiList<RawKitchen>>('/kitchens', {
    filters: kitchenFilters(filters),
    sort: CREATED_SORT,
    populate: KITCHEN_LIST_POPULATE,
    pagination: { page, pageSize: Math.min(pageSize, 100) },
  });
  return toPaginated(res, mapKitchen);
}

/** Cars for body-type tab strips (Home, About, Buyer's guide) */
export async function getKitchensForRail(limit = 60) {
  'use cache';
  cacheFor('kitchen');
  return (await getKitchens({}, { pageSize: limit })).items;
}

export async function getHitKitchens(limit = 10) {
  'use cache';
  cacheFor('kitchen');
  return (await getKitchens({ hit: true }, { pageSize: limit })).items;
}

export async function getKitchen(slug: string) {
  'use cache';
  cacheFor('kitchen');
  const res = await strapiGet<StrapiList<RawKitchen>>('/kitchens', {
    filters: { slug: { $eq: slug } },
    populate: {
      category: true,
      highlights: true,
      specs: true,
      included: true,
      excluded: true,
      gallery: true,
      tags: true,
      seo: SEO_POPULATE,
    },
  });
  return res.data[0] ? mapKitchen(res.data[0]) : null;
}

/** Inventory collections (kitchen-tag) — quick filters */
export async function getKitchenTags() {
  'use cache';
  cacheFor('kitchen-tag');
  const res = await strapiGet<StrapiList<RawKitchenTag>>('/kitchen-tags', {
    sort: ['order:asc', 'id:asc'],
    pagination: { pageSize: 100 },
  });
  return res.data.map(mapTag);
}

/** All category/slug pairs — for generateStaticParams */
export async function getKitchenSlugs() {
  'use cache';
  cacheFor('kitchen');
  const all = await strapiGetAll<RawKitchen>('/kitchens', {
    fields: ['slug'],
    populate: { category: { fields: ['slug'] } },
  });
  return all.flatMap((k) => (k.category ? [{ category: k.category.slug, slug: k.slug }] : []));
}

/** Related: first from the same category, then the rest (arguments are strings: a compact cache key) */
export async function getSimilarKitchens(slug: string, categorySlug: string, limit = 6) {
  'use cache';
  cacheFor('kitchen');
  const query = (category: Query) =>
    strapiGet<StrapiList<RawKitchen>>('/kitchens', {
      filters: { slug: { $ne: slug }, category },
      sort: CREATED_SORT,
      populate: KITCHEN_LIST_POPULATE,
      pagination: { pageSize: limit },
    });
  const same = await query({ slug: { $eq: categorySlug } });
  const rest = same.data.length < limit ? await query({ slug: { $ne: categorySlug } }) : { data: [] };
  return [...same.data, ...rest.data].slice(0, limit).map(mapKitchen);
}

/** Values of the inventory filter selects — Strapi enum keys with labels */
export async function getKitchenFilterOptions(): Promise<KitchenFilterOptions> {
  const tags = await getKitchenTags();
  return {
    price: Object.entries(PRICE_RANGES).map(([value, r]) => ({ value, label: r.label })),
    style: toOptions(STYLE_LABELS),
    color: toOptions(COLOR_LABELS),
    facade: toOptions(FACADE_LABELS),
    tags: tags.map((t) => ({ value: t.slug, label: t.name })),
  };
}

/* ---------- Customer stories (Strapi "project") ---------- */

export async function getProjects(limit?: number) {
  'use cache';
  cacheFor('project');
  const res = await strapiGet<StrapiList<RawProject>>('/projects', {
    sort: CREATED_SORT,
    populate: '*',
    pagination: { pageSize: limit ?? 100 },
  });
  return res.data.map(mapProject);
}

export async function getProject(slug: string) {
  'use cache';
  cacheFor('project');
  const res = await strapiGet<StrapiList<RawProject>>('/projects', {
    filters: { slug: { $eq: slug } },
    populate: { chips: true, specs: true, gallery: true, seo: SEO_POPULATE },
  });
  return res.data[0] ? mapProject(res.data[0]) : null;
}

/* ---------- Blog ---------- */

const ARTICLE_LIST_POPULATE = { tag: true, cover: true };

export async function getArticleTags() {
  'use cache';
  cacheFor('article-tag');
  const res = await strapiGet<StrapiList<RawTag>>('/article-tags', {
    sort: ['order:asc', 'id:asc'],
    pagination: { pageSize: 100 },
  });
  return res.data.map((t) => ({ slug: t.slug, name: t.name }));
}

export async function getArticles({
  tag,
  page = 1,
  pageSize = BLOG_PAGE_SIZE,
}: { tag?: string; page?: number; pageSize?: number } = {}) {
  'use cache';
  cacheFor('article');
  const res = await strapiGet<StrapiList<RawArticle>>('/articles', {
    filters: tag ? { tag: { slug: { $eq: tag } } } : {},
    sort: ['date:desc', 'id:desc'],
    populate: ARTICLE_LIST_POPULATE,
    pagination: { page, pageSize: Math.min(pageSize, 100) },
  });
  return toPaginated(res, mapArticle);
}

export async function getArticle(slug: string) {
  'use cache';
  cacheFor('article');
  const res = await strapiGet<StrapiList<RawArticle>>('/articles', {
    filters: { slug: { $eq: slug } },
    // media inside a dynamic zone only comes with populate[content][populate]=*
    populate: {
      tag: true,
      author: { populate: ['photo'] },
      expert: { populate: ['photo'] },
      cover: true,
      seo: SEO_POPULATE,
      content: { populate: '*' },
    },
  });
  return res.data[0] ? mapArticle(res.data[0]) : null;
}

export async function getArticleSlugs() {
  'use cache';
  cacheFor('article');
  return (await strapiGetAll<RawArticle>('/articles', { fields: ['slug'] })).map((a) => ({ slug: a.slug }));
}

export async function getRelatedArticles(slug: string, limit = 3) {
  'use cache';
  cacheFor('article');
  const res = await strapiGet<StrapiList<RawArticle>>('/articles', {
    filters: { slug: { $ne: slug } },
    sort: ['date:desc', 'id:desc'],
    populate: ARTICLE_LIST_POPULATE,
    pagination: { pageSize: limit },
  });
  return res.data.map(mapArticle);
}

/* ---------- Marketing ---------- */

/** Offers: without their own end date they follow the shared period from settings; expired ones (own date in the past) are hidden */
export async function getPromos() {
  'use cache';
  cacheFor('promo');
  const today = new Date().toISOString().slice(0, 10);
  const res = await strapiGet<StrapiList<RawPromo>>('/promos', {
    filters: { $or: [{ endsAt: { $null: true } }, { endsAt: { $gte: today } }] },
    sort: ['order:asc', 'id:asc'],
    populate: { image: true },
    pagination: { pageSize: 100 },
  });
  return res.data.map(mapPromo);
}

/** The main offer (isMain) or the first one; no offers — undefined, pages hide the block */
export async function getMainPromo(): Promise<Promo | undefined> {
  'use cache';
  cacheFor('promo');
  const promos = await getPromos();
  return promos.find((p) => p.isMain) ?? promos.at(0);
}

export async function getReviews() {
  'use cache';
  cacheFor('review');
  const res = await strapiGet<StrapiList<RawReview>>('/reviews', {
    sort: ['order:asc', 'id:asc'],
    populate: { photo: true, video: true, kitchen: { fields: ['slug', 'name'], populate: { category: { fields: ['slug'] } } } },
    pagination: { pageSize: 100 },
  });
  return res.data.map(mapReview);
}

/** Reviews for the home page: those marked "show on home", otherwise the first ones */
export async function getHomeReviews(limit = 6) {
  const all = await getReviews();
  const marked = all.filter((r) => r.showOnHome);
  return (marked.length ? marked : all).slice(0, limit);
}

/** Team for the About page: staff with the isTeam flag */
export async function getTeam() {
  'use cache';
  cacheFor('author');
  const res = await strapiGet<StrapiList<RawAuthor>>('/authors', {
    filters: { isTeam: { $eq: true } },
    sort: ['order:asc', 'id:asc'],
    populate: { photo: true },
    pagination: { pageSize: 100 },
  });
  return res.data.map(mapAuthor);
}

/* ---------- Static pages ---------- */

const PAGE_POPULATE = { sections: { populate: ['image'] }, seo: SEO_POPULATE };

/** The Page entry by path (/guide/delivery): SEO, intro, sections; no entry — null */
export async function getPage(path: string) {
  'use cache';
  cacheFor('page');
  const res = await strapiGet<StrapiList<RawPage>>('/pages', { filters: { path: { $eq: path } }, populate: PAGE_POPULATE });
  return res.data[0] ? mapPage(res.data[0]) : null;
}

export async function getPages() {
  'use cache';
  cacheFor('page');
  return (await strapiGetAll<RawPage>('/pages', { populate: PAGE_POPULATE })).map(mapPage);
}

export async function getMaterials() {
  'use cache';
  cacheFor('material');
  const res = await strapiGet<StrapiList<RawMaterial>>('/materials', {
    sort: ['order:asc', 'id:asc'],
    populate: { image: true },
    pagination: { pageSize: 100 },
  });
  return res.data.map(mapMaterial);
}

export async function getFaqs(group: ContentGroup) {
  'use cache';
  cacheFor('faq');
  const res = await strapiGet<StrapiList<RawFaq>>('/faqs', {
    filters: { group: { $eq: group } },
    sort: ['order:asc', 'id:asc'],
    pagination: { pageSize: 100 },
  });
  return res.data.map(mapFaq);
}

export async function getOrderStages(group: ContentGroup) {
  'use cache';
  cacheFor('order-stage');
  const res = await strapiGet<StrapiList<RawStage>>('/order-stages', {
    filters: { group: { $eq: group } },
    sort: ['order:asc', 'id:asc'],
    pagination: { pageSize: 100 },
  });
  return res.data.map(mapStage);
}

export async function getQuiz() {
  'use cache';
  cacheFor('quiz');
  return mapQuiz(await getSingle<RawQuiz>('/quiz', { populate: { steps: { populate: '*' } } }));
}

/* ---------- Forms ---------- */

/** All request forms with CRM sending settings. Pass to the browser through toFormDefs (without CRM fields). */
export async function getForms() {
  'use cache';
  cacheFor('form');
  const res = await strapiGet<StrapiList<RawForm>>('/forms', {
    sort: ['id:asc'],
    populate: { inputs: true },
    pagination: { pageSize: 100 },
  });
  return res.data.map(mapForm);
}

export async function getForm(formId: string) {
  return (await getForms()).find((f) => f.formId === formId) ?? null;
}

/** Form descriptions for the browser: formId → fields and texts */
export function toFormDefs(forms: LeadFormSpec[]): Record<string, LeadFormDef> {
  return Object.fromEntries(
    forms.map(({ formId, submitLabel, successMessage, fields }) => [formId, { formId, submitLabel, successMessage, fields }]),
  );
}
