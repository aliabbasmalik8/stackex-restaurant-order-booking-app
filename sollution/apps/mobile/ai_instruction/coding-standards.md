# Coding standards

> Expo / RN conventions for this template. Update when patterns change.

## Path aliases

```ts
import { isServiceInteractive } from '@/modules/services';
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
| Feature id | camelCase `ServiceId` | `paymentMethods`, `appleLogin` |
| Env enable flag | `EXPO_PUBLIC_SERVICE_<NAME>` | `EXPO_PUBLIC_SERVICE_PAYMENT_METHODS` |

## Layering

1. `app/` routes thin.
2. Screens do **not** call axios — use OrderBooking API / hooks.
3. **Features:** never `if (process.env.EXPO_PUBLIC_SERVICE_…)` in UI. Always:

```ts
import { isServiceInteractive, shouldRenderService, getServiceStatus } from '@/modules/services';

if (!shouldRenderService('appleLogin')) return null;
const canUse = isServiceInteractive('appleLogin');
```

4. New optional capability → register in registry + `ai_instruction/features/<id>/` (see [features/README.md](./features/README.md)).

## React / RN

- Functional components only.
- React Query for server state.
- Avoid needless `useMemo` / `useCallback`.
- Respect safe areas / existing navigation patterns.

## Styling & i18n

- Colors / spacing / type → `@/theme`.
- User-visible strings → `i18next` + `src/i18n/locales`.
- Disabled features: use `unavailableReasonKey` from the registry (i18n), don’t hardcode “unavailable” copy.

## Auth & secrets

- Tokens only via `src/utils/auth/session`.
- Never put Nest/Stripe **secrets** in `EXPO_PUBLIC_*`.
- Public flags only for feature enablement + `EXPO_PUBLIC_API_URL`.

## Checklist before merging

- [ ] Optional capability registered + env-gated via services helpers?
- [ ] No raw env branching in screens for feature availability?
- [ ] HTTP only through OrderBooking client?
- [ ] i18n + theme tokens for new UI?
- [ ] `ai_instruction/features/` + [maintenance.md](./maintenance.md) updated?

## Related

- [architecture.md](./architecture.md)
- [features/README.md](./features/README.md)
- [maintenance.md](./maintenance.md)
