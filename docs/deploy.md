# Deploying the Kestrow site (Strapi + Next.js)

One layout for any Docker VPS: GitHub Actions builds the images and pushes them to GHCR, and on the server `docker compose`
(PostgreSQL + Strapi + Next.js) runs behind the Caddy reverse proxy. Nothing is built on the server - a build does not fit into
2 GB of RAM, and the same image is used in every environment. The demo production runs on a shared VPS (section 9);
your own server is set up with the same steps (section 3).

## 1. Layout

| What | Where | Notes |
|---|---|---|
| CMS image | `ghcr.io/kadkinroman/kestrow-cms` | one for all environments; tags `sha-<7 chars>`, `main`, `latest`, `v1.2.3` |
| Site image | `ghcr.io/kadkinroman/kestrow-web` | **one per environment**: `stage-sha-...`, `stage-v1.2.3`, `prod-...` - the site address and image host are baked in at build time, and `next build` reads content from that environment's Strapi |
| CI | `.github/workflows/build.yml` | push to `main`, tag `v*`, manual run (Actions -> build -> Run workflow); lint / typecheck / test first, then images |
| Compose | `deploy/compose.yaml` | services `db` (postgres:17-alpine), `cms`, `web`; volumes `pg-data`, `cms-uploads`, `web-leads`; no published ports |
| Proxy | `deploy/caddy/kestrow.caddy`, `deploy/caddy/prod.caddy.example` | Caddy in the docker network `PROXY_NETWORK` -> `<project>-web:3000`, `<project>-cms:1337` |
| Scripts | `deploy/scripts/` | `compose.sh` (wrapper), `deploy.sh` (release and rollback), `backup.sh`, `restore.sh`, `healthcheck.sh` |
| Env templates | `deploy/.env.example`, `deploy/env/*.env.example` | real files exist only on the server (mode 600) and in your password manager |

On the server:

```
/opt/<project>/                     demo production: /opt/kestrow
  .env                              compose variables: project, images and tags, ENV_DIR, PROXY_NETWORK  <- deploy/.env.example
  .env.prev                         tags before the last release (for deploy.sh --rollback)
  env/db.env cms.env web.env monitor.env   secrets and addresses, mode 600                              <- deploy/env/*.env.example
  deploy/                           copy of the repository's deploy/ folder (compose.yaml, scripts/, caddy/)
  backups/daily/ backups/monthly/   database dumps and media archives
  data/                             deploy.log, backup.log, monitor.log, monitor.state
```

Request flow: browser -> Caddy (HTTPS) -> `web:3000` -> over the internal network `cms:1337` -> `db`. Images: `next/image` on
the site server fetches files from `STRAPI_PUBLIC_URL/uploads/...` (the public CMS address through Caddy, which is why
`/uploads/*` on the CMS host is always open). Page cache reset: when a record changes, Strapi calls
`http://web:3000/api/revalidate` over the internal network (Caddy blocks that path from outside). Leads: `web` -> Bitrix24;
if the portal does not answer, the lead waits in the queue on the `web-leads` volume and a background worker retries
(see `CLAUDE.md`, "A lead is never lost"). In the demo deployment `LEADS_SEND_TO_CRM=false`, so leads are only logged.

Memory (compose limits, sized for a 2 GB server): `cms` 640 MB (heap 448), `web` 448 MB (heap 320), `db` 256 MB
(`shared_buffers` 64 MB). A 2 GB server needs 2 GB of swap; for a real production, 2 cores / 4 GB are recommended.

## 2. Server requirements

- A VPS with root and SSH, Ubuntu 22.04+ / Debian 12 (shared web hosting will not do: Docker and two Node processes are required).
- Docker Engine 24+ and the compose v2 plugin (`docker compose version`); ports 80 and 443 open; a public IPv4 address.
- 2 cores / 4 GB (minimum 1 / 2 + swap for a demo), 20 GB of disk (images ~1 GB, database, media, backups).
- A domain: A records for `example.com`, `www` and `cms.example.com` pointing at the server (lower the TTL to 300 a day before switching).
  A free `sslip.io` host name works for a demo: `<name>.<ip-with-dashes>.sslip.io`.

## 3. First deploy on a new server

1. **Docker and swap** (root):
   ```bash
   apt-get update && apt-get install -y docker.io docker-compose-v2      # Ubuntu; otherwise see docs.docker.com/engine/install
   fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab && sysctl -w vm.swappiness=10 && echo 'vm.swappiness=10' > /etc/sysctl.d/99-swappiness.conf
   docker network create proxy
   ```
2. **Directories and deployment files** (from the developer machine, repository root):
   ```bash
   ssh <server> 'mkdir -p /opt/kestrow/{env,data,backups/daily,backups/monthly} && chmod 700 /opt/kestrow/env /opt/kestrow/backups'
   tar --exclude='*.local.*' -czf - deploy | ssh <server> 'tar -C /opt/kestrow -xzf - && chown -R root:root /opt/kestrow/deploy && chmod +x /opt/kestrow/deploy/scripts/*.sh'
   ```
