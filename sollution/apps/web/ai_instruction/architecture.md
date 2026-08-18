# Architecture

> Update when folder layout or API client shape changes.

## Purpose

Vite + React guest SPA for the order-booking pickup app.  
HTTP: `VITE_API_URL` + `/api` → Nest backend.

Same product features as mobile. Desktop layout: persistent cart rail, split auth screens.

## Layer flow

```text
Route (AppRoutes)
  → src/screens/… (UI pages)
       → src/feature-ui/… (composable feature blocks)
            → src/features/<name>/
            → FEATURE GATE (@/features/_registry)
            → src/api/OrderBooking (axios + React Query)
                 → Nest /api/*
  → src/core/… (domain: catalog, settings, auth)
```

| Layer | Lives in | Responsibility |
|-------|----------|----------------|
| Route | `AppRoutes.tsx` | Path → screen |
| Screen | `src/screens/` | Compose pages; wire feature-ui |
| Feature UI | `src/feature-ui/` | Higher UI blocks that compose features |
| Feature impl | `src/features/<name>/` | Hooks, API helpers |
| Feature registry | `src/features/_registry/` | Catalog + env resolve |
| Domain | `src/core/` | Catalog, settings, auth (not injectable) |
| API | `src/api/OrderBooking/` | Axios, auth header, React Query per resource |
| Theme / i18n | `src/theme/`, `src/i18n/` | Tokens + locales |

## Main routes

| Path | Screen |
|------|--------|
| `/sign-in` | Sign in |
| `/sign-up` | Sign up |
| `/forgot-password` | Reset password |
| `/menu` | Menu + cart rail |
| `/checkout` | Pickup time, contact, payment |
| `/payment` | Card payment (Stripe, when enabled) |
| `/order-success` | Pickup confirmation |
| `/orders` | Order history |
| `/profile` | Edit profile |

## Settings bootstrap

Before first paint: `bootstrapAppSettings()` — `GET /api/settings/public`, else catalog defaults.

## Auth

Guest uses **Firebase →** `POST /api/auth/firebase` → Nest JWTs (same as mobile).

Password flow: email → `POST /api/auth/email-status` → password field or reset mail.

Google: Firebase popup (no Expo OAuth).

## Folder structure

```text
web/
  src/
    api/OrderBooking/
    features/
    feature-ui/
    core/
    screens/
    components/
    theme/
    i18n/
  ai_instruction/
```
