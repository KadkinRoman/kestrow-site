/**
 * Domain content types — what pages and components receive.
 * Data comes from Strapi (src/lib/strapi) and is converted to these types by mappers.
 */

export type Media = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  mime?: string;
};

/* ---------- Rich text (the blocks field in Strapi 5) ---------- */

export type RichTextInline =
  | { type: 'text'; text: string; bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean; code?: boolean }
  | { type: 'link'; url: string; children: RichTextInline[] };

export type RichTextListItem = { type: 'list-item'; children: RichTextInline[] };

export type RichTextBlock =
  | { type: 'paragraph'; children: RichTextInline[] }
  /** id — anchor for the table of contents; set by the mapper (unique within the document) */
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: RichTextInline[]; id?: string }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: (RichTextListItem | Extract<RichTextBlock, { type: 'list' }>)[] }
  | { type: 'quote'; children: RichTextInline[] }
  | { type: 'code'; children: RichTextInline[] }
  | { type: 'image'; image: { url: string; alternativeText?: string | null; width?: number; height?: number } };

export type RichText = RichTextBlock[];

export type Seo = {
  title?: string;
  description?: string;
  ogImage?: Media;
  /** Do not index the page */
  noIndex?: boolean;
};

/* ---------- Navigation (strapi-plugin-navigation format, render?type=TREE) ---------- */

export type NavItemType = 'INTERNAL' | 'EXTERNAL' | 'WRAPPER';

export type NavItem = {
  id: number;
  title: string;
  type: NavItemType;
  path: string;
  externalPath?: string;
  items?: NavItem[];
  additionalFields?: { description?: string };
};

/* ---------- Site settings (single types: setting, topline) ---------- */

export type SocialType = 'instagram' | 'pinterest' | 'facebook' | 'whatsapp' | 'telegram' | 'youtube';

export type SocialLink = {
  type: SocialType;
  label: string;
  url: string;
};

export type SiteSettings = {
  siteName: string;
  tagline: string;
  phone: string;
  phoneHref: string;
  workHours: string;
  email: string;
  address: string;
  socials: SocialLink[];
  reviewLinks: { label: string; url: string }[];
  legalName?: string;
  /** Map link ("Get directions") */
  mapUrl?: string;
  /** Shared validity period of offers */
  promoPeriod?: { startsAt?: string; endsAt?: string };
  /** Company details for the block on the Contact page and the policy */
  company?: Company;
  forms: FormTexts;
};

export type Company = {
  legalName?: string;
  registrationNumber?: string;
  taxId?: string;
  legalAddress?: string;
};

/* ---------- Request forms ---------- */

/** Shared form texts (Site Settings → Form texts) */
export type FormTexts = {
  consentText: string;
  successTitle: string;
  successText: string;
  errorText: string;
};

export type FormFieldType = 'text' | 'tel' | 'email' | 'textarea' | 'file' | 'radio' | 'checkbox';

export type FormField = {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required: boolean;
  /** Options for radio */
  options: string[];
};

/** Form for the browser: fields and texts */
export type LeadFormDef = {
  formId: string;
  submitLabel: string;
  successMessage?: string;
  fields: FormField[];
};

/** The whole form — with Bitrix24 sending settings (server only) */
export type LeadFormSpec = LeadFormDef & {
  title: string;
  willSendToCrm: boolean;
  crmTitle: string;
  crmSourceId: string;
};

export type Topline = {
  enabled: boolean;
  text: string;
  link?: { label: string; href: string };
};

/* ---------- Catalog ---------- */

export type KitchenCategory = {
  slug: string;
  name: string; // "Pickup trucks" — body type
  shortName: string; // "Pickups" — for tabs
  order: number;
  description?: string;
  seo?: Seo;
};

export type Spec = { label: string; value: string };

/** Inventory collection ("Under 30,000 miles", "Family-friendly") — a trait of a vehicle */
export type KitchenTag = { slug: string; name: string; order: number };

/** A vehicle listing (Strapi "kitchen" type — shared engine). dimensions = mileage, height = model year */
export type Kitchen = {
  slug: string;
  name: string;
  category: KitchenCategory;
  price: number;
  oldPrice?: number;
  dimensions?: string;
  height?: string;
  shortDesc: string;
  description: RichText;
  highlights?: { title: string; text: string }[];
  /** Human-readable labels (the mapper translates Strapi enum keys): style = fuel, facade = drivetrain, color = exterior color */
  style: string;
  facade: string;
  color: string;
  badge?: string;
  isHit?: boolean;
  specs: Spec[];
  included?: string[];
  excluded?: string[];
  gallery: Media[];
  tags: KitchenTag[];
  seo?: Seo;
};

