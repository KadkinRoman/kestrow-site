# apps/cms — Strapi 5 (Kestrow Motors)

General documentation, commands and conventions are in the root [README.md](../../README.md) and [CLAUDE.md](../../CLAUDE.md).

```bash
cp .env.example .env   # and generate the secrets
npm run develop        # http://localhost:1337/admin
npm run build && npm run start
```

DB: SQLite by default (`.tmp/data.db`); PostgreSQL via `DATABASE_CLIENT=postgres` and the `DATABASE_*` variables.
Site menus: the Navigation plugin (Plugins → Navigation); defaults live in `config/plugins.ts`.
