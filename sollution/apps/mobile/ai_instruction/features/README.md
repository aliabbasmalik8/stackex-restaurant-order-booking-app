# Features (injectable + env-gated)

Product capabilities that can be turned on/off per deploy without rewriting screens.

**Code:** `src/modules/services/` (`registry.ts`, `types.ts`, helpers in `index.ts`)

## Rules (non‑negotiable)

1. **Modular / injectable** — every optional capability has a `ServiceId` + entry in `SERVICE_REGISTRY`.
2. **Always check availability** before UI or side effects — use helpers, not raw env.
3. **Env upgrades defaults** — if `envEnableKey` is `"1"` / `"true"` / `"yes"`, mode becomes `enabled`.
4. **Document** each feature under `ai_instruction/features/<id>/README.md` + list it below.
5. **Document env** in `.env.example` when adding a new `EXPO_PUBLIC_SERVICE_*` key.

## Modes

| Mode | UI |
|------|-----|
| `enabled` | Show and allow use |
| `disabled` | Show but not interactive (optional reason via i18n) |
| `hidden` | Do not render |

## Helpers (use these)

```ts
import {
  isServiceInteractive,
  shouldRenderService,
  getServiceStatus,
  isServiceEnabled,
} from '@/modules/services';
```

| Helper | Use when |
|--------|----------|
| `shouldRenderService(id)` | Whether to mount the control at all |
| `isServiceInteractive(id)` | Whether the user can activate it |
| `getServiceStatus(id)` | Need mode + `reasonKey` |
| `isServiceEnabled(id)` | Strict enabled check |

**Bad:** `if (process.env.EXPO_PUBLIC_SERVICE_APPLE_LOGIN === '1')` in a screen.  
**Good:** `isServiceInteractive('appleLogin')`.

## How to add a feature

1. Add `ServiceId` in `types.ts`.
2. Add `SERVICE_REGISTRY` entry: default `mode`, `unavailableReasonKey?`, `envEnableKey?`.
3. Gate all UI/entry points with helpers.
4. Add i18n for unavailable copy if needed.
5. Add `.env.example` line for the flag.
6. Add `ai_instruction/features/<id>/README.md` + row in the table below.
7. Keep implementation self-contained (own components/hooks) so it can stay `hidden`/`disabled` without breaking cash/core flows.

## Catalog (current)

| Feature id | Default mode | Env enable key | Doc |
|------------|--------------|----------------|-----|
| `passwordLogin` | enabled | — | [password-login](./password-login/README.md) |
| `createAccountPassword` | enabled | — | [create-account-password](./create-account-password/README.md) |
| `continueAsGuest` | enabled | — | [continue-as-guest](./continue-as-guest/README.md) |
| `phoneLogin` | hidden | `EXPO_PUBLIC_SERVICE_PHONE_LOGIN` | [phone-login](./phone-login/README.md) |
| `createAccountPhone` | hidden | `EXPO_PUBLIC_SERVICE_CREATE_ACCOUNT_PHONE` | [create-account-phone](./create-account-phone/README.md) |
| `appleLogin` | disabled | `EXPO_PUBLIC_SERVICE_APPLE_LOGIN` | [apple-login](./apple-login/README.md) |
| `googleLogin` | disabled | `EXPO_PUBLIC_SERVICE_GOOGLE_LOGIN` | [google-login](./google-login/README.md) |
| `paymentMethods` | disabled | `EXPO_PUBLIC_SERVICE_PAYMENT_METHODS` | [payment-methods](./payment-methods/README.md) |
| `notifications` | disabled | `EXPO_PUBLIC_SERVICE_NOTIFICATIONS` | [notifications](./notifications/README.md) |
| `helpSupport` | disabled | `EXPO_PUBLIC_SERVICE_HELP_SUPPORT` | [help-support](./help-support/README.md) |

## Related

- [../architecture.md](../architecture.md)
- [../coding-standards.md](../coding-standards.md)
- [../maintenance.md](../maintenance.md)
