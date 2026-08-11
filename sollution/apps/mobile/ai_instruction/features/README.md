# Features (injectable + env-gated)

Product capabilities that plug in without rewriting core screens.

**Code:** `src/modules/services/` (`registry.ts`, `types.ts`, `index.ts`)

**Docs sync:** any registry / feature / env change **must** update this folder in the same change — see [../maintenance.md](../maintenance.md).

## Resolution order (non‑negotiable)

```text
1. Required env present?  (all requiredEnvKeys truthy: 1 | true | yes)
   NO  → alternativeAvailable ? hidden : disabled
   YES → apply registry `mode` (user / product priority: enabled | disabled | hidden)
```

| Situation | Result |
|-----------|--------|
| Missing required env + alternative exists (e.g. password vs Apple) | **`hidden`** |
| Missing required env + no alternative | **`disabled`** (visible, not usable) |
| Required env OK (or none required) | Enforce **`mode`** from registry |

**Never** read `process.env.EXPO_PUBLIC_SERVICE_*` in screens — only helpers below.

## Helpers

```ts
import {
  isServiceInteractive,
  shouldRenderService,
  getServiceStatus,
} from '@/modules/services';
```

| Helper | Meaning |
|--------|---------|
| `shouldRenderService(id)` | mode ≠ `hidden` |
| `isServiceInteractive(id)` | mode === `enabled` |
| `getServiceStatus(id)` | `{ mode, reasonKey? }` |

## Registry fields

| Field | Meaning |
|-------|---------|
| `mode` | Priority **when env is satisfied** (or no env required) |
| `requiredEnvKeys?` | Must all be truthy or feature is unavailable |
| `alternativeAvailable?` | Missing env → `hidden` if true, else `disabled` |
| `unavailableReasonKey?` | i18n when not enabled |

## How to add a feature (keep docs in sync)

1. Add `ServiceId` in `types.ts`
2. Add `SERVICE_REGISTRY` entry (`mode`, `requiredEnvKeys?`, `alternativeAvailable?`, …)
3. Gate every UI entry with helpers
4. Keep implementation modular (core flows work when feature is off/hidden)
5. Update `.env.example`
6. **Add/update** `ai_instruction/features/<id>/README.md` + catalog table below
7. Touch [../maintenance.md](../maintenance.md) checklist mentally — agents must not skip docs

## Catalog

| Feature id | Priority `mode` | Required env | Alt → hide if missing? | Doc |
|------------|-----------------|--------------|------------------------|-----|
| `passwordLogin` | enabled | — | — | [password-login](./password-login/README.md) |
| `createAccountPassword` | enabled | — | — | [create-account-password](./create-account-password/README.md) |
| `continueAsGuest` | enabled | — | — | [continue-as-guest](./continue-as-guest/README.md) |
| `phoneLogin` | enabled | `EXPO_PUBLIC_SERVICE_PHONE_LOGIN` | yes | [phone-login](./phone-login/README.md) |
| `createAccountPhone` | enabled | `EXPO_PUBLIC_SERVICE_CREATE_ACCOUNT_PHONE` | yes | [create-account-phone](./create-account-phone/README.md) |
| `appleLogin` | enabled | `EXPO_PUBLIC_SERVICE_APPLE_LOGIN` | yes | [apple-login](./apple-login/README.md) |
| `googleLogin` | enabled | `EXPO_PUBLIC_SERVICE_GOOGLE_LOGIN` | yes | [google-login](./google-login/README.md) |
| `paymentMethods` | enabled | `EXPO_PUBLIC_SERVICE_PAYMENT_METHODS` | yes (cash) | [payment-methods](./payment-methods/README.md) |
| `notifications` | enabled | `EXPO_PUBLIC_SERVICE_NOTIFICATIONS` | no → disabled | [notifications](./notifications/README.md) |
| `helpSupport` | enabled | `EXPO_PUBLIC_SERVICE_HELP_SUPPORT` | no → disabled | [help-support](./help-support/README.md) |

### App config (not a SERVICE_* flag)

| Concern | Doc |
|---------|-----|
| Public settings bootstrap + local catalog + AsyncStorage TTL | [settings](./settings/README.md) |

## Related

- [../architecture.md](../architecture.md)
- [../coding-standards.md](../coding-standards.md)
- [../maintenance.md](../maintenance.md)
