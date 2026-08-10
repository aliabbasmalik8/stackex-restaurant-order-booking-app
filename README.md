<!-- Template root readme - internal -->

# Order Booking App (template)

White-label **restaurant pickup ordering** template for Stackex / native-builder.

| | |
|--|--|
| **`sollution/`** | Shippable product — mobile, admin, Nest backend |
| **Everything else** | `.docs/`, `scripts/`, `claude-design/` — maintainer docs, Postgres tooling, design |

**Data / auth:** Nest + Postgres (not Firebase).

**Maintainer map:** [.docs/overview.md](./.docs/overview.md)  
**Local setup:** [.docs/howto-setup-local.md](./.docs/howto-setup-local.md)

## Folder map

| Path | Role | Docs |
|------|------|------|
| `.docs/` | How to maintain this template | [.docs/README.md](./.docs/README.md) |
| `sollution/` | Shippable solution | [sollution/README.md](./sollution/README.md) |
| `sollution/apps/backend/` | Nest API + TypeORM | [backend README](./sollution/apps/backend/README.md) · [.docs/database.md](./.docs/database.md) |
| `scripts/` | Seed catalog + create admin (Postgres) | [scripts/README.md](./scripts/README.md) |
| `claude-design/` | Design / prototype reference | implement in `sollution/` |

**Modules & addons:** [.docs/modules.md](./.docs/modules.md) · [.docs/services.md](./.docs/services.md)  
**Preview mode:** [.docs/preview-mode.md](./.docs/preview-mode.md)

## Quick start

```bash
# API
cd sollution/apps/backend
pnpm install && cp .env.example .env
pnpm migration:run
pnpm start:dev

# Seed + admin (template root)
cd scripts
pnpm install && cp .env.example .env   # same DATABASE_URL
pnpm reseed
pnpm create:admin
```

Full walkthrough: [.docs/howto-setup-local.md](./.docs/howto-setup-local.md)