3. **`/opt/kestrow/.env`** from `deploy/.env.example`: `COMPOSE_PROJECT_NAME=kestrow`, `WEB_TAG_PREFIX=prod`,
   `ENV_DIR=/opt/kestrow/env`, `PROXY_NETWORK=proxy` (or the name of an existing proxy network), tags as built by CI (step 9).
4. **`/opt/kestrow/env/*.env`** from the templates `deploy/env/*.env.example` (mode 600, keep copies of the secrets in a
   password manager): Strapi secrets via `openssl rand -base64 16` (`APP_KEYS` takes four values, comma-separated); the same database
   password in `db.env` and `cms.env`; the same `REVALIDATE_SECRET` in `cms.env` and `web.env`; `SEED_DEMO=true` for the first start of
   a demo (it fills an empty database once), `false` for real content; `LEADS_SEND_TO_CRM=false` and an empty `BITRIX24_WEBHOOK_URL`
   unless you connect a Bitrix24 portal (incoming webhook with the `crm` scope); `PUBLIC_URL`, `CORS_ORIGINS`,
   `NEXT_PUBLIC_SITE_URL`, `STRAPI_PUBLIC_URL` are your public addresses.
5. **Image access:** a GitHub token (classic, `read:packages` only) -> on the server
   `echo "$TOKEN" | docker login ghcr.io -u kadkinroman --password-stdin` (never paste the token into chats or commits).
6. **Caddy:** your own server - based on `deploy/caddy/prod.caddy.example` (set the domain and the monitoring address) ->
   `/opt/caddy/Caddyfile`; the container command is in the header of the example (network `proxy`, ports 80/443, volumes
   `caddy_data`/`caddy_config`). DNS must already point at the server or the certificate cannot be issued.
   Shared Caddy (the demo variant) - see section 9.
7. **Database and CMS:** `deploy/scripts/compose.sh up -d db cms` -> `compose.sh logs -f cms` until the start-up line ->
   `https://cms.<domain>/admin` -> register the first administrator. Give editors the "Editor" role; keep Super Admin for the developer.
8. **Content:** with `SEED_DEMO=true` the first start creates the demo content and menus. To move real content from another
   instance, use a dump and the media archive (section 7).
9. **Site image for production:** repository variables `PROD_STRAPI_URL`, `PROD_STRAPI_PUBLIC_URL`, `PROD_SITE_URL`
   (optionally `PROD_YANDEX_METRIKA_ID`, an analytics id): `gh variable set PROD_SITE_URL --body https://example.com -R KadkinRoman/kestrow-site` ...,
   then `gh workflow run build.yml -R KadkinRoman/kestrow-site -f cms=false -f web_envs=prod` and wait for it
   (`gh run watch`). The production CMS must already be reachable from outside - `next build` reads its content.
10. **Site:** `deploy/scripts/deploy.sh --web prod-sha-<7 chars>` (or by tag: `deploy.sh v1.0.0`).
11. **Cron** (root, `crontab -e`) and `env/monitor.env` (addresses, Telegram):
    ```
    30 3 * * * /opt/kestrow/deploy/scripts/backup.sh >> /opt/kestrow/data/backup.log 2>&1
    */5 * * * * /opt/kestrow/deploy/scripts/healthcheck.sh
    ```
12. **Check:** home, inventory, vehicle detail, reviews, blog return 200; `/api/health` -> `ok: true`, `writable: true`; the admin
    panel opens; `docker stats --no-stream`.

## 4. Updating (release)

1. Changes land on `main` -> CI builds the images `sha-<7>` (and `prod-sha-<7>`) -> deploy with `deploy.sh sha-<7>`.
2. Release: `git tag v1.2.3 && git push origin v1.2.3` -> CI builds `v1.2.3`, `stage-v1.2.3`, `prod-v1.2.3`
   (only for environments whose variables are set).
3. On the server: `deploy/scripts/deploy.sh v1.2.3` - database dump -> tags in `.env` (the old ones in `.env.prev`) -> `pull` ->
   `up -d` -> wait for `healthy` -> status. It takes 1-3 min, with ~10-30 s of downtime while containers restart.
   Site only: `deploy.sh --web prod-sha-<7>`.
4. Changes to the Strapi content model are applied when the new `cms` starts (Strapi alters the tables itself), which is why the
   pre-release dump is mandatory (`deploy.sh` makes it).

## 5. Rollback

- `deploy/scripts/deploy.sh --rollback` restores the previous tags from `.env.prev`; the images are still on disk, ~30 s.
- If the new version changed the database schema and the old code cannot work with it, restore the dump made by `deploy.sh`
  before the release: `deploy/scripts/restore.sh <stamp>` (the stamp is in the file name under `backups/daily/`). Content edits
  made after the release are lost.
- Old images are not removed automatically; once a month run `docker image prune -af --filter "until=720h"`.

## 6. Backups and restore

- `backup.sh` (cron 03:30): `pg_dump -Fc` -> `backups/daily/<stamp>-db.dump`, an archive of the media volume ->
  `<stamp>-uploads.tgz`; it keeps 14 daily copies, and on the 1st a copy goes to `backups/monthly/` (3 months). The lead queue
  (`web-leads`) is not backed up - it holds personal data and its retention is limited by the code.
