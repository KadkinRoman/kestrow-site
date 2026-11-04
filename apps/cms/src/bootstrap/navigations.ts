import type { Core } from '@strapi/strapi';

/** Menus the site reads: name → slug (the plugin builds the slug from the name) */
export const SITE_NAVIGATIONS = ['Main', 'Footer', 'Legal'] as const;

/**
 * Ensures the main / footer / legal menus exist (empty if missing) —
 * in production without the demo seed editors have something to fill in, and the site never loses a menu.
 */
export async function ensureNavigations(strapi: Core.Strapi) {
  const admin = strapi.plugin('navigation').service('admin');
  const existing = new Set((await admin.get({})).map((n: { name: string }) => n.name));
  for (const name of SITE_NAVIGATIONS) {
    if (existing.has(name)) continue;
    await admin.post({ payload: { name, visible: true }, auditLog: undefined });
    strapi.log.info(`[navigation] created empty menu "${name}"`);
  }
}
