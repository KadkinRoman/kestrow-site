/**
 * Shape of Strapi REST responses for the fields in use (schemas — apps/cms/src/api/*).
 * Only what the mapper reads; extra fields are ignored.
 */
import type { RichText } from '@/lib/content/types';

type Base = { id: number; documentId: string };

export type RawMedia = {
  url: string;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
  mime?: string | null;
};

export type RawSeo = { title?: string | null; description?: string | null; ogImage?: RawMedia | null; noIndex?: boolean } | null;

export type RawCategory = Base & {
  name: string;
  shortName: string;
  slug: string;
  order?: number | null;
  description?: string | null;
  seo?: RawSeo;
};

export type RawKitchenTag = Base & { name: string; slug: string; order?: number | null };

export type RawKitchen = Base & {
  name: string;
  slug: string;
  category?: RawCategory | null;
  price: number;
  oldPrice?: number | null;
  dimensions?: string | null;
  height?: string | null;
  shortDesc?: string | null;
  description?: RichText | null;
  highlights?: { title: string; text?: string | null }[];
  style?: string | null;
  facade?: string | null;
  color?: string | null;
  badge?: string | null;
  isHit?: boolean | null;
  specs?: { label: string; value: string }[];
  included?: { text: string }[];
  excluded?: { text: string }[];
  gallery?: RawMedia[] | null;
  tags?: RawKitchenTag[] | null;
  seo?: RawSeo;
};

export type RawProject = Base & {
  title: string;
  slug: string;
  chips?: { text: string }[];
  excerpt?: string | null;
  description?: RichText | null;
  specs?: { label: string; value: string }[];
  priceFrom?: number | null;
  gallery?: RawMedia[] | null;
  seo?: RawSeo;
};

export type RawTag = Base & { name: string; slug: string; order?: number | null };

export type RawArticleComponent =
  | { __component: 'article.text'; body?: RichText | null }
  | { __component: 'article.image'; image?: RawMedia | null; caption?: string | null }
  | { __component: 'article.tip'; title?: string | null; text: string }
  | { __component: 'article.quote'; text: string }
  | { __component: 'article.cta'; title: string; text?: string | null; buttonLabel?: string | null }
  | { __component: 'article.table'; caption?: string | null; rows: string[][] };

export type RawAuthor = Base & {
  name: string;
  role?: string | null;
  photo?: RawMedia | null;
  text?: string | null;
  isTeam?: boolean | null;
  order?: number | null;
};

export type RawArticle = Base & {
  title: string;
  slug: string;
  excerpt?: string | null;
  lead?: string | null;
  cover?: RawMedia | null;
  tag?: RawTag | null;
  author?: RawAuthor | null;
  expert?: RawAuthor | null;
  date: string;
  readingMinutes?: number | null;
  content?: RawArticleComponent[];
  seo?: RawSeo;
};

export type RawPromo = Base & {
  title: string;
  slug: string;
  shortText?: string | null;
  text?: string | null;
  kind: 'sale' | 'gift';
  isMain?: boolean | null;
  endsAt?: string | null;
  image?: RawMedia | null;
};

export type RawMaterial = Base & { title: string; slug: string; description?: string | null; image?: RawMedia | null };

export type RawReview = Base & {
  name: string;
  caption?: string | null;
  text?: string | null;
  rating?: number | null;
  photo?: RawMedia | null;
  video?: RawMedia | null;
  videoUrl?: string | null;
  source?: string | null;
  url?: string | null;
  place?: string | null;
  date?: string | null;
  kitchen?: { slug: string; name: string; category?: { slug: string } | null } | null;
  showOnHome?: boolean | null;
};

export type RawPage = Base & {
  title: string;
  slug: string;
  path: string;
  lead?: string | null;
  sections?: { title?: string | null; body?: RichText | null; image?: RawMedia | null }[];
  seo?: RawSeo;
};

export type RawFaq = Base & { question: string; answer: string; group: string; order?: number | null };

export type RawStage = Base & { title: string; text?: string | null; group: string; order?: number | null };

export type RawSetting = Base & {
  siteName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  socials?: { type: string; label: string; url: string }[];
  reviewLinks?: { label: string; url: string }[];
  header?: { tagline?: string | null; workHours?: string | null } | null;
  footer?: { about?: string | null; copyright?: string | null; legalName?: string | null } | null;
  mapUrl?: string | null;
  promoPeriod?: { startsAt?: string | null; endsAt?: string | null } | null;
  company?: {
    legalName?: string | null;
    registrationNumber?: string | null;
    taxId?: string | null;
    legalAddress?: string | null;
  } | null;
  forms?: {
    consentText?: string | null;
    successTitle?: string | null;
    successText?: string | null;
    errorText?: string | null;
  } | null;
};

export type RawForm = Base & {
  title: string;
  formId: string;
  submitLabel?: string | null;
  successMessage?: string | null;
  willSendToCrm?: boolean | null;
  crmTitle?: string | null;
  crmSourceId?: string | null;
  inputs?: {
    name: string;
    label: string;
    type?: string | null;
    placeholder?: string | null;
    required?: boolean | null;
    options?: string | null;
  }[];
};

export type RawTopline = Base & { enabled?: boolean | null; text?: string | null; linkLabel?: string | null; linkUrl?: string | null };

export type RawQuiz = Base & {
  title: string;
  steps?: { key: string; question: string; options: string; image?: RawMedia | null }[];
  finalTitle?: string | null;
  finalText?: string | null;
  submitLabel?: string | null;
};

/** Menu item from GET /api/navigation/render/:slug?type=TREE */
export type RawNavItem = {
  id: number;
  title: string;
  type: 'INTERNAL' | 'EXTERNAL' | 'WRAPPER';
  path?: string | null;
  externalPath?: string | null;
  related?: ({ __type: string; slug?: string; path?: string; category?: { slug?: string } | null } & Record<string, unknown>) | null;
  items?: RawNavItem[] | null;
  additionalFields?: { description?: string } | null;
};
