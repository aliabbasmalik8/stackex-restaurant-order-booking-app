# Coding standards

## Path aliases

Prefer `@/` over deep relative imports.

## Naming

| Kind | Convention | Example |
|------|------------|---------|
| Screen | PascalCase `*Screen.tsx` | `SignInScreen.tsx` |
| Hook | `use` + PascalCase | `useUserProfile` |
| API resource folder | plural | `api/OrderBooking/modules/orders/` |
| Feature id | camelCase `FeatureId` | `googleAuth` |
| Env enable flag | `VITE_FEATURE_<NAME>` | `VITE_FEATURE_GOOGLE_AUTH` |

## Layering

1. Routes stay thin.
2. Screens do **not** call axios — use OrderBooking API / hooks.
3. Screens compose `feature-ui`; feature-ui uses `features/*` + registry gates.
4. `core/` = domain helpers — **not** injectable features.
5. **Features:** never raw env in UI. Use `isFeatureInteractive` / `shouldRenderFeature`.

## Styling & i18n

- Colors via CSS variables from `applyTheme()` + Tailwind tokens in `index.css`. Preview palette switches (`VITE_PREVIEW_MODE`) rewrite the same vars live.
- User-visible strings → `i18next` + `src/i18n/locales` (en + ar).

## Errors

- User-visible API failures: **`getErrorMessage(error, defaultMessage)`** from `@/lib/errors`.

## Auth & secrets

- Tokens only via `src/utils/auth/session` (localStorage).
- Never put Nest/Stripe **secrets** in `VITE_*`.
