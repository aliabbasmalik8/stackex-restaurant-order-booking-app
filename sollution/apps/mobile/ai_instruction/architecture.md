# Architecture

> Update when folder layout or API client shape changes.  
> Feature additions → [`features/`](./features/README.md) + [`maintenance.md`](./maintenance.md).

## Purpose

Expo Router + React Native client for the order-booking pickup app.  
HTTP: `EXPO_PUBLIC_API_URL` + `/api` → Nest backend.

## Layer flow

```text
app/ route (thin)
  → src/screens/… (UI)
       → hooks / domain helpers
            → FEATURE GATE (isServiceInteractive / shouldRenderService)
            → src/api/OrderBooking (axios + React Query)
                 → Nest /api/*
```

| Layer | Lives in | Responsibility |
|-------|----------|----------------|
| Route | `app/**` | Navigation only |
| Screen | `src/screens/` | Compose UI; call hooks; **gate features** |
| Components | `src/components/` | Presentational UI |
| Feature registry | `src/modules/services/` | Catalog + env resolve (`EXPO_PUBLIC_SERVICE_*`) |
| API | `src/api/OrderBooking/` | Axios, auth header, React Query per resource |
| Theme / i18n | `src/theme/`, `src/i18n/` | Tokens + locales |
| Auth session | `src/utils/auth/` | Tokens in AsyncStorage |

## Folder structure

```text
mobile/
  app/                         # Expo Router
  src/
    api/OrderBooking/          # ONLY HTTP client
      client.ts
      queryClient.ts
      modules/<resource>/      # API functions + hooks + types (not “product features”)
    modules/services/          # Feature registry (injectable capabilities)
    modules/{auth,catalog,…}/  # Optional domain helpers (code org only)
    screens/
    components/
    theme/
    i18n/
  ai_instruction/
    features/                  # Product feature docs (env-gated)
```

**Naming note:** `src/api/OrderBooking/modules/*` = API resource folders.  
**Product features** (payments, Apple login, …) are documented under `ai_instruction/features/` and gated by `src/modules/services`.

## Features (injectable)

Optional capabilities must:

1. Be registered in `SERVICE_REGISTRY`
2. Declare default `mode` + optional `envEnableKey`
3. Be consumed only via `getServiceStatus` / `isServiceInteractive` / `shouldRenderService`

Full rules: **[features/README.md](./features/README.md)**.

## Related

- [coding-standards.md](./coding-standards.md)
- [features/README.md](./features/README.md)
- [maintenance.md](./maintenance.md)
