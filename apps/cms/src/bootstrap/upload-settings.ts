import type { Core } from '@strapi/strapi';

/**
 * Media library settings from the environment. MEDIA_RESPONSIVE_DIMENSIONS=false disables responsive image copies
 * (large/medium/small — three files and sharp work per upload): unnecessary on a small server,
 * the site resizes images itself via next/image. An empty variable leaves the setting alone (as set
 * in the admin: Settings → Media Library). Idempotent: writes to the plugin store only if the value differs.
 */
export async function applyUploadSettings(strapi: Core.Strapi) {
  const raw = process.env.MEDIA_RESPONSIVE_DIMENSIONS?.trim();
  if (!raw) return;
  const want = raw === 'true';

  const store = strapi.store({ type: 'plugin', name: 'upload', key: 'settings' });
  const current = ((await store.get({})) ?? {}) as Record<string, unknown>;
  if (current.responsiveDimensions === want) return;

  await store.set({ value: { ...current, responsiveDimensions: want } });
  strapi.log.info(`[upload] responsiveDimensions = ${want} (MEDIA_RESPONSIVE_DIMENSIONS)`);
}
