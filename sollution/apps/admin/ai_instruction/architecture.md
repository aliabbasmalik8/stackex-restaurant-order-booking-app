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
| Auth HTTP | `src/api/OrderBooking/modules/auth/` | `POST /api/auth/login` (**deprecated**; Firebase planned) |
| User HTTP | `src/api/OrderBooking/modules/user/` | `GET /api/users/me` |

## Folder structure

```text
admin/
  src/
    api/OrderBooking/          # ONLY HTTP client
      client.ts
      queryClient.ts
      modules/
        auth/                  # POST /auth/login
        user/                  # GET /users/me
        orders/ · products/ · …
    modules/{auth,orders,…}/  # Domain helpers for screens
    screens/
    components/
    theme/
    i18n/
  ai_instruction/
```

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
- [maintenance.md](./maintenance.md)
- Backend setting module: [`../../backend/ai_instruction/modules/setting/`](../../backend/ai_instruction/modules/setting/README.md)
