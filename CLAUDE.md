# CLAUDE.md

Engineering conventions for this repository, for developers and AI assistants. Communicate and write commits in English
(conventional prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).

## Project

Demo site of Kestrow Motors, a fictional pre-owned car dealership in Denver, Colorado. A monorepo without npm workspaces
(Strapi = React 18, Next = React 19 - hoisting conflict).

**Shared engine.** The code base is the same engine as the Alderline custom-kitchen demo
(https://github.com/KadkinRoman/alderline-site, live at https://alderline.193-233-216-209.sslip.io), re-skinned for a second vertical.
Internal identifiers are the engine's generic listing model and are intentionally kept: `Kitchen`, `KitchenCard`, `getKitchens`,
`api::kitchen.kitchen`, `kitchen-category`, `style` (= fuel), `facade` (= drivetrain), `color`, form ids such as `zamer` / `materials`.
Here a "kitchen" is a vehicle listing and a "category" is a body type. Do not rename them; change visitor-facing text only.

- `apps/cms` - Strapi 5, TypeScript. Database via env: SQLite (dev) / PostgreSQL (prod).
  `strapi-plugin-navigation` manages the menus. No page builder.
- `apps/web` - Next.js 16 App Router, TypeScript, Tailwind CSS 4, `src/`.

## Key decisions

- Leads from forms go to Bitrix24 through an incoming webhook, `crm.item.add` (entityTypeId=1; `crm.lead.add` is legacy).
  Sending happens only when `LEADS_SEND_TO_CRM=true`; in dev and in the demo deployment leads are only logged (dry run).
- Components are built on design tokens; restyling means changing tokens, not components.
- SEO: clean URLs, sitemap, robots, structured data.

## Frontend conventions (`apps/web`)

- **Tokens** live only in `src/app/globals.css` (`@theme`). Components use token-based utilities
  (`bg-surface`, `text-fg-muted`, `rounded-card`, `max-w-site`). No raw hex values in JSX.
- **Content** is read only through `src/lib/content` (`getKitchens`, `getNavigation`, ...): Strapi REST ->
  mappers in `src/lib/strapi/map.ts` -> domain types in `src/lib/content/types.ts`. Components know nothing about Strapi.
  The client is `src/lib/strapi/client.ts` (`strapiGet`, `strapiGetAll`, `toQueryString`).
- Strapi enumeration keys (`style`, `facade`, `color`) map to labels in `src/lib/content/labels.ts`;
  filter URLs carry keys (`?style=hybrid`). From the URL accept only known keys and categories
  (arbitrary values must not create cache entries); `page` is an integer >= 1.
- Strapi errors: a 404 on an empty single type -> default value; the menu returns `[]` on any error
  (cached for minutes); anything else is rethrown - Next serves the previous version from its cache.
- Strapi sorts always carry `id` as a second key (stable "Load more" pages).
- An empty collection -> `generateStaticParams` through `atLeastOne` (`src/lib/static-params.ts`).
- Rich text (blocks) uses the `ui/RichText` component (own renderer, no dependencies); heading ids come from
  `slugify` in `src/lib/slug.ts` (the article table of contents is built from them).
- Menus: item hrefs are built by the mapper from `related.__type` (see "CMS conventions"); components use `item.path`.
- **URLs** come only from `src/lib/routes.ts`.
- **Static pages and the Strapi `page` entry:** metadata is `generateMetadata = () => pageMetadata(routes.x(), {...})`
  (`src/lib/page-meta.ts`: SEO from the entry on top of code defaults); editor texts are `page.lead` + `page.sections`
  (`sections/PageSections` - sections with an image, `sections/SectionTiles` - tiles: Home delivery, Inspection). This is a fixed
  template, not a builder. "Other services" is `sections/OtherServices` (the six pages of the section minus the current one).
- **Reviews:** the `/reviews` page (`components/reviews/ReviewsGrid`: text `ReviewTextCard` and video `ReviewCard`, a promo after
  every five, "Load more" via `?page=`); the home page uses `getHomeReviews` (`showOnHome`).
- **Offers:** the term is `promoTerm(endsAt, settings.promoPeriod)` (a shared period from Settings); expired promos with their own date
  are hidden by `getPromos`; `PromoCard` shows a "Gift/Discount" label and a join button.
- **Inventory collections:** `kitchen-tag` -> chips in `CatalogFilters` and the `?tag=` filter (unknown values are dropped).
- **Team and experts:** `getTeam()` (employees with `isTeam`), populate window `{ type: 'employee' }`; an article has `author` and `expert`
  (`blog/ArticleAuthors`).
- Server components by default. `'use client'` only for interactivity (modals, carousels, filters, quiz, mobile menu).
- The floating "Contact us" button is `layout/ContactDock` in the layout: the phone and messengers (telegram, whatsapp) from
  `setting.socials`; placeholder links (`#`) are dropped by the settings mapper.
- Modals are global: `<ModalButton modal={{ type: 'lead' | 'promo' | 'installment' | 'video' | 'quiz', ... }}>`.
- Forms: fields, default button label and success text come from Strapi (`getForms` -> `FormsProvider` in the layout, sent to the
  browser without CRM fields); a call site sets only `formId`, `submitLabel`, `layout`.
  `LeadForm` -> `POST /api/lead` (FormData): honeypot `website`, rate limit by IP (last `X-Forwarded-For`, then `X-Real-IP`) and by
  phone, field validation against the form definition, file <= 10 MB (jpg/png/webp/heic/pdf + signature check) ->
  `src/lib/leads/` (`crm.item.add`, the file goes to the lead timeline through `crm.timeline.comment.add`).
- **A lead is never lost** (`src/lib/leads/`): Strapi down and the forms cache empty -> `fallbackForm` (name, phone, email, comment);
  Bitrix24 rejects a lead -> `outbox.ts` stores it as a file in `LEADS_OUTBOX_DIR` (default `.leads-outbox/`) and the sales team is
  alerted in Telegram (`notify.ts`, `LEADS_ALERT_TG_BOT_TOKEN` + `LEADS_ALERT_TG_CHAT_ID`); the worker `outbox-worker.ts` (started from
  `src/instrumentation.ts`, period `LEADS_OUTBOX_INTERVAL_SEC`) retries with 2/5/15/30/60 min pauses and after 7 days moves the lead
  to `failed/`. A record is locked by renaming to `.sending`; after the first error the pass stops (the CRM is down). A lead is created with
  `originatorId`/`originId` = the record id, and before a retry the worker looks the lead up by `originId` (no duplicates after a timeout).
  If both Bitrix24 and the queue fail -> Telegram with the contacts and a 502. A file for a created lead is uploaded after the response
  (`after()` from `next/server`) with a safety task in the queue (kind `attach`) in case of a restart.
  The lead comment carries a personal-data consent line (date, page, policy), the referrer and the first visited page; UTM goes to the
  standard fields `utmSource...utmTerm` (attribution: `attribution.ts` pure functions, `attribution-client.ts` - localStorage,
  30 days, a new ad tag overrides the old one). `GET /api/health` reports the queue (pending/failed/corrupt, writable) and Strapi for
  monitoring (503 - the queue is not writable or leads have waited > 15 min); restrict access to it at the proxy.
- Media: a file in Strapi -> `next/image` (`images.remotePatterns` = `/uploads/**` of the `STRAPI_PUBLIC_URL` host), no file -> `Placeholder`.
- Next 16: `params`/`searchParams` are Promises (await), `middleware` -> `proxy.ts`.
  Before writing Next code, read `apps/web/node_modules/next/dist/docs/` (see `apps/web/AGENTS.md`).
- **Cache Components are enabled** (`cacheComponents` + `partialPrefetching`):
  - read `searchParams` only inside `<Suspense>` (examples: `CatalogResults`, `ArticleList`), so the static part of the page stays in
    the prerender shell;
  - slug detail pages (`/cars/[category]/[slug]`, `/blog/[slug]`, ...) export `instant = false`: real HTTP 404/308 are needed,
    known slugs come from `generateStaticParams`;
  - every function in `src/lib/content` is `'use cache'` + `cacheLife('hours')` + `cacheTag('strapi', ...)`;
    the reset is `POST /api/revalidate` (header `x-revalidate-secret`) -> `revalidateTag('strapi', { expire: 0 })`.
    Strapi registers the webhook itself on start (`FRONTEND_REVALIDATE_URL` + `REVALIDATE_SECRET` in `apps/cms/.env`);
  - **`next build` reads data from Strapi** - Strapi must be running (`STRAPI_URL`);
  - "Load more" in the inventory/blog: `?page=N` = pages 1..N as separate cacheable requests (N is capped by the real page count);
  - do not call `Date.now()`/`Math.random()` during render without `connection()`.

## CMS conventions (`apps/cms`)

- Content-type UIDs: `api::kitchen.kitchen`, `api::kitchen-category.kitchen-category`, ... -
  when adding a type, update `contentTypes` in `config/plugins.ts` (Navigation).
- Shared component `shared.seo` (title, description, ogImage, noIndex).
- Schemas live in `src/api/*/content-types/*/schema.json` and are committed.
- **Model:** page (path, SEO, `lead`, `page.section` sections - no builder), kitchen-category, kitchen (+ `tags` -> kitchen-tag,
  `reviews`), project, article (+ article-tag, `author` and `expert` -> employee `author` with `isTeam`/`text`/`order`, dynamic zone
  `article.*`), promo, material, review (+ `source`, `url`, `place`, `date`, `kitchen`, `showOnHome`), faq and order-stage (the `group`
  field = the page), form (+ `forms.input`, `willSendToCrm`, `crmTitle`, `crmSourceId` - the lead SOURCE_ID);
  single types: setting (+ `mapUrl`, `promoPeriod` - the shared offer period, `company` - company details), topline, quiz.
  Rich text uses the `blocks` type.
- Enumerations use Latin keys (`style: gasoline|hybrid|plug-in-hybrid|electric|diesel`, `facade`, `color`); human labels live on the frontend.
- `legacyPath` on kitchen/project/article/promo is an optional old URL used for redirects.
- **Bootstrap** (`src/index.ts`): the Navigation config is moved into the database by version
  (`src/bootstrap/navigation-config.ts`; after changing the config, increment `CONFIG_VERSION`),
  Public gets read-only permissions (`src/bootstrap/public-permissions.ts`), demo seed.
- **Seed** (`src/seed/`): `SEED_DEMO=true` fills an empty database, `force` recreates the demo records and menus
  (`main`, `footer`, `legal`). The empty menus themselves are always created by bootstrap - `src/bootstrap/navigations.ts`.
- **Site cache webhook** - `src/bootstrap/revalidate-webhook.ts` (when `FRONTEND_REVALIDATE_URL` + `REVALIDATE_SECRET` are set);
  disabling it in the admin survives a restart.
- **Menus:** `GET /api/navigation/render/{main|footer|legal}?type=TREE`. The TREE render concatenates `path` along the tree, so build
  hrefs from `related.__type` via `routes.ts` (page -> `related.path`, kitchen-category -> `/cars/<slug>`, kitchen -> category
  from `contentTypesPopulate`, article, project); EXTERNAL - `path` (= externalPath), WRAPPER - no link.
- `config/admin.ts`: `autoOpen` is off (`ADMIN_AUTO_OPEN=true` brings back opening the browser).
- **Behind a proxy and limits:** `BEHIND_PROXY=true` -> `server.proxy = { koa: true, maxIpsCount: 1 }` (client IP = the last
  `X-Forwarded-For` address); `CORS_ORIGINS` (list, empty - `*`); `UPLOAD_SIZE_LIMIT_MB` is one limit for both
  `upload.config.sizeLimit` and `strapi::body`; `MEDIA_RESPONSIVE_DIMENSIONS=false` turns responsive copies off
  (`src/bootstrap/upload-settings.ts` writes to the upload plugin settings; empty - leave untouched).

## Infrastructure

- Images: `apps/cms/Dockerfile` (one for all environments) and `apps/web/Dockerfile` (one per environment - `NEXT_PUBLIC_SITE_URL`
  and `STRAPI_PUBLIC_URL` are baked in at build time, `next build` reads content from that environment's `STRAPI_URL`). The build
  context is the repository root; secrets never reach an image (`.dockerignore`).
- CI `.github/workflows/build.yml`: lint, `next typegen` + typecheck, tests -> images in GHCR (`sha-...`, `main`, `latest`, `v*`;
  web gets an environment prefix). Environment addresses are the repository variables `STAGE_*` / `PROD_*`.
- Server: `deploy/compose.yaml` (+ `.env`, `env/*.env`), `deploy/scripts/deploy.sh <tag>` for release and rollback,
  `backup.sh` / `restore.sh` / `healthcheck.sh`; Caddy config in `deploy/caddy/`. Step by step: `docs/deploy.md`.
- Checking a production build locally: `node .next/standalone/server.js` (after copying `public` and `.next/static`),
  not `next start`.

## Security

- Secrets only in `.env` / `.env.local`; only `.env.example` goes to git.
- Do not commit `apps/cms/.tmp` (SQLite) or `public/uploads`.

## Commands

```bash
npm run setup      # install everything
npm run dev        # cms :1337 + web :3000
npm run build      # build both
npm run lint       # eslint web
npm run typecheck  # tsc web
npm test           # node --test (Node >= 22.18), apps/web/src/**/*.test.ts: lead, outbox, worker, attribution, notify, ...
```
