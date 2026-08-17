# Coding standards

## Layers

- **Screens** compose layout + call hooks; avoid raw axios.
- **Modules** (`src/modules/*`) wrap API hooks for screen needs (draft state, mapping, validation messages).
- **API** (`src/api/OrderBooking/modules/<resource>/`) owns HTTP + React Query keys only.
- **Live SSE** lives in `src/api/OrderBooking/Live/` (singleton client + event bus + `useLiveEvent` / `useLiveEvents` / `useLiveAnyEvent`). Uses **fetch + Bearer**, not axios.
- Specialized live listeners belong next to the feature (`src/modules/<area>/hooks/useLive*.ts`). Cross-cutting invalidate stays in `src/modules/live/`.

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
- Prefer backend `user_error_detail` (localized); use `t('errors.*')` as the required default (never English-only hardcoded fallbacks).
- `StateBlock` accepts `error` (string) and/or `errorCause` (raw) — see [error-handling.md](./error-handling.md).
- Full rules: [error-handling.md](./error-handling.md). Backend contract: [backend error-handling](../../backend/ai_instruction/error-handling.md).

## Auth

- Protected routes via `ProtectedRoute`.
- Admin APIs expect Bearer token + `is_super_admin` on the backend.

## Env

- Public config only: `VITE_*` (see `.env.example`).
- `VITE_GOOGLE_MAPS_WEB_KEY` is a **browser** Maps JavaScript key (HTTP referrers). Do not put Nest `GOOGLE_MAPS_API_KEY` there. Load the map only from the branch location editor after the operator asks to edit the pin.
- Never put secrets in the admin SPA.
- Product feature flags: use `src/features/_registry` helpers — never branch on raw `VITE_FEATURE_*` in screens ([features/README.md](./features/README.md)).
