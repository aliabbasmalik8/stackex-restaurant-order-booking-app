# Coding standards

## Layers

- **Screens** compose layout + call hooks; avoid raw axios.
- **Modules** (`src/modules/*`) wrap API hooks for screen needs (draft state, mapping, validation messages).
- **API** (`src/api/OrderBooking/modules/<resource>/`) owns HTTP + React Query keys only.

```text
screen → modules/<area> → api/OrderBooking/modules/<resource>
```

## Naming

- Screens: `*Screen.tsx`
- API: `settings.ts` · `settingsHooks.ts` · `settings.types.ts`
- Query keys: `const X_QUERY_KEY = ['x'] as const`

## UI

- Use shared `PageHeader`, `StateBlock`, `Button`, `Field` / form controls, `SearchableSelect`.
- Prefer `dash-panel` for primary content surfaces.
- No hardcoded brand/currency/VAT in UI when values come from settings API.

## i18n

- All copy via `useTranslation()` — add keys to **both** `en.ts` and `ar.ts`.
- Nav labels live under `nav.*`; add sidebar entries in `navItems.tsx`.

## Errors

- User-visible API failures: **`getErrorMessage(error, defaultMessage)`** from `@/lib/getErrorMessage`.
- Prefer backend `user_error_detail` (localized); use i18n / plain string only as the required default.
- Full rules: [error-handling.md](./error-handling.md). Backend contract: [backend error-handling](../../backend/ai_instruction/error-handling.md).

## Auth

- Protected routes via `ProtectedRoute`.
- Admin APIs expect Bearer token + `is_super_admin` on the backend.

## Env

- Public config only: `VITE_*` (see `.env.example`).
- Never put secrets in the admin SPA.
