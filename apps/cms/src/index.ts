import type { Core } from '@strapi/strapi';
import { seedNavigationConfig } from './bootstrap/navigation-config';
import { ensureNavigations } from './bootstrap/navigations';
import { ensurePublicPermissions } from './bootstrap/public-permissions';
import { ensureRevalidateWebhook } from './bootstrap/revalidate-webhook';
import { applyUploadSettings } from './bootstrap/upload-settings';
import { seedDemoContent } from './seed';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedNavigationConfig(strapi);
    await ensurePublicPermissions(strapi);
    // Responsive image copies — per MEDIA_RESPONSIVE_DIMENSIONS (disabled on a small server)
    await applyUploadSettings(strapi);

    // Demo content for dev: true — only into an empty DB, force — recreate. Do not enable in production.
    const seed = process.env.SEED_DEMO;
    if (seed === 'true' || seed === 'force') await seedDemoContent(strapi, { force: seed === 'force' });

    // Site menus always exist (empty if the seed did not run)
    await ensureNavigations(strapi);

    // After the seed: on first start seeding does not trigger the site webhook. An existing webhook is
    // loaded by the core before bootstrap — with SEED_DEMO=force it fires on every record (harmless).
    await ensureRevalidateWebhook(strapi);
  },
};
