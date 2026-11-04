/** Converts Strapi responses to the domain types (src/lib/content/types.ts). */
import { COLOR_LABELS, FACADE_LABELS, STYLE_LABELS } from '@/lib/content/labels';
import type {
  Article,
  ArticleBlock,
  Author,
  ContentGroup,
  Faq,
  FormFieldType,
  Kitchen,
  KitchenCategory,
  KitchenTag,
  LeadFormSpec,
  Material,
  Media,
  NavItem,
  OrderStage,
  Page,
  Project,
  Promo,
  Quiz,
  Review,
  ReviewSource,
  RichText,
  RichTextBlock,
  Seo,
  SiteSettings,
  SocialType,
  Topline,
} from '@/lib/content/types';
import { inlineText } from '@/lib/rich-text';
import { routes } from '@/lib/routes';
import { slugify } from '@/lib/slug';
import { mediaUrl } from './client';
import type {
  RawArticle,
  RawArticleComponent,
  RawAuthor,
  RawCategory,
  RawFaq,
  RawForm,
  RawKitchen,
  RawKitchenTag,
  RawMaterial,
  RawMedia,
  RawNavItem,
  RawPage,
  RawProject,
  RawPromo,
  RawQuiz,
  RawReview,
  RawSeo,
  RawSetting,
  RawStage,
  RawTopline,
} from './raw';

const opt = <T>(v: T | null | undefined): T | undefined => (v === null ? undefined : v);
const lines = (text: string) => text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

export function mapMedia(m: RawMedia | null | undefined): Media | undefined {
  if (!m?.url) return undefined;
  return {
    url: mediaUrl(m.url),
    alt: opt(m.alternativeText),
    width: opt(m.width),
    height: opt(m.height),
    mime: opt(m.mime),
  };
}

const mapGallery = (list: RawMedia[] | null | undefined) =>
  (list ?? []).map(mapMedia).filter((m): m is Media => !!m);

/** An empty string from the admin panel means "not filled in" */
const text = (v: string | null | undefined) => (v?.trim() ? v : undefined);

export function mapSeo(s: RawSeo | undefined): Seo | undefined {
  if (!s) return undefined;
  return { title: text(s.title), description: text(s.description), ogImage: mapMedia(s.ogImage), noIndex: !!s.noIndex };
}

/* ---------- Rich text ---------- */

/**
 * Prepares blocks for rendering: absolute image URLs (Strapi puts /uploads/… in blocks) and
 * unique heading ids (table-of-contents anchors). `usedIds` is shared across the document — an article
 * made of several text blocks never repeats an id.
 */
function prepareRichText(blocks: RichText | null | undefined, usedIds = new Set<string>()): RichText {
  return (blocks ?? []).map((b): RichTextBlock => {
    if (b.type === 'image') return { ...b, image: { ...b.image, url: mediaUrl(b.image.url) } };
    if (b.type !== 'heading') return b;
    const base = slugify(inlineText(b.children)) || 'section';
    let id = base;
    for (let n = 2; usedIds.has(id); n++) id = `${base}-${n}`;
    usedIds.add(id);
    return { ...b, id };
  });
}

/* ---------- Settings and menu ---------- */

