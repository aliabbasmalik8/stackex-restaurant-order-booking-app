# Architecture

> Update when folder layout or API client shape changes.  
> Feature additions → [`features/`](./features/README.md) + [`maintenance.md`](./maintenance.md).

## Purpose

Expo Router + React Native client for the order-booking pickup app.  
HTTP: `EXPO_PUBLIC_API_URL` + `/api` → Nest backend.

## Layer flow

```text
app/ route (thin)
  → src/screens/… (UI pages)
       → src/feature-ui/… (composable feature blocks)
            → src/features/<name>/ (hooks, api, providers)
            → FEATURE GATE (@/features/_registry)
            → src/api/OrderBooking (axios + React Query)
                 → Nest /api/*
  → src/core/… (domain: catalog, orders, profile, settings, auth)
```

| Layer | Lives in | Responsibility |
|-------|----------|----------------|
| Route | `app/**` | Navigation only |
| Screen | `src/screens/` | Compose pages; wire feature-ui |
| Feature UI | `src/feature-ui/` | Higher UI blocks that compose features |
| Feature impl | `src/features/<name>/` | Hooks, API helpers, providers |
| Feature registry | `src/features/_registry/` | Catalog + env resolve |
| Domain | `src/core/` | Catalog, orders, profile, settings, auth (not injectable) |
| API | `src/api/OrderBooking/` | Axios, auth header, React Query per resource |
| Theme / i18n | `src/theme/`, `src/i18n/` | Tokens + locales |

## Settings bootstrap

Before splash hide: `bootstrapAppSettings()` — [features/settings](./features/settings/README.md).

```text
cache fresh? → merge with local catalog defaults
else fetch GET /api/settings/public → persist (24h TTL) → use
fail → stale cache or catalog defaults
```

## Checkout / payment

```text
/checkout → Place order (POST /orders + paymentMethod)
  cash → /order-success
  card → /payment → POST /stripe-payments/intent → PaymentSheet/Elements → sync → /order-success
```

Card UI gated by `stripePayment` (`EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`).  
Cash always available.  
Native: PaymentSheet · Web: Payment Element — [features/stripe-payment](./features/stripe-payment/README.md).

## Folder structure

```text
mobile/
  app/                         # Expo Router
  src/
    api/OrderBooking/          # ONLY HTTP client
      modules/<resource>/      # API functions + hooks + types
    features/
      _registry/               # FeatureId catalog + gate helpers
      auth/                    # Auth method helpers (password/phone/social gates)
      stripe-payment/          # Stripe provider, card session, drivers
    feature-ui/
      auth/                    # Login / signup forms + social buttons
      stripe-payment/          # Checkout payment section
    core/                      # Domain (catalog, orders, profile, …)
    screens/
    components/
    theme/
    i18n/
  ai_instruction/
    features/                  # Product feature docs (env-gated)
```

**Naming note:** `src/api/OrderBooking/modules/*` = API resource folders.  
**App domain** lives in `src/core/`. **Injectable features** live in `src/features/` (gated by `_registry`).

## Features (injectable)

Optional capabilities must:

1. Be registered in `FEATURE_REGISTRY`
2. Declare `mode` (priority when env OK) + optional `requiredEnvKeys` + `alternativeAvailable`
3. Resolve via helpers only:

```text
env missing → hidden (alt) | disabled (no alt)
env OK     → mode
```

Full rules + catalog: **[features/README.md](./features/README.md)**.  
Docs sync: **[maintenance.md](./maintenance.md)**.

## Related

- [coding-standards.md](./coding-standards.md)
- [features/README.md](./features/README.md)
- [maintenance.md](./maintenance.md)