/** Customer story (Strapi "project" type): a delivered car; priceFrom = price paid */
export type Project = {
  slug: string;
  title: string;
  chips: string[];
  excerpt: string;
  description: RichText;
  specs: Spec[];
  priceFrom?: number;
  gallery: Media[];
  seo?: Seo;
};

/* ---------- Blog ---------- */

export type ArticleTag = { slug: string; name: string };
/** Staff member: article author or expert, team member on the About page */
export type Author = {
  id: number;
  name: string;
  role?: string;
  photo?: Media;
  text?: string;
  isTeam: boolean;
  order: number;
};
export type Employee = Author;

/** Article blocks — the article.* dynamic zone in Strapi */
export type ArticleBlock =
  | { type: 'text'; blocks: RichText }
  | { type: 'image'; image?: Media; caption?: string }
  | { type: 'tip'; title: string; text: string }
  | { type: 'quote'; text: string }
  | { type: 'cta'; title: string; text: string; button: string }
  | { type: 'table'; head: string[]; rows: string[][] };

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  lead?: string;
  cover?: Media;
  tag: ArticleTag;
  author?: Author;
  /** Expert who reviewed the article (card next to the table of contents) */
  expert?: Author;
  publishedAt: string; // ISO
  readingMinutes?: number;
  content: ArticleBlock[];
  seo?: Seo;
};

/* ---------- Marketing ---------- */

export type PromoKind = 'sale' | 'gift';

export type Promo = {
  slug: string;
  title: string;
  shortText: string;
  /** Text in the offer modal */
  text: string;
  kind: PromoKind;
  isMain?: boolean;
  endsAt?: string;
  image?: Media;
};

export type Material = {
  slug: string;
  title: string;
  description?: string;
  image?: Media;
};

export type ReviewSource = 'site' | 'google' | 'houzz';

export type Review = {
  id: number;
  name: string;
  caption: string; // "Maya's 2021 Subaru Outback"
  text?: string;
  rating?: number;
  photo?: Media;
  videoUrl?: string;
  source: ReviewSource;
  /** Link to the original review */
  url?: string;
  /** Neighborhood */
  place?: string;
  date?: string; // ISO date
  /** Car from the inventory — "View car" */
  kitchen?: { slug: string; name: string; category: string };
  showOnHome: boolean;
};

/** Where a question/stage is shown. In Strapi — an enum or a relation to a page. */
export type ContentGroup =
  | 'home'
  | 'kitchen'
  | 'about'
  | 'offers'
  | 'materials'
  | 'warranty'
  | 'payment'
  | 'measurement'
  | 'delivery'
  | 'installation'
  | 'contact'
  | 'reviews';

export type Faq = {
  id: number;
  question: string;
  answer: string;
  groups: ContentGroup[];
};

export type OrderStage = {
  id: number;
  title: string;
  text?: string;
  group: ContentGroup;
  order: number;
};

/* ---------- Static pages ---------- */

export type PageSection = { title?: string; body: RichText; image?: Media };

/** The Page entry in Strapi: SEO, intro and text sections of a static route */
export type Page = {
  slug: string;
  path: string;
  title: string;
  lead?: string;
  sections: PageSection[];
  seo?: Seo;
};

/* ---------- Quiz ---------- */

export type QuizStep = {
  id: string;
  question: string;
  options: string[];
  image?: Media;
};

export type Quiz = {
  title: string;
  steps: QuizStep[];
  final: { title: string; text: string; submitLabel: string };
};

/* ---------- Catalog: filters and pagination ---------- */

/** Values are keys from the URL (?style=hybrid): they match the enum keys in Strapi */
export type KitchenFilters = {
  category?: string;
  price?: string; // 'under-25k' | '25k-40k' | 'over-40k'
  style?: string;
  color?: string;
  facade?: string;
  sale?: boolean;
  hit?: boolean;
  /** collection slug (kitchen-tag) */
  tag?: string;
};

export type FilterOption = { value: string; label: string };

export type KitchenFilterOptions = {
  price: FilterOption[];
  style: FilterOption[];
  color: FilterOption[];
  facade: FilterOption[];
  /** Collections from Strapi (kitchen-tag) */
  tags: FilterOption[];
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};
