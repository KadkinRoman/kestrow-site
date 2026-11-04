import type { Metadata } from 'next';
import { getPage } from '@/lib/content';
import type { Page } from '@/lib/content/types';

/**
 * Metadata of a static page: SEO from the Page entry in Strapi (title, description, ogImage, noIndex)
 * on top of the defaults from code. No entry or empty fields — the values from code stay.
 */
export async function pageMetadata(path: string, fallback: Metadata): Promise<Metadata> {
  const page = await getPage(path).catch((e: unknown) => {
    console.error(`[page-meta] could not read page "${path}":`, e instanceof Error ? e.message : e);
    return null;
  });
  return mergeMetadata(page, fallback);
}

export function mergeMetadata(page: Page | null, fallback: Metadata): Metadata {
  const seo = page?.seo;
  if (!seo) return fallback;
  const og = seo.ogImage;
  return {
    ...fallback,
    title: seo.title ?? fallback.title,
    description: seo.description ?? fallback.description,
    ...(og
      ? { openGraph: { ...(fallback.openGraph ?? {}), images: [{ url: og.url, width: og.width, height: og.height, alt: og.alt }] } }
      : {}),
    ...(seo.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
