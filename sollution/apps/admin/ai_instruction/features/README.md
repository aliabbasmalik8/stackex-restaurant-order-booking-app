# Features (injectable + env-gated) — admin

Product capabilities that plug in without rewriting core screens.

**Code:** `src/features/_registry/` · capability impl under `src/features/<name>/`

**Not features (always on):** manual product image URL, core catalog CRUD, settings.

**Docs sync:** any registry / feature / env change **must** update this folder in the same change — see [../maintenance.md](../maintenance.md).

## Resolution order (non‑negotiable)

```text
1. Required env present?
   - VITE_FEATURE_* → truthy: 1 | true | yes
   - other keys → non-empty (not 0/false/no)
   NO  → alternativeAvailable ? hidden : disabled
   YES → apply registry `mode` (user / product priority: enabled | disabled | hidden)
```

| Situation | Result |
|-----------|--------|
| Missing required env + alternative exists (e.g. manual URL vs upload) | **`hidden`** |
| Missing required env + no alternative | **`disabled`** (visible, not usable) |
| Required env OK (or none required) | Enforce **`mode`** from registry |

**Never** read `import.meta.env.VITE_FEATURE_*` in screens — only helpers below.

## Helpers

```ts
import {
  isFeatureInteractive,
  shouldRenderFeature,
  getFeatureStatus,
  FeatureGate,
} from '@/features/_registry'
```

| Helper | Meaning |
|--------|---------|
| `shouldRenderFeature(id)` | mode ≠ `hidden` |
| `isFeatureInteractive(id)` | mode === `enabled` |
| `getFeatureStatus(id)` | `{ mode, reasonKey? }` |
| `FeatureGate` | Render children when not hidden |

## How to add a feature

1. Add `FeatureId` in `src/features/_registry/types.ts`
2. Add `FEATURE_REGISTRY` entry
3. Implement under `src/features/<name>/`
4. Gate UI with helpers
5. Update `.env.example`
6. Add/update docs under `ai_instruction/features/`

## Catalog

| Feature id | Priority `mode` | Required env | Alt → hide if missing? | Doc |
|------------|-----------------|--------------|------------------------|-----|
| `firebaseStorage` | **disabled** (default) | `VITE_FEATURE_FIREBASE_STORAGE` | yes (manual URL) | [firebase-storage](./firebase-storage/README.md) |

### Always on (not in registry)

| Concern | Notes |
|---------|-------|
| Manual image URL | Product media always accepts paste URL |
