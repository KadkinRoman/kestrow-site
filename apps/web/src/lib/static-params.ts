/**
 * With Cache Components generateStaticParams must return at least one set of params,
 * otherwise next build fails (docs: 01-app/02-guides/building.md). An empty collection in Strapi →
 * one placeholder slug, the page for it responds with notFound().
 */
const EMPTY = '__empty__';

export function atLeastOne<T extends Record<string, string>>(list: T[], keys: (keyof T)[]): T[] {
  return list.length ? list : [Object.fromEntries(keys.map((k) => [k, EMPTY])) as T];
}
