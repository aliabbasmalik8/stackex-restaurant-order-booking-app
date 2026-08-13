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
            → src/api/OrderBooking (axios + React Query; Live SSE via fetch)
                 → Nest /api/*
```

| Layer | Lives in | Responsibility |
|-------|----------|----------------|
| Route | `AppRoutes.tsx` | Path → screen |
| Screen | `src/screens/` | Compose UI; call module hooks |
| Components | `src/components/` | Layout + presentational UI |
| Domain helpers | `src/modules/` | Screen-facing hooks (edit/list) |
| API | `src/api/OrderBooking/` | Axios + React Query; Live SSE via fetch |
| Theme / i18n | `src/theme/`, `src/i18n/` | Tokens + locales |
| Auth session | `src/utils/auth/`, `src/modules/auth/` | Token + admin profile |
| Live SSE | `src/api/OrderBooking/Live/`, `src/modules/live/` + feature `useLive*` hooks | Super-admin change stream → event bus → specialized listeners |
| Features | `src/features/_registry`, `src/features/<name>/` | Env-gated capabilities (e.g. Firebase Storage upload) |
| Auth HTTP | `src/api/OrderBooking/modules/auth/` | `POST /api/auth/login` (**deprecated**; Firebase planned) |
| User HTTP | `src/api/OrderBooking/modules/user/` | `GET /api/users/me` |
| Errors | `src/lib/getErrorMessage.ts` | Localized API errors — [error-handling.md](./error-handling.md) |

## Folder structure

```text
admin/
  src/
    api/OrderBooking/          # HTTP client + live bus
      client.ts                # ApiError + user_error_detail
      queryClient.ts
      Live/                    # SSE singleton + event bus + primitive hooks
      modules/
        auth/                  # POST /auth/login
        user/                  # GET /users/me
        firebase-storage/      # POST /firebase-storage/product-image
        orders/ · products/ · …
    features/
      _registry/               # Feature catalog + helpers
      firebase-storage/        # Upload helper (gated)
    modules/{auth,orders,live,…}/  # Domain helpers + specialized live listeners
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
| `/products` · `/products/:id` · `/products/:id/:section` | Products (hub + section edit) |
| `/categories` · `/categories/:id` | Categories |
| `/branches` · `/branches/:id` · `/branches/:id/:section` | Branches (hub + section edit) |
| `/settings` | White-label settings (`GET/PATCH /api/settings`) |

## Live stream

Same idea as Native Builder’s websocket layer: **one connection**, **typed event bus**, **specialized listeners** elsewhere. Transport is SSE (`GET /api/live/admin/stream`, fetch + Bearer — `EventSource` cannot send `Authorization`). Guest `/me/stream` is not used here. `ping` is keepalive only (not dispatched).

```text
LiveInitializer (auth → connect/disconnect)
  → api/OrderBooking/Live  (SSE singleton → dispatch by type)
       → useLiveEvent / useLiveEvents / useLiveAnyEvent
            → feature hooks (invalidate, toasts, …)
```

| Piece | Role |
|-------|------|
| `api/OrderBooking/Live/` | Client, bus (`subscribeLiveEvent` / `Any` / multi), primitive hooks |
| `modules/live/LiveInitializer` | Connect while super-admin is logged in |
| `modules/live/hooks/useLiveInvalidateQueries` | Any change → React Query keys (`live.queryMap.ts`) |
| `modules/orders/hooks/useLiveOrderToasts` | `order.placed` toast only |
| Orders poll | `useOrdersManage` still refetches every 15s if SSE drops |

Subscribe from any screen or module hook:

```ts
useLiveEvent(LIVE_EVENT.ORDER_PLACED, (event) => { /* one type */ })
useLiveEvents([LIVE_EVENT.ORDER_PLACED, LIVE_EVENT.ORDER_STATUS_CHANGED], (event) => { /* several */ })
useLiveAnyEvent((event) => { /* all catalog / unknown types */ })
```

Add a new catalog event → extend `LIVE_EVENT` + payload map → write a feature `useLive*` hook. Add a query-key row in `modules/live/live.queryMap.ts` when a new domain should refetch.

Prefix map today: `order.*` → orders, `product.*` → products, `category.*` → categories, `branch.*` → branches, `setting.*` → settings.

Backend: [`../../backend/ai_instruction/features/live/`](../../backend/ai_instruction/features/live/README.md)

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
- Backend live module: [`../../backend/ai_instruction/modules/live/`](../../backend/ai_instruction/modules/live/README.md)