- **Off-site copy** (required for a real production): `apt-get install rclone`, `rclone config` (S3-compatible storage or another
  server), then set `OFFSITE_RCLONE_REMOTE=name:folder` in `env/monitor.env` - `backup.sh` copies every full backup there. Until it
  is configured, the copy stays on the server; fetch a fresh backup by hand with
  `scp '<server>:/opt/kestrow/backups/daily/*' ./kestrow-backups/` (create the folder first).
- Restore: `restore.sh <stamp> --uploads auto` stops cms and web, recreates the `public` schema, loads the dump, replaces the media
  library, starts the containers and resets the site cache. Verify: admin panel, `/api/health`, pages.
- Rehearse the restore on a non-production instance after every major schema change: compare the
  `/api/kitchens?pagination[pageSize]=1` counters before and after.

## 7. Moving content between instances

Not `strapi transfer` (it wipes the target database and does not carry administrators or tokens) - use a dump and the media archive:

```bash
# on the source
/opt/<source>/deploy/scripts/backup.sh
scp /opt/<source>/backups/daily/<stamp>-db.dump /opt/<source>/backups/daily/<stamp>-uploads.tgz <target>:/opt/kestrow/backups/daily/
# on the target
/opt/kestrow/deploy/scripts/restore.sh <stamp> --uploads auto --yes
```

After the move: administrators and their passwords travel with the database; **API tokens and encrypted fields** are tied to the target's
`API_TOKEN_SALT`/`ENCRYPTION_KEY`, so create the frontend token (if used) again; Strapi re-registers the cache webhook on start
(`FRONTEND_REVALIDATE_URL`). Image paths in the database are relative (`/uploads/...`) - nothing to change. Then build the site image
for the target (section 3, step 9): pages are baked in at build time from the content.

## 8. Monitoring

- `healthcheck.sh` (cron every 5 min): site `/api/health` (200 and `ok: true`; 503 means leads have waited in the queue > 15 min or the
  queue is not writable), CMS `/_health` (204), containers running and not `unhealthy`, disk < 85 %. It writes to `data/monitor.log`
  only on problems and recovery; a Telegram alert on failure, a reminder every hour and a recovery message (`ALERT_TG_BOT_TOKEN`,
  `ALERT_TG_CHAT_ID` in `env/monitor.env`; without a token - journal only).
- Memory: `docker stats --no-stream`; logs: `deploy/scripts/compose.sh logs --tail 200 web` (rotation 3 x 10 MB).

## 9. Demo production

| What | Value |
|---|---|
| Site | `https://kestrow.193-233-216-209.sslip.io` - public and indexable, no basic auth |
| CMS admin | `https://cms-kestrow.193-233-216-209.sslip.io/admin` - basic auth only on the admin HTML document; `/api/*`, `/uploads/*`, `/_health` stay open (the CI build and `next/image` read them); `X-Robots-Tag: noindex` on the CMS host only |
| Server directory | `/opt/kestrow` (layout in section 1) |
| Proxy | the shared `caddy` container on the external network `b24net` (a generic proxy network, e.g. `proxy`); site file `sites/kestrow.caddy` (from `deploy/caddy/kestrow.caddy` with the basic auth hash filled in), included by `import /etc/caddy/sites/*.caddy` |
| Containers | `kestrow-db`, `kestrow-cms`, `kestrow-web` |
| Images | GHCR; the server runs `docker login ghcr.io` with a read-only (`read:packages`) token |
| Leads | `LEADS_SEND_TO_CRM=false` - nothing reaches a CRM, requests are only logged and queued |

The shared Caddy sees only a bind mount of one file, so applying a new site file means mounting the `sites/` folder into the container
(recreate it once; certificates survive in `caddy_data`) and then `docker exec caddy caddy reload --config /etc/caddy/Caddyfile`.
Validate first in a temporary container with the same mounts: `caddy validate`. Generate the basic auth hash with
`docker exec -i caddy caddy hash-password < password-file`.

Commands (on the server, as root):

```bash
S=/opt/kestrow/deploy/scripts
$S/compose.sh ps                      # status
$S/compose.sh logs --tail 100 cms     # logs (cms | web | db)
$S/deploy.sh sha-1a2b3c4              # release by commit (or v1.2.3, --web prod-sha-...)
$S/deploy.sh --rollback               # roll back to the previous tags
$S/backup.sh                          # manual backup
$S/restore.sh <stamp> --uploads auto  # restore
docker stats --no-stream              # container memory
```

Tear the demo down completely: `$S/compose.sh down -v` (this deletes the database and media!), `rm -rf /opt/kestrow`, remove
`sites/kestrow.caddy`, then `docker exec caddy caddy reload --config /etc/caddy/Caddyfile`.

## 10. Local production check

There is no Docker on the developer machine - images are verified in CI and on the server. Locally, `next build` produces
`.next/standalone`; to run the built site, copy `public` and `.next/static` into the standalone folder
(`cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/`) and run `node .next/standalone/server.js`
(`next start` is not meant for `output: 'standalone'`).