export function mapSettings(s: RawSetting): SiteSettings {
  return {
    siteName: s.siteName,
    tagline: s.header?.tagline ?? '',
    phone: s.phone,
    phoneHref: `tel:${s.phone.replace(/[^\d+]/g, '')}`,
    workHours: s.header?.workHours ?? '',
    email: s.email ?? '',
    address: s.address ?? '',
    // A placeholder link ("#", empty) — the button is not shown
    socials: (s.socials ?? [])
      .filter((x) => /^https?:\/\//.test(x.url))
      .map((x) => ({ type: x.type as SocialType, label: x.label, url: x.url })),
    reviewLinks: s.reviewLinks ?? [],
    legalName: opt(s.footer?.legalName) ?? text(s.company?.legalName),
    mapUrl: /^https?:\/\//.test(s.mapUrl ?? '') ? (s.mapUrl as string) : undefined,
    promoPeriod: s.promoPeriod ? { startsAt: opt(s.promoPeriod.startsAt), endsAt: opt(s.promoPeriod.endsAt) } : undefined,
    company: s.company
      ? {
          legalName: text(s.company.legalName),
          registrationNumber: text(s.company.registrationNumber),
          taxId: text(s.company.taxId),
          legalAddress: text(s.company.legalAddress),
        }
      : undefined,
    forms: {
      consentText:
        text(s.forms?.consentText) ?? 'I agree to the processing of my personal data in accordance with the Privacy Policy',
      successTitle: text(s.forms?.successTitle) ?? 'Thank you! Your request has been sent.',
      successText: text(s.forms?.successText) ?? 'Our team will get back to you shortly.',
      errorText: text(s.forms?.errorText) ?? 'We couldn\'t send your request. Please call us or try again.',
    },
  };
}

/* ---------- Forms ---------- */

const FIELD_TYPES = new Set<FormFieldType>(['text', 'tel', 'email', 'textarea', 'file', 'radio', 'checkbox']);
/** Names taken by the form's service fields (website is a bot trap): such a field would break sending */
const RESERVED_FIELD_NAMES = new Set(['website', 'agree', 'formId', 'page']);

export function mapForm(f: RawForm): LeadFormSpec {
  const inputs = (f.inputs ?? []).filter((i) => {
    const reserved = RESERVED_FIELD_NAMES.has(i.name) || i.name.startsWith('extra');
    if (reserved) console.warn(`[forms] form "${f.formId}": field "${i.name}" uses a reserved name, field skipped`);
    return !reserved;
  });
  return {
    formId: f.formId,
    title: f.title,
    submitLabel: text(f.submitLabel) ?? 'Send',
    successMessage: text(f.successMessage),
    willSendToCrm: f.willSendToCrm !== false,
    crmTitle: text(f.crmTitle) ?? `Website: ${f.title}`,
    // Field added later: may be empty in old entries — the source is "Website (contact form)"
    crmSourceId: text(f.crmSourceId) ?? 'CALLBACK',
    fields: inputs.map((i) => ({
      name: i.name,
      label: i.label,
      type: FIELD_TYPES.has(i.type as FormFieldType) ? (i.type as FormFieldType) : 'text',
      placeholder: text(i.placeholder),
      required: !!i.required,
      options: lines(i.options ?? ''),
    })),
  };
}

export function mapTopline(t: RawTopline | null): Topline {
  if (!t) return { enabled: false, text: '' };
  return {
    enabled: !!t.enabled && !!t.text,
    text: t.text ?? '',
    link: t.linkUrl ? { label: t.linkLabel || 'Learn more', href: t.linkUrl } : undefined,
  };
}

/**
 * href of a menu item. The plugin's TREE render joins path along the tree (/about/projects),
 * so for INTERNAL items the address is built from the related entry type — through routes, as everywhere.
 */
function navHref(item: RawNavItem): string {
  if (item.type === 'EXTERNAL') return item.path || item.externalPath || '#';
  if (item.type === 'WRAPPER') return '';
  const r = item.related;
  switch (r?.__type) {
    case 'api::page.page':
      return r.path ?? routes.home();
    case 'api::kitchen-category.kitchen-category':
      return r.slug ? routes.category(r.slug) : routes.catalog();
    case 'api::kitchen.kitchen':
      return r.slug && r.category?.slug ? routes.kitchen(r.category.slug, r.slug) : routes.catalog();
    case 'api::article.article':
      return r.slug ? routes.article(r.slug) : routes.blog();
    case 'api::project.project':
      return r.slug ? routes.project(r.slug) : routes.projects();
    case 'api::promo.promo':
      return routes.promos();
    default:
      return item.path ?? routes.home();
  }
}

export function mapNavItem(item: RawNavItem): NavItem {
  const href = navHref(item);
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    path: href,
    externalPath: item.type === 'EXTERNAL' ? href : undefined,
    items: item.items?.length ? item.items.map(mapNavItem) : undefined,
    additionalFields: item.additionalFields?.description ? { description: item.additionalFields.description } : undefined,
  };
}

/* ---------- Catalog ---------- */

export function mapCategory(c: RawCategory): KitchenCategory {
  return {
    slug: c.slug,
    name: c.name,
    shortName: c.shortName,
    order: c.order ?? 0,
    description: opt(c.description),
    seo: mapSeo(c.seo),
  };
}

const label = (labels: Record<string, string>, key?: string | null) => (key ? (labels[key] ?? key) : '');

export const mapTag = (t: RawKitchenTag): KitchenTag => ({ slug: t.slug, name: t.name, order: t.order ?? 0 });

export function mapKitchen(k: RawKitchen): Kitchen {
  return {
    slug: k.slug,
    name: k.name,
    category: k.category ? mapCategory(k.category) : { slug: 'cars', name: 'Cars', shortName: 'Cars', order: 0 },
    price: k.price,
    oldPrice: opt(k.oldPrice),
    dimensions: opt(k.dimensions),
    height: opt(k.height),
    shortDesc: k.shortDesc ?? '',
    description: prepareRichText(k.description),
    highlights: k.highlights?.map((h) => ({ title: h.title, text: h.text ?? '' })),
    style: label(STYLE_LABELS, k.style),
    facade: label(FACADE_LABELS, k.facade),
    color: label(COLOR_LABELS, k.color),
    badge: opt(k.badge),
    isHit: !!k.isHit,
    specs: k.specs ?? [],
    included: k.included?.map((i) => i.text),
    excluded: k.excluded?.map((i) => i.text),
    gallery: mapGallery(k.gallery),
    tags: (k.tags ?? []).map(mapTag),
    seo: mapSeo(k.seo),
  };
}

export function mapProject(p: RawProject): Project {
  return {
    slug: p.slug,
    title: p.title,
    chips: (p.chips ?? []).map((c) => c.text),
    excerpt: p.excerpt ?? '',
    description: prepareRichText(p.description),
    specs: p.specs ?? [],
    priceFrom: opt(p.priceFrom),
    gallery: mapGallery(p.gallery),
    seo: mapSeo(p.seo),
  };
}

/* ---------- Blog ---------- */

