import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => {
  // Media library file size limit, bytes — same as upload.config.sizeLimit in plugins.ts (one variable for both)
  const uploadSizeLimit = env.int('UPLOAD_SIZE_LIMIT_MB', 50) * 1024 * 1024;

  return [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
    {
      name: 'strapi::cors',
      // The browser does not call the API directly (the site reads it on the server), so in production only own origins;
      // without the variable — default (*), so dev is unchanged
      config: { origin: env.array('CORS_ORIGINS', ['*']) },
    },
    'strapi::poweredBy',
    'strapi::query',
    {
      name: 'strapi::body',
      // Otherwise koa-body rejects a larger file before the media plugin does — with no clear error in the admin
      config: { formLimit: '10mb', jsonLimit: '10mb', textLimit: '10mb', formidable: { maxFileSize: uploadSizeLimit } },
    },
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};

export default config;
