/**
 * Request attribution: UTM tags, ad click id, external referrer and the first page of the visit.
 * Pure functions shared by the browser (saved on arrival at the site) and the server (parsing form fields).
 * Form fields: utm[source] … utm[term], attr[clickId], attr[referrer], attr[landing].
 */

export const UTM_KEYS = ['source', 'medium', 'campaign', 'content', 'term'] as const;
export type UtmKey = (typeof UTM_KEYS)[number];

export type Attribution = {
  utm: Partial<Record<UtmKey, string>>;
  /** "gclid=…" / "fbclid=…" — an ad click (Google, Meta) */
  clickId?: string;
  /** External site the visitor came from (our own domain does not count) */
  referrer?: string;
  /** First page of the visit: path and parameters */
  landing?: string;
  /** When it was saved, ISO — only in browser storage (lifetime), not sent with the form */
  capturedAt?: string;
};

/** Bitrix24 lead field for each UTM tag (crm.item.add, camelCase) */
export const UTM_LEAD_FIELDS: Record<UtmKey, string> = {
  source: 'utmSource',
  medium: 'utmMedium',
  campaign: 'utmCampaign',
  content: 'utmContent',
  term: 'utmTerm',
};

const MAX = 200;
const CLICK_IDS = ['gclid', 'msclkid', 'fbclid'] as const;

/** No control characters or square brackets (BB codes in the lead comment), at most 200 characters */
const clip = (v: string | null | undefined) => (v ? v.replace(/[\u0000-\u001f\u007f[\]]/g, '').trim().slice(0, MAX) : '');

export const hasCampaign = (a: Attribution) => !!a.clickId || UTM_KEYS.some((k) => !!a.utm[k]);

export const isEmptyAttribution = (a: Attribution) => !hasCampaign(a) && !a.referrer && !a.landing;

/** Attribution of the current visit from the page URL and document.referrer */
export function attributionFromVisit(input: {
  search: string;
  referrer: string;
  path: string;
  host: string;
  now?: Date;
}): Attribution {
  const params = new URLSearchParams(input.search);
  const utm: Attribution['utm'] = {};
  for (const k of UTM_KEYS) {
    const v = clip(params.get(`utm_${k}`));
    if (v) utm[k] = v;
  }

  let clickId: string | undefined;
  for (const k of CLICK_IDS) {
    const v = clip(params.get(k));
    if (v) {
      clickId = `${k}=${v}`;
      break;
    }
  }

  let referrer: string | undefined;
  try {
    const r = new URL(input.referrer);
    if (/^https?:$/.test(r.protocol) && r.host && r.host !== input.host) referrer = clip(r.href);
  } catch {
    // empty or malformed referrer — ignored
  }

  const landing = clip(`${input.path}${input.search}`) || undefined;
  return { utm, clickId, referrer, landing, capturedAt: (input.now ?? new Date()).toISOString() };
}

/** Into the request FormData (browser) */
export function appendAttributionFields(data: FormData, a: Attribution) {
  for (const k of UTM_KEYS) {
    const v = a.utm[k];
    if (v) data.set(`utm[${k}]`, v);
  }
  if (a.clickId) data.set('attr[clickId]', a.clickId);
  if (a.referrer) data.set('attr[referrer]', a.referrer);
  if (a.landing) data.set('attr[landing]', a.landing);
}

/** From the request FormData (server): all strings ≤ 200 characters without control characters or brackets; the referrer is an http(s) URL */
export function readAttributionFields(data: FormData): Attribution {
  const str = (key: string) => {
    const v = data.get(key);
    return typeof v === 'string' ? clip(v) : '';
  };
  const utm: Attribution['utm'] = {};
  for (const k of UTM_KEYS) {
    const v = str(`utm[${k}]`);
    if (v) utm[k] = v;
  }
  const clickId = str('attr[clickId]');
  const referrer = str('attr[referrer]');
  const landing = str('attr[landing]');
  return {
    utm,
    clickId: /^[a-z]+=[\w.-]+$/i.test(clickId) ? clickId : undefined,
    referrer: /^https?:\/\/\S+$/.test(referrer) ? referrer : undefined,
    // site path: starts with "/", no spaces; "|", "," and ":" are fine in ad tags
    landing: /^\/\S*$/.test(landing) ? landing : undefined,
  };
}