/** Table from a JSON field: only arrays of strings, cells are strings (malformed JSON from the admin does not break the article) */
function tableRows(raw: unknown): string[][] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(Array.isArray).map((row: unknown[]) => row.map((cell) => (cell == null ? '' : String(cell))));
}

function mapArticleBlock(c: RawArticleComponent, usedIds: Set<string>): ArticleBlock | null {
  switch (c.__component) {
    case 'article.text':
      return c.body?.length ? { type: 'text', blocks: prepareRichText(c.body, usedIds) } : null;
    case 'article.image':
      return { type: 'image', image: mapMedia(c.image), caption: opt(c.caption) };
    case 'article.tip':
      return { type: 'tip', title: c.title || 'Expert tip', text: c.text };
    case 'article.quote':
      return { type: 'quote', text: c.text };
    case 'article.cta':
      return { type: 'cta', title: c.title, text: c.text ?? '', button: c.buttonLabel || 'Talk to us' };
    case 'article.table': {
      const [head = [], ...rows] = tableRows(c.rows);
      return head.length ? { type: 'table', head, rows } : null;
    }
    default:
      return null;
  }
}

export const mapAuthor = (a: RawAuthor): Author => ({
  id: a.id,
  name: a.name,
  role: opt(a.role),
  photo: mapMedia(a.photo),
  text: text(a.text),
  isTeam: !!a.isTeam,
  order: a.order ?? 0,
});

export function mapArticle(a: RawArticle): Article {
  const usedIds = new Set<string>();
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt ?? '',
    lead: opt(a.lead),
    cover: mapMedia(a.cover),
    tag: a.tag ? { slug: a.tag.slug, name: a.tag.name } : { slug: '', name: 'Article' },
    author: a.author ? mapAuthor(a.author) : undefined,
    expert: a.expert ? mapAuthor(a.expert) : undefined,
    publishedAt: a.date,
    readingMinutes: opt(a.readingMinutes),
    content: (a.content ?? []).map((c) => mapArticleBlock(c, usedIds)).filter((b): b is ArticleBlock => !!b),
    seo: mapSeo(a.seo),
  };
}

/* ---------- Marketing ---------- */

export function mapPromo(p: RawPromo): Promo {
  return {
    slug: p.slug,
    title: p.title,
    shortText: p.shortText ?? '',
    text: p.text ?? p.shortText ?? '',
    kind: p.kind,
    isMain: !!p.isMain,
    endsAt: opt(p.endsAt),
    image: mapMedia(p.image),
  };
}

export const mapMaterial = (m: RawMaterial): Material => ({
  slug: m.slug,
  title: m.title,
  description: opt(m.description),
  image: mapMedia(m.image),
});

const REVIEW_SOURCES = new Set<ReviewSource>(['site', 'google', 'houzz']);

export const mapReview = (r: RawReview): Review => ({
  id: r.id,
  name: r.name,
  caption: r.caption || r.name,
  text: opt(r.text),
  rating: opt(r.rating),
  photo: mapMedia(r.photo),
  videoUrl: r.video?.url ? mediaUrl(r.video.url) : opt(r.videoUrl),
  source: REVIEW_SOURCES.has(r.source as ReviewSource) ? (r.source as ReviewSource) : 'site',
  url: /^https?:\/\//.test(r.url ?? '') ? (r.url as string) : undefined,
  place: text(r.place),
  date: opt(r.date),
  kitchen:
    r.kitchen?.slug && r.kitchen.category?.slug
      ? { slug: r.kitchen.slug, name: r.kitchen.name, category: r.kitchen.category.slug }
      : undefined,
  showOnHome: !!r.showOnHome,
});

/** Static page: SEO, intro and sections (rich text with absolute image URLs) */
export function mapPage(p: RawPage): Page {
  const usedIds = new Set<string>();
  return {
    slug: p.slug,
    path: p.path,
    title: p.title,
    lead: text(p.lead),
    sections: (p.sections ?? [])
      .map((sec) => ({ title: text(sec.title), body: prepareRichText(sec.body, usedIds), image: mapMedia(sec.image) }))
      .filter((sec) => sec.title || sec.body.length || sec.image),
    seo: mapSeo(p.seo),
  };
}

/** In Strapi a question has one group (page); the same question on several pages means separate entries */
export const mapFaq = (f: RawFaq): Faq => ({
  id: f.id,
  question: f.question,
  answer: f.answer,
  groups: [f.group as ContentGroup],
});

export const mapStage = (s: RawStage): OrderStage => ({
  id: s.id,
  title: s.title,
  text: opt(s.text),
  group: s.group as ContentGroup,
  order: s.order ?? 0,
});

export function mapQuiz(q: RawQuiz | null): Quiz {
  return {
    title: q?.title ?? 'Find your car',
    steps: (q?.steps ?? []).map((s) => ({ id: s.key, question: s.question, options: lines(s.options), image: mapMedia(s.image) })),
    final: {
      title: q?.finalTitle || 'Where should we send your matches?',
      text: q?.finalText ?? '',
      submitLabel: q?.submitLabel || 'Get my matches',
    },
  };
}
