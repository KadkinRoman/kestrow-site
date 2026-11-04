# syntax=docker/dockerfile:1
# Strapi 5 (apps/cms) → image ghcr.io/kadkinroman/kestrow-cms.
# Build context is the repository root: docker build -f apps/cms/Dockerfile .
# The admin is built inside the image; DB, URLs and secrets come only from environment variables
# (deploy/env/cms.env.example). One image for all environments.

FROM node:24-alpine AS build
# better-sqlite3 (dev DB) has no prebuilt binary for Node 24 + musl — it is compiled from source;
# sharp installs the prebuilt @img/sharp-linuxmusl-x64 (libvips included)
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY apps/cms/package.json apps/cms/package-lock.json ./
# devDependencies (typescript) are needed for the build — NODE_ENV=production is set only after install
RUN npm ci --no-audit --no-fund
COPY apps/cms/ ./
ENV NODE_ENV=production
# strapi build: tsc → dist/, admin → dist/build
RUN npm run build && npm cache clean --force

FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app ./
# The media library volume is mounted here; permissions for the node user (uid 1000)
RUN mkdir -p /app/public/uploads && chown -R node:node /app/public/uploads
USER node
EXPOSE 1337
# Without npm run: the stop signal reaches the process directly
CMD ["node", "node_modules/@strapi/strapi/bin/strapi.js", "start"]
