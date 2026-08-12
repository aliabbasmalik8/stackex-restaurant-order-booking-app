# Features (injectable + env-gated)

Product capabilities that plug in without rewriting core screens.

**Code:** `src/features/_registry/` · capability impl under `src/features/<name>/` · UI blocks under `src/feature-ui/`

**Not features (always on):** continue as guest, cash payment.  
**Not features (domain / `src/core/`):** catalog, orders, profile, settings.

**Docs sync:** any registry / feature / env change **must** update this folder in the same change — see [../maintenance.md](../maintenance.md).

## Resolution order (non‑negotiable)

```text
1. Required env present?
   - EXPO_PUBLIC_FEATURE_* → truthy: 1 | true | yes
   - other keys (e.g. publishable key) → non-empty (not 0/false/no)
   NO  → alternativeAvailable ? hidden : disabled
   YES → apply registry `mode` (user / product priority: enabled | disabled | hidden)
```

| Situation | Result |
|-----------|--------|
| Missing required env + alternative exists (e.g. password vs Apple) | **`hidden`** |
| Missing required env + no alternative | **`disabled`** (visible, not usable) |
| Required env OK (or none required) | Enforce **`mode`** from registry |

**Never** read `process.env.EXPO_PUBLIC_FEATURE_*` in screens — only helpers below.

## Helpers

```ts
import {
  isFeatureInteractive,
  shouldRenderFeature,
  getFeatureStatus,
  FeatureGate,
} from '@/features/_registry';
```

| Helper | Meaning |
|--------|---------|
| `shouldRenderFeature(id)` | mode ≠ `hidden` |
| `isFeatureInteractive(id)` | mode === `enabled` |
| `getFeatureStatus(id)` | `{ mode, reasonKey? }` |
| `FeatureGate` | Render children when not hidden |

## Registry fields

| Field | Meaning |
|-------|---------|
| `mode` | Priority **when env is satisfied** (or no env required) |
| `requiredEnvKeys?` | Must all be truthy or feature is unavailable |
| `alternativeAvailable?` | Missing env → `hidden` if true, else `disabled` |
| `unavailableReasonKey?` | i18n when not enabled |

## How to add a feature (keep docs in sync)

1. Add `FeatureId` in `src/features/_registry/types.ts`
2. Add `FEATURE_REGISTRY` entry (`mode`, `requiredEnvKeys?`, `alternativeAvailable?`, …)
3. Implement under `src/features/<name>/` (hooks, api, providers)
4. Compose UI in `src/feature-ui/<name>/`; screens wire those blocks
5. Gate every UI entry with helpers
6. Update `.env.example`
7. **Add/update** feature docs under `ai_instruction/features/` (e.g. `auth/README.md` or `stripe-payment/README.md`) + catalog table below

## Catalog

| Feature id | Priority `mode` | Required env | Alt → hide if missing? | Doc |
|------------|-----------------|--------------|------------------------|-----|
| `passwordAuth` | enabled | Firebase client keys | no (disabled) | [auth](./auth/README.md) |
| `phoneAuth` | hidden | — | — | [auth](./auth/README.md) |
| `googleAuth` | enabled | `EXPO_PUBLIC_FEATURE_GOOGLE_AUTH` + Firebase keys | no (disabled; native needs web client id) | [auth](./auth/README.md) |
| `appleAuth` | enabled | `EXPO_PUBLIC_FEATURE_APPLE_AUTH` | no (disabled) | [auth](./auth/README.md) |
| `stripePayment` | enabled | `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | yes (cash) | [stripe-payment](./stripe-payment/README.md) |

### Always on (not in registry)

| Concern | Notes |
|---------|-------|
| Continue as guest | Sign-in always offers guest |
| Cash payment | Checkout always offers cash |

### App config (not a FEATURE_* flag)

| Concern | Doc |
|---------|-----|
| Public settings bootstrap | [settings](./settings/README.md) |
