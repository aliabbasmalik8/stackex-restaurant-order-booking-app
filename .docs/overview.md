# Overview — purpose, split, and mapping

Paths below are from **template root** (`order-booking-app/`) unless noted.

## About this repo

**Purpose:** white-label **restaurant pickup ordering** template for Stackex / native-builder.

**Data / auth backend:** NestJS + Postgres (Neon-ready) under `sollution/apps/backend`.  
Firebase is **no longer** the template data store.

It supplies:

1. Shippable apps under `sollution/apps/` — **mobile** (Expo), **admin** (Vite), **backend** (Nest).
2. Local maintainer tooling (`scripts/`) — seed catalog + create admin in Postgres.
3. Design reference (`claude-design/`) and maintainer docs (`.docs/`).

```text
order-booking-app/
├── .docs/                         ← maintainer docs — NOT shippable
├── sollution/                     ← SHIPPABLE solution
│   ├── apps/mobile/               ← Expo guest app
│   ├── apps/admin/                ← admin SPA
│   ├── apps/backend/              ← Nest API + TypeORM
│   └── README.md
├── scripts/                       ← Postgres seed / create-admin
├── claude-design/                 ← design reference
└── README.md
```

---

## `sollution/` vs the rest

| | `sollution/` | Rest (`.docs/`, `scripts/`, `claude-design/`) |
|--|--------------|-----------------------------------------------|
| **Role** | Product solution | Docs, local tooling, design |
| **Customer preview** | Yes | Not the app bundle |
| **Day-to-day edits** | Screens, API, entities | Seed JSON, setup docs, design sync |
| **Depends on** | Nest API + Postgres | `DATABASE_URL` in `scripts/.env` |

| Change | Edit here |
|--------|-----------|
| Screens, theme, i18n | `sollution/apps/mobile` or `admin` |
| Auth / catalog APIs | `sollution/apps/backend` |
| Entities + migrations | `sollution/apps/backend/src/database` · [database.md](./database.md) |
| Reseed / create admin | `scripts/` |
| Preview feature gates | `modules/services/` — [services.md](./services.md) |
| How-to-maintain docs | `.docs/` |

Do **not** put service accounts, seed JSON, or maintainer docs inside shippable app folders.

---

## Proper mapping

| Path | Maps to | Keep in sync with |
|------|---------|-------------------|
| `sollution/apps/backend/` | Nest API, auth, TypeORM | [database.md](./database.md) · backend README |
| `sollution/apps/backend/src/database/entities/` | Postgres tables | Migrations + `scripts/seed-data.json` field map |
| `scripts/seed-data.json` | Local/demo catalog seed | Category / Product entities |
| `scripts/` | `reseed`, `create:admin` | Same `DATABASE_URL` as backend |
| `sollution/apps/mobile/src/modules/` | Domain UI modules | Eventually Nest API (legacy Firebase client may still exist mid-migration) |
| `.docs/` | Maintainer instructions | Reality of folders above |

### Postgres tables (current)

| Table | Source of truth | Seed |
|-------|-----------------|------|
| `user` | `User` entity + signup/login | `pnpm create:admin` |
| `category` | `Category` entity | `menu_categories` in seed (skip `all`) |
| `product` | `Product` entity | `menu_items` in seed |

---

## Data flow (local)

```text
scripts/seed-data.json
        │
        ▼  pnpm reseed
   Postgres (category, product)
        ▲
        │  TypeORM / Nest
sollution/apps/backend
        ▲
        │  HTTP /api (target)
mobile · admin
```

---

## Related

- [howto-setup-local.md](./howto-setup-local.md) · [database.md](./database.md) · [environment.md](./environment.md)
