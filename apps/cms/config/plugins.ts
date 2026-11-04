import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  /**
   * Menu management (the only thing we take from the "reference admin").
   * The plugin stores its settings in the DB; on first start src/bootstrap/navigation-config.ts
   * copies this config there, after that edits are made in the admin (Settings → Navigation).
   *
   * The v2 keys allowedContentTypes / restrictedContentTypes / defaultLocale / i18nEnabled
   * are absent from the v3 schema: the plugin excludes system types itself and detects i18n automatically.
   */
  navigation: {
    enabled: true,
    config: {
      additionalFields: [
        {
          name: 'description',
          label: 'description',
          type: 'string',
          enabled: true,
          required: false,
          multi: false,
          options: [],
        },
      ],
      allowedLevels: 2,
      contentTypesNameFields: { default: ['title', 'subject', 'name'] },
      // What a menu item can link to. The frontend builds the href from the type of the related record
      // (apps/web/src/lib/routes.ts), so the TREE path concatenation does not matter for links.
      contentTypes: [
        'api::page.page',
        'api::kitchen-category.kitchen-category',
        'api::kitchen.kitchen',
        'api::article.article',
        'api::project.project',
        'api::promo.promo',
      ],
      defaultContentType: 'api::page.page',
      pathDefaultFields: {
        'api::page.page': ['slug'],
        'api::kitchen-category.kitchen-category': ['slug'],
        'api::kitchen.kitchen': ['slug'],
        'api::article.article': ['slug'],
        'api::project.project': ['slug'],
        'api::promo.promo': ['slug'],
      },
      // A vehicle URL needs its body-type category: /cars/[category]/[slug]
      contentTypesPopulate: { 'api::kitchen.kitchen': ['category'] },
      cascadeMenuAttached: true,
      preferCustomContentTypes: false,
      isCacheEnabled: false,
    },
  },
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
    },
  },
  upload: {
    config: {
      // Media library file size limit; matches strapi::body (config/middlewares.ts) — one UPLOAD_SIZE_LIMIT_MB variable
      sizeLimit: env.int('UPLOAD_SIZE_LIMIT_MB', 50) * 1024 * 1024,
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
    },
  },
});

export default config;
