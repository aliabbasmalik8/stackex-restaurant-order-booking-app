# AI instructions — order-booking backend

Instructions for humans and agents working on `sollution/apps/backend`.

## Docs sync (mandatory)

**Code changes to modules or product features are not done until `ai_instruction/` is updated.**

→ Full matrix: **[maintenance.md](./maintenance.md)**

## Modules vs features (read this)

| | **Modules** | **Features** |
|--|-------------|--------------|
| Meaning | Nest folders under `src/modules/<name>/` | Product integrations (e.g. **Stripe**) |
| Docs | [`modules/<name>/`](./modules/README.md) | [`features/<name>/`](./features/README.md) |
| Contains | What the module is for, routes, files, deps | `setup.md` + which modules use it and how |
| Example | [`modules/stripe-payments/`](./modules/stripe-payments/README.md) ↔ Nest Stripe card API | [`features/stripe/`](./features/stripe/README.md) used by stripe-payments + order + setting |

```text
ai_instruction/
  maintenance.md     ← when code changes, what docs to update
  modules/           ← Nest module docs (1:1 with src/modules/*)
    README.md
    stripe-payments/ | order/ | setting/ | …
  features/          ← product features (cross-module)
    stripe/
      README.md      ← overview + module usage table
      setup.md       ← keys, webhook, CLI
```

## Core docs

| Doc | When |
|-----|------|
| [maintenance.md](./maintenance.md) | **Any** module/feature/env/route change |
| [architecture.md](./architecture.md) | Layers, white-label |
| [database-services.md](./database-services.md) | **Required** persistence via `*DbService` |
| [add-database-entity.md](./add-database-entity.md) | New entity + DB service workflow |
| [coding-standards.md](./coding-standards.md) | Naming, DTOs, API checklist |
| [error-handling.md](./error-handling.md) | `OrderBookingException`, ensure/re-raise, controller HTTP mapping |
| [modules/README.md](./modules/README.md) | Nest modules index + scaffold |
| [features/README.md](./features/README.md) | Product features index |
| [shared-services.md](./shared-services.md) | `@shared` rules |

### Quick links — modules

| Module | Doc |
|--------|-----|
| auth | [modules/auth](./modules/auth/README.md) |
| events | [modules/events](./modules/events/README.md) |
| live | [modules/live](./modules/live/README.md) |
| stripe-payments | [modules/stripe-payments](./modules/stripe-payments/README.md) |
| setting | [modules/setting](./modules/setting/README.md) |
| order | [modules/order](./modules/order/README.md) |
| user | [modules/user](./modules/user/README.md) |
| address | [modules/address](./modules/address/README.md) |
| branch | [modules/branch](./modules/branch/README.md) |
| category | [modules/category](./modules/category/README.md) |
| product | [modules/product](./modules/product/README.md) |
| health | [modules/health](./modules/health/README.md) |

### Quick links — features

| Feature | Doc |
|---------|-----|
| Stripe | [features/stripe](./features/stripe/README.md) · [setup](./features/stripe/setup.md) |
| Live | [features/live](./features/live/README.md) · [setup](./features/live/setup.md) |

## White-label first (mandatory)

This backend is a **white-label** template: one deploy = one restaurant brand, configured with **minimal code changes**.

| Prefer | Avoid |
|--------|--------|
| `setting` catalog + admin `PATCH /api/settings/:key` | Hardcoding currency, dial, VAT, business name, ETA copy knobs |
| Injectable Nest **modules** (+ optional features like Stripe) | Giant shared services full of brand if/else |
| Env only for **secrets** / infra | Putting Stripe secrets or JWT in settings or `EXPO_PUBLIC_*` |
| Read `SettingService.getValue` / public settings API | New constants scattered in payment/order for per-client values |

**Rule of thumb:** if an admin could reasonably change it without a deploy (currency, dial bundle, VAT rate, display name, monogram, timezone, order prefix, …) → put it in the **setting** module, not in code. Keep logic generic; config drives behavior.

Details: [architecture.md](./architecture.md#white-label--admin-managed-config) · [modules/setting](./modules/setting/README.md)

## Non‑negotiables

1. **White-label + settings-first** — admin-manageable values live in `setting`; keep coding logic minimal and modular (above).
2. Nest code stays **modular and injectable** (`AppModule` registration, clear exports).
3. Controller → main module service → `*DbService` / other **exported** services.
4. **DB only via** [`database-services.md`](./database-services.md) — no `Repository` in modules; purpose-oriented methods only.
5. `@shared` = **infra services only** (auth, guards, Firebase Admin) — not persistence, not business-domain modules ([shared-services.md](./shared-services.md)).
6. Secrets in env; business config in `setting` module.
7. New Nest module → `modules/<name>/README.md`. New product integration → `features/<name>/` with `setup.md` + module usage list.
8. **Keep `ai_instruction/` in sync** — see [maintenance.md](./maintenance.md).
9. **Never create or edit TypeORM migration files** (`src/migrations/history/**`, `generate-migration-file`, hand-written migrations) **unless the user explicitly asks** for a migration. Entity / DB-service changes alone are not permission to generate migrations — stop and ask, or leave schema migration to the human.

## Related

- [../README.md](../README.md)
- Template `.docs/`: [../../../.docs/](../../../.docs/)
