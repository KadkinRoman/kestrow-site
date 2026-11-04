import type { Core } from '@strapi/strapi';

/**
 * Version of the Navigation config in config/plugins.ts. Increase it when you change the config
 * in the file and want to apply the changes to an existing DB (admin edits
 * are then overwritten with the file values for the listed keys).
 */
const CONFIG_VERSION = 2;

/** strapi-plugin-navigation 3.x config keys that we set in config/plugins.ts */
const CONFIG_KEYS = [
  'additionalFields',
  'allowedLevels',
  'contentTypes',
  'contentTypesNameFields',
  'contentTypesPopulate',
  'defaultContentType',
  'pathDefaultFields',
  'cascadeMenuAttached',
  'preferCustomContentTypes',
  'isCacheEnabled',
] as const;

/**
 * strapi-plugin-navigation 3.x saves its own defaults to the DB on first start
 * and applies config/plugins.ts only via the "Restore" button in the settings.
 * We copy the config from the file to the DB when CONFIG_VERSION changes (marker in the core store),
 * so admin edits are not overwritten on every restart.
 */
export async function seedNavigationConfig(strapi: Core.Strapi) {
  const marker = strapi.store({ type: 'core', name: 'kestrow', key: 'navigation-config-version' });
  const applied = Number(await marker.get({})) || 0;
  if (applied >= CONFIG_VERSION) return;

  const store = strapi.store({ type: 'plugin', name: 'navigation' });
  const current = ((await store.get({ key: 'config' })) ?? {}) as Record<string, unknown>;
  const plugin = strapi.plugin('navigation');
  const fromFile = Object.fromEntries(
    CONFIG_KEYS.map((key) => [key, plugin.config(key)] as const).filter(([, value]) => value !== undefined),
  );

  await store.set({ key: 'config', value: { ...current, ...fromFile } });
  await marker.set({ value: CONFIG_VERSION });
  strapi.log.info(`[navigation] config from config/plugins.ts applied (version ${CONFIG_VERSION})`);
}
