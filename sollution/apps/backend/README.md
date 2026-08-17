# Order booking backend

NestJS API. Auth + TypeORM flow matches `native-builder-backend` (use `npm` for migration generate if preferred).

## AI / coding standards

**Start here for agents and contributors:**

→ [`ai_instruction/README.md`](./ai_instruction/README.md)

**Docs sync (mandatory):** code changes to Nest modules or product features must update `ai_instruction/` in the same change → [`ai_instruction/maintenance.md`](./ai_instruction/maintenance.md)

| Doc | Contents |
|-----|----------|
| [ai_instruction/maintenance.md](./ai_instruction/maintenance.md) | What to update when code changes |
| [ai_instruction/architecture.md](./ai_instruction/architecture.md) | Layers, white-label |
| [ai_instruction/coding-standards.md](./ai_instruction/coding-standards.md) | Naming, DTOs, env |
| [ai_instruction/modules/](./ai_instruction/modules/README.md) | Nest modules (`src/modules/*`) |
| [ai_instruction/features/](./ai_instruction/features/README.md) | Product features (e.g. Stripe) |
| [ai_instruction/shared-services.md](./ai_instruction/shared-services.md) | `@shared` rules |

**Modules** = Nest folders. **Features** = product integrations that may span several modules (see [Stripe setup](./ai_instruction/features/stripe/setup.md)).

**White-label:** keep config admin-manageable via the **setting** module; keep logic modular and generic — [ai_instruction white-label rules](./ai_instruction/README.md#white-label-first-mandatory).

## Setup

```bash
cd apps/backend
pnpm install
cp .env.example .env
# Postgres must be reachable
pnpm migration:run
pnpm start:dev
```

## APIs

### Auth / profile

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/auth/signup` | public |
| `POST` | `/api/auth/login` | public |
| `GET` | `/api/users/me` | Bearer JWT |
| `PATCH` | `/api/users/me` | Bearer JWT |
| `GET` | `/api/addresses` | Bearer JWT — saved delivery addresses |
| `POST` | `/api/addresses` | Bearer JWT — create (`lat`/`lng` required) |
| `PATCH` | `/api/addresses/:id/default` | Bearer JWT — set default |
| `POST` | `/api/addresses/reverse-geocode` | Bearer JWT — pin → English street fields (throttled) |

### Catalog (public)

| Method | Path |
|--------|------|
| `GET` | `/api/branches` |
| `GET` | `/api/categories` |
| `GET` | `/api/products` |
| `GET` | `/api/products/:id` |

### Orders (auth)

| Method | Path |
|--------|------|
| `GET` | `/api/orders` |
| `POST` | `/api/orders` |
| `GET` | `/api/orders/manage` | admin |
| `PATCH` | `/api/orders/:id/status` | admin |

`POST /api/orders` accepts optional `paymentMethod`: `cash` (default) | `card`.

### Live (system change feed)

| Method | Path | Auth |
|--------|------|------|
| `GET` (SSE) | `/api/live/admin/stream` | Bearer JWT + super-admin — all `admin` events |
| `GET` (SSE) | `/api/live/me/stream` | Bearer JWT — `user` events for this `userId` only |

Use `fetch` + `Authorization` (not `EventSource`). Audience is `LIVE_AUDIENCE` next to the events catalog. Keepalive `ping`. Client maps `type` → UI/query updates.

### Payments (Stripe — white-label via env)

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/stripe-payments/intent` | Bearer JWT — body `{ "orderId" }` |
| `POST` | `/api/stripe-payments/webhook` | Stripe signature |

Card flow: create order with `paymentMethod: "card"` → `POST /stripe-payments/intent` → confirm on client → webhook marks `paid`.

Currency / business identity for PaymentIntents come from **settings**
(`currency_code`, `currency_display`, `business_name`, `business_monogram`), not env.
Only Stripe secrets stay in env (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).

### Settings (white-label)

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/settings/public` | public — object of public catalog keys (resolved) |
| `GET` | `/api/settings` | super-admin — all catalog keys |
| `PATCH` | `/api/settings/:key` | super-admin — scalar replace, or JSON merge |

`GET /api/settings/public` returns catalog keys → resolved values (same names as catalog):

```json
{
  "business_name": "Sanam Grill",
  "currency_code": "aed",
  "currency_display": "AED",
  "vat_rate": 0.05,
  "dial": { "code": "+971", "region": "AE", "flag": "🇦🇪" }
}
```

```bash
# full dial (or any JSON group)
PATCH /api/settings/dial
{ "value": { "code": "+1", "region": "US", "flag": "🇺🇸" } }

# partial dial — merges onto current, then validates
PATCH /api/settings/dial
{ "value": { "code": "+971" } }

# scalar
PATCH /api/settings/currency_display
{ "value": "AED" }
```

Catalog defaults live in code; `app_setting` rows are overrides only.

```bash
# login
curl -s -X POST http://localhost:8000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ada@example.com","password":"secret1"}'

# me
curl -s http://localhost:8000/api/users/me \
  -H "Authorization: Bearer <token>"
```

## Schema (manual — no migration in this change)

```sql
CREATE TABLE IF NOT EXISTS app_setting (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar NOT NULL UNIQUE,
  value text NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Migrations

```bash
npm run generate-migration-file --name=myChange
npm run migration:run
```

## Env

| Key | Example |
|-----|---------|
| `PORT` | `8000` |
| `environment` | `development` |
| `DATABASE_URL` | `postgres://…` |
| `JWT_SECRET` | JWT secret |
| `CORS_ORIGINS` | e.g. `http://dineos-live.localhost,https://dineos-live.preview.stackex.ai` |
| `STRIPE_SECRET_KEY` | `sk_test_…` (per white-label client) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` |
| `GOOGLE_MAPS_API_KEY` | Geocoding API server key (omit → reverse geocode 503) |

## Layout

```text
apps/backend/
├── ai_instruction/
│   ├── maintenance.md       ← mandatory docs sync when code changes
│   ├── modules/<name>/      ↔ src/modules/<name>
│   ├── features/stripe/     ← setup.md + modules that use Stripe
│   ├── features/google-maps/ ← Geocoding reverse (server key)
│   ├── architecture.md
│   ├── coding-standards.md
│   └── shared-services.md
├── src/modules/<name>/      ← Nest code + short README pointer
├── src/shared/
└── src/utils/
```
