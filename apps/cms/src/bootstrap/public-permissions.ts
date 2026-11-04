import type { Core } from '@strapi/strapi';

/** Collections the site reads without a token (find + findOne) */
const COLLECTIONS = [
  'page',
  'kitchen-category',
  'kitchen-tag',
  'kitchen',
  'project',
  'article-tag',
  'author',
  'article',
  'promo',
  'material',
  'review',
  'faq',
  'order-stage',
  'form',
] as const;

/** Single types (find) */
const SINGLES = ['setting', 'topline', 'quiz'] as const;

/** Public API of the menu plugin: GET /api/navigation/render/:slug */
const PLUGIN_ACTIONS = ['plugin::navigation.client.render', 'plugin::navigation.client.renderChild'];

const ROLE_UID = 'plugin::users-permissions.role';
const PERMISSION_UID = 'plugin::users-permissions.permission';

/**
 * Grants the Public role read-only access to published content.
 * Idempotent: adds missing permissions and removes nothing.
 */
export async function ensurePublicPermissions(strapi: Core.Strapi) {
  const role = await strapi.db.query(ROLE_UID).findOne({ where: { type: 'public' } });
  if (!role) return;

  const actions = [
    ...COLLECTIONS.flatMap((name) => [`api::${name}.${name}.find`, `api::${name}.${name}.findOne`]),
    ...SINGLES.map((name) => `api::${name}.${name}.find`),
    ...PLUGIN_ACTIONS,
  ];

  const existing = await strapi.db.query(PERMISSION_UID).findMany({ where: { role: role.id }, select: ['action'] });
  const have = new Set(existing.map((p: { action: string }) => p.action));
  const missing = actions.filter((action) => !have.has(action));

  for (const action of missing) {
    await strapi.db.query(PERMISSION_UID).create({ data: { action, role: role.id } });
  }
  if (missing.length) strapi.log.info(`[permissions] Public: read permissions added — ${missing.length}`);
}
