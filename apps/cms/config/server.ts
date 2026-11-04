import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'http://localhost:1337'),
  app: {
    keys: env.array('APP_KEYS')!,
  },
  // Behind a reverse proxy (Caddy, nginx): trust X-Forwarded-*, client IP is the last X-Forwarded-For address
  // (the proxy appends it; the client can spoof the earlier ones). Otherwise the admin login limit is shared by everyone
  proxy: env.bool('BEHIND_PROXY', false) ? { koa: true, maxIpsCount: 1 } : false,
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});

export default config;
