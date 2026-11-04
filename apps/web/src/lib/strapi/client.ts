/**
 * Minimal Strapi 5 REST client (read-only, server-side only).
 * Caching lives one level up, in src/lib/content ('use cache' + cacheTag).
 */

type QueryValue = string | number | boolean | null | undefined | QueryValue[] | { [key: string]: QueryValue };
export type Query = Record<string, QueryValue>;

/** { filters: { slug: { $eq: 'x' } } } → filters[slug][$eq]=x (the qs format Strapi understands) */
export function toQueryString(params: Query): string {
  const parts: string[] = [];
  const walk = (value: QueryValue, key: string) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${key}[${i}]`));
    else if (typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, key ? `${key}[${k}]` : k);
    else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  };
  walk(params, '');
  return parts.join('&');
}

/** Strapi API address for the Next server (no trailing slash) */
export const strapiBaseUrl = () => (process.env.STRAPI_URL ?? 'http://127.0.0.1:1337').replace(/\/$/, '');

/** Absolute media URL: the local upload provider returns a /uploads/… path */
export function mediaUrl(url: string) {
  if (/^https?:\/\//.test(url)) return url;
  return `${(process.env.STRAPI_PUBLIC_URL ?? strapiBaseUrl()).replace(/\/$/, '')}${url}`;
}

export class StrapiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'StrapiError';
    this.status = status;
  }
}

/** 404 from Strapi: no entry / empty single type / no menu with that slug */
export const isNotFound = (e: unknown) => e instanceof StrapiError && e.status === 404;

const TIMEOUT_MS = 10_000;

export async function strapiGet<T>(path: string, params?: Query): Promise<T> {
  const qs = params ? toQueryString(params) : '';
  const url = `${strapiBaseUrl()}/api${path}${qs ? `?${qs}` : ''}`;
  const token = process.env.STRAPI_API_TOKEN;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    // a hung Strapi must not hang rendering or the build
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new StrapiError(res.status, `Strapi ${res.status} ${res.statusText}: ${decodeURIComponent(url)}`);
  return (await res.json()) as T;
}

export type StrapiList<T> = {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
};

export type StrapiSingle<T> = { data: T | null };

/** All entries of a collection, page by page (Strapi REST limit is 100 per page; sorted by id for stable pages) */
export async function strapiGetAll<T>(path: string, params: Query = {}): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; ; page++) {
    const res = await strapiGet<StrapiList<T>>(path, { sort: ['id:asc'], ...params, pagination: { page, pageSize: 100 } });
    all.push(...res.data);
    if (page >= res.meta.pagination.pageCount) return all;
  }
}
