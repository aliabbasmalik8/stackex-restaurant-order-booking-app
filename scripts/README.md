# Scripts

Local maintainer tooling for **Postgres** (seed catalog, create admin). Lives at template root next to `sollution/` — not inside the shippable apps.

Folder roles: [../.docs/overview.md](../.docs/overview.md) · setup: [../.docs/howto-setup-local.md](../.docs/howto-setup-local.md)

## Setup

```bash
cd scripts
pnpm install
cp .env.example .env
# set DATABASE_URL (same DB as sollution/apps/backend)
```

Run backend migrations first:

```bash
cd ../sollution/apps/backend
pnpm install
cp .env.example .env
pnpm migration:run
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | yes | Postgres connection string |
| `SEED_DATA_PATH` | no | Override seed JSON (default `./seed-data.json`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | no | Overrides for `create:admin` |

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm clear:db -- --yes` | Truncate `product` + `category` |
| `pnpm upload:seed` | Upsert categories + products from `seed-data.json` |
| `pnpm reseed` | Clear catalog then seed |
| `pnpm create:admin` | Upsert `user` with `is_super_admin=true` |

```bash
pnpm reseed
pnpm create:admin
```

## Layout

```text
scripts/
  package.json
  .env / .env.example
  seed-data.json
  lib/pg.mjs
  auth/create-admin/
  sync-data/clear-db/
  sync-data/upload-seed-data/
```
