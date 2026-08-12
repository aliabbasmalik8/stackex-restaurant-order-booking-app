# Architecture

> Update when folder layout, routes, or API client shape changes.  
> Conventions → [coding-standards.md](./coding-standards.md) · sync → [maintenance.md](./maintenance.md).

## Purpose

Vite + React admin SPA for the order-booking pickup app.  
HTTP: `VITE_API_URL` + `/api` → Nest backend (super-admin session).

## Layer flow

```text
Route (AppRoutes)
  → src/screens/… (UI)
       → src/modules/<area>/ (hooks / helpers)
            → src/api/OrderBooking (axios + React Query)
                 → Nest /api/*
```

| Layer | Lives in | Responsibility |
|-------|----------|----------------|
| Route | `AppRoutes.tsx` | Path → screen |
| Screen | `src/screens/` | Compose UI; call module hooks |
| Components | `src/components/` | Layout + presentational UI |
| Domain helpers | `src/modules/` | Screen-facing hooks (edit/list) |
| API | `src/api/OrderBooking/` | Axios client, React Query per resource |
| Theme / i18n | `src/theme/`, `src/i18n/` | Tokens + locales |
| Auth session | `src/utils/auth/`, `src/modules/auth/` | Token + admin profile |
| Features | `src/features/_registry`, `src/features/<name>/` | Env-gated capabilities (e.g. Firebase Storage upload) |
| Auth HTTP | `src/api/OrderBooking/modules/auth/` | `POST /api/auth/login` (**deprecated**; Firebase planned) |
| User HTTP | `src/api/OrderBooking/modules/user/` | `GET /api/users/me` |
| Errors | `src/lib/getErrorMessage.ts` | Localized API errors — [error-handling.md](./error-handling.md) |

## Folder structure

```text
admin/
  src/
    api/OrderBooking/          # ONLY HTTP client
      client.ts                # ApiError + user_error_detail
      queryClient.ts
      modules/
        auth/                  # POST /auth/login
        user/                  # GET /users/me
        firebase-storage/      # POST /firebase-storage/product-image
        orders/ · products/ · …
    features/
      _registry/               # Feature catalog + helpers
      firebase-storage/        # Upload helper (gated)
    modules/{auth,orders,…}/  # Domain helpers for screens
    lib/
      getErrorMessage.ts       # user_error_detail → localized string
    screens/
    components/
    theme/
    i18n/
  ai_instruction/
```

### API errors → UI

```text
Nest { user_error_detail }
  → ApiError.user_error_detail
  → getErrorMessage(error, defaultMessage)
  → screen / StateBlock
```

Full rules: **[error-handling.md](./error-handling.md)**.

## Main routes

| Path | Screen |
|------|--------|
| `/login` | Login (`POST /api/auth/login`) |
| `/orders` | Orders |
| `/products` · `/products/:id` | Products |
| `/categories` · `/categories/:id` | Categories |
| `/settings` | White-label settings (`GET/PATCH /api/settings`) |

## Settings

Admin settings page edits catalog keys via:

- `GET /api/settings` — list resolved values + override flags
- `PATCH /api/settings/:key` — upsert override (JSON keys merge)

Backend catalog is source of truth for keys/types/defaults.  
Guest app reads public keys via `GET /api/settings/public`.

## Related

- [coding-standards.md](./coding-standards.md)
- [error-handling.md](./error-handling.md)
- [maintenance.md](./maintenance.md)
- Backend setting module: [`../../backend/ai_instruction/modules/setting/`](../../backend/ai_instruction/modules/setting/README.md)
