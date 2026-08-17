# Coding standards

> Expo / RN conventions for this template. Update when patterns change.

## Path aliases

```ts
import { isFeatureInteractive } from '@/features/_registry';
import { PaymentsProvider } from '@/features/stripe-payment';
import { brand } from '@/theme/brand';
import { orderBookingApiRequest } from '@/api/OrderBooking/client';
```

Prefer `@/` over deep relative imports.

## Naming

| Kind | Convention | Example |
|------|------------|---------|
| Route file | Expo / kebab | `edit-profile.tsx` |
| Screen folder | kebab | `src/screens/checkout/` |
| Component | PascalCase | `SocialLoginButtons.tsx` |
| Hook | `use` + PascalCase | `useUserOrders` |
| API resource folder | plural | `api/OrderBooking/modules/orders/` |
| Feature id | camelCase `FeatureId` | `stripePayment`, `appleAuth` |
| Feature folder | kebab | `src/features/stripe-payment/` |
| Env enable flag | `EXPO_PUBLIC_FEATURE_<NAME>` | `EXPO_PUBLIC_FEATURE_APPLE_AUTH` |
| Config / key env | `EXPO_PUBLIC_*` (non-empty) | `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` |

## Layering

1. `app/` routes thin.
2. Screens do **not** call axios — use OrderBooking API / hooks.
3. Screens compose `feature-ui`; feature-ui uses `features/*` + registry gates.
4. `core/` = domain helpers (catalog, orders, profile) — **not** injectable features.
5. **Features:** never raw env in UI. Resolution:

```text
required env missing → hidden if alternativeAvailable else disabled
required env OK      → registry mode (enabled | disabled | hidden)
```

```ts
import { isFeatureInteractive, shouldRenderFeature } from '@/features/_registry';
```

6. New optional capability → registry + `src/features/<name>/` + `ai_instruction/features/<id>/` + catalog row ([features/README.md](./features/README.md) + [maintenance.md](./maintenance.md)).

## React / RN

- Functional components only.
- React Query for server state.
- Avoid needless `useMemo` / `useCallback`.
- Respect safe areas / existing navigation patterns.

## Styling & i18n

- Colors / spacing / type → `@/theme`.
- Color styles: `createStyles((colors) => ({ … }))` + `useTheme()` in the component so preview palette switches re-render. Do not snapshot `colors` in module-level `StyleSheet.create`.
- User-visible strings → `i18next` + `src/i18n/locales`.
- Disabled features: use `unavailableReasonKey` from the registry (i18n), don’t hardcode “unavailable” copy.

## Errors

- User-visible API failures: **`getErrorMessage(error, defaultMessage)`** from `@/lib/errors`.
- Prefer backend `user_error_detail`; use `t(errorMessageKey(…))` as the required default.
- `StateMessage`: pass `errorCode` + raw `error` so the component can localize via `getErrorMessage`.
- Flow control still uses `toAppError` (e.g. remove unavailable cart lines).
- Full rules: [error-handling.md](./error-handling.md). Backend: [backend error-handling](../../backend/ai_instruction/error-handling.md).

## Auth & secrets

- Tokens only via `src/utils/auth/session`.
- Never put Nest/Stripe **secrets** in `EXPO_PUBLIC_*`.
- Public flags only for feature enablement + `EXPO_PUBLIC_API_URL`.
- `EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY` is a **browser** Maps JavaScript key (HTTP referrers). Do not put Nest `GOOGLE_MAPS_API_KEY` there.

## Checklist before merging

- [ ] Optional capability registered + env-gated via feature helpers?
- [ ] No raw env branching in screens for feature availability?
- [ ] HTTP only through OrderBooking client?
- [ ] User-visible API errors use `getErrorMessage` ([error-handling.md](./error-handling.md))?
- [ ] i18n + theme tokens for new UI?
- [ ] `ai_instruction/features/` + [maintenance.md](./maintenance.md) updated?

## Related

- [architecture.md](./architecture.md)
- [error-handling.md](./error-handling.md)
- [features/README.md](./features/README.md)
- [maintenance.md](./maintenance.md)
