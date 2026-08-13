# Architecture

> Update this doc when folder layout, layers, or white-label rules change.  
> Module/feature code changes also require [`maintenance.md`](./maintenance.md) updates under `modules/` and `features/`.

## Purpose

NestJS + TypeORM API for the **order-booking** white-label template.  
One deploy = one restaurant brand. Nest **modules** are injectable; product **features** (e.g. Stripe) may span several modules.

## Layer flow

```text
HTTP request
  → Controller   (DTO validation, guards, delegate)
  → Module service (business rules, orchestration)
  → *DbService   (purpose-oriented persistence — ONLY DB access)
       → TypeORM Repository (private to database/services)
```

| Layer | Lives in | Responsibility |
|-------|----------|----------------|
| Controller | `src/modules/<name>/*.controller.ts` | Routes, auth guards, call **one** main service |
| Module service | `src/modules/<name>/*.service.ts` | Domain logic; may call other **exported** module services, `@shared`, or `*DbService` |
| Entity | `src/database/entities/` | Schema mapping |
| DB service (**required**) | `src/database/services/*-db.service.ts` | **Sole** persistence API — purpose methods, no free-form queries from modules |
| `DatabaseModule` | `src/database/database.module.ts` | `@Global()` — registers entities + exports all `*DbService` |
| Shared | `src/shared/` | Auth, guards, JWT — cross-cutting only (**not** DB) |
| Utils / config | `src/utils/` | Env types, pure helpers, constants, **`OrderBookingException`** ([error-handling.md](./error-handling.md)) |

Full rules: **[database-services.md](./database-services.md)**.

## Folder structure

```text
src/
  database/
    database.module.ts # Global persistence module
    entities/          # TypeORM models
    services/          # *-db.service.ts (only place for Repository)
  migrations/          # TypeORM history (when used)
  modules/
    app.module.ts      # Root wiring (imports DatabaseModule)
    <name>/
      <name>.module.ts
      <name>.controller.ts
      <name>.service.ts
      <name>.dto.ts
      README.md         # short pointer → ai_instruction/modules/<name>/
      *.config.ts       # Optional (e.g. stripe.config.ts)
      subservices/      # Optional — module-private heavy flows
    events/            # In-process typed bus (no HTTP) — service + types + utils/catalog
    live/              # Listens on events → SSE (`/live/admin/stream`, `/live/me/stream`)
  shared/
    guards/
    decorators/
    services/
    shared.module.ts
  utils/
    config/
    constant.ts
    order-booking.exception.ts   # OrderBookingException + ensure / controller handlers
    *.util.ts
  main.ts
```

### Errors (domain → HTTP)

```text
Service / guard throws OrderBookingException
  → Controller catch → handleControllerError
       → log error_detail, HTTP { statusCode, user_error_detail, code?, … }
       → other: re-throw
  → Global OrderBookingExceptionFilter (main.ts) for guard / uncaught cases
```

`user_error_detail` is bilingual and **non-technical**. Full rules: **[error-handling.md](./error-handling.md)**.

## Injectable modules (mental model)

Treat every product capability as a **plugin**:

1. Own folder under `modules/`
2. Own Nest `@Module` with clear `imports` / `exports`
3. Registered only in `AppModule` (or a deliberate aggregate)
4. Documented README (env, routes, who depends on it)
5. Can depend on `@shared` and **exported** services of other modules — **never** reach into another module’s private files

**Good:** `StripePaymentsModule` imports `SettingModule` (uses exported services) and settles orders via `OrderDbService`.  
**Bad:** A payments service imports another module’s private files, or puts Stripe secret handling in `shared/`.

Optional / purchasable capabilities (payments, live SSE, later FCM) should stay behind clear module boundaries so a deploy can omit wiring or env and remain cash-only.

Domain side effects (live change feed, later FCM) **listen** on [`events`](./modules/events/README.md) — they do not import Order/Stripe private files. The bus is in-process (`@nestjs/event-emitter`); it is not Redis.

## White-label & admin-managed config

**Goal:** re-skin / reconfigure a client with **config + seed**, not forks of business logic.

### Principles

1. **Modular** — Nest modules are plugins; optional features (Stripe) can be unconfigured without breaking cash flow.
2. **Minimal coding for brand differences** — no `if (brand === 'Sanam')` style branches. Same code path; different settings/env.
3. **Settings when admin could own it** — anything an operator might change from admin (currency, dial, VAT, names, timezone, prefixes, future flags) goes through the **`setting` module** (catalog default + `app_setting` override + admin PATCH). Other modules **read** via `SettingService.getValue` / public settings — they do not hardcode those values.
4. **Secrets stay in env** — JWT, Stripe keys, DB URL. Never in `app_setting` or client-public env.

### Split

| Concern | Where |
|---------|--------|
| Currency, dial, VAT, business name, monogram, timezone, order prefix | `setting` — catalog + `app_setting` · [modules/setting](./modules/setting/README.md) |
| Secrets (JWT, Stripe, DB) | `.env` / deploy secrets |
| Theme / palette | Mobile/admin `brand.ts` (not this API) |
| Optional payments provider | `features/stripe` + `stripe-payments` module (keys in env; commerce labels from settings) |

### Decision test (before hardcoding)

> “Would a white-label admin want to change this without a developer deploying new code?”

- **Yes** → add/update a settings catalog key; read it in the module.  
- **No, it’s a secret/infra** → env.  
- **No, it’s true domain behavior** → keep in the Nest module’s service logic (still avoid brand-specific branches).

## Auth

- JWT via `AuthService` + `AuthGuard`
- Super-admin via `SuperAdminGuard` (after `AuthGuard`)
- `@CurrentUser()` for the authenticated principal

## Related

- [maintenance.md](./maintenance.md)
- [coding-standards.md](./coding-standards.md)
- [error-handling.md](./error-handling.md)
- [database-services.md](./database-services.md)
- [modules/README.md](./modules/README.md)
- [features/README.md](./features/README.md)
- [shared-services.md](./shared-services.md)
