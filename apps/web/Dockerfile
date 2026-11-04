# syntax=docker/dockerfile:1
# Next.js 16 (apps/web) → image ghcr.io/kadkinroman/kestrow-web — a separate one per environment:
# NEXT_PUBLIC_SITE_URL and the image host (STRAPI_PUBLIC_URL → images.remotePatterns) are baked in at build time,
# and next build reads content from the environment's Strapi (STRAPI_URL). Build context is the repository root:
#   docker build -f apps/web/Dockerfile --build-arg STRAPI_URL=… --build-arg STRAPI_PUBLIC_URL=… --build-arg NEXT_PUBLIC_SITE_URL=… .

FROM node:24-alpine AS deps
WORKDIR /app
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/web/ ./
ARG STRAPI_URL
ARG STRAPI_PUBLIC_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_YANDEX_METRIKA_ID=""
ENV STRAPI_URL=$STRAPI_URL \
    STRAPI_PUBLIC_URL=$STRAPI_PUBLIC_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_YANDEX_METRIKA_ID=$NEXT_PUBLIC_YANDEX_METRIKA_ID \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
# next build calls the environment's Strapi: without STRAPI_URL pages would build against 127.0.0.1 and fail
RUN test -n "$STRAPI_URL" && test -n "$STRAPI_PUBLIC_URL" && test -n "$NEXT_PUBLIC_SITE_URL" \
    || (echo "build-args STRAPI_URL, STRAPI_PUBLIC_URL and NEXT_PUBLIC_SITE_URL are required" >&2 && exit 1)
RUN npm run build

FROM node:24-alpine
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
WORKDIR /app
# output: 'standalone' — the server and only the needed modules; public and .next/static are not copied by standalone itself
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# Request outbox (LEADS_OUTBOX_DIR=/data/leads) is a volume; it holds personal data, accessible only to the site process
RUN mkdir -p /data/leads && chown -R node:node /data && chmod 700 /data/leads
USER node
EXPOSE 3000
CMD ["node", "server.js"]
