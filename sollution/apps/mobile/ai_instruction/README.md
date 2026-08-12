# AI instructions — order-booking mobile

Instructions for humans and agents working on `sollution/apps/mobile` (Expo / React Native).

## Docs sync (mandatory)

**Code changes to screens, API clients, features, theme, or env are not done until `ai_instruction/` is updated.**

→ **[maintenance.md](./maintenance.md)**

## What we document here

| Focus | Docs | Code |
|-------|------|------|
| **Features** (optional / purchasable capabilities) | [`features/`](./features/README.md) | Gated via `src/features/_registry` + `EXPO_PUBLIC_FEATURE_*` |
| **API** | [architecture.md](./architecture.md) | `src/api/OrderBooking` |
| **Errors** | [error-handling.md](./error-handling.md) | `getErrorMessage` / `toAppError` / `StateMessage` |
| **App structure** | [architecture.md](./architecture.md) | `app/`, `src/screens`, `src/feature-ui`, `src/features`, `src/core` |

We do **not** mirror Nest “modules” docs. Domain folders under `src/core/*` are just code organization; product capability docs live under **`features/`**.

## Core docs

| Doc | When |
|-----|------|
| [maintenance.md](./maintenance.md) | Any feature / route / API / env change |
| [architecture.md](./architecture.md) | Layers, API, folders |
| [error-handling.md](./error-handling.md) | API error display / `user_error_detail` |
| [coding-standards.md](./coding-standards.md) | Naming, imports, feature gating rules |
| [features/README.md](./features/README.md) | Injectable features + env checks |

## Non‑negotiables

1. **Features are modular and injectable** — register in `FEATURE_REGISTRY`; gate with helpers only (`isFeatureInteractive` / `shouldRenderFeature`).
2. **Feature resolution:** missing required env → `hidden` if alternative else `disabled`; if env OK → enforce registry `mode`. See [features/README.md](./features/README.md).
3. **API only via** `src/api/OrderBooking`.
4. **API failures shown via** `getErrorMessage` ([error-handling.md](./error-handling.md)) — prefer `user_error_detail` over raw Nest strings.
5. **Expo Router** routes stay thin.
6. **i18n** + **theme** tokens for UI.
7. **Docs stay in sync** with code — [maintenance.md](./maintenance.md) (especially features).

## Related

- Backend: [`../../backend/ai_instruction/`](../../backend/ai_instruction/) · [error-handling](../../backend/ai_instruction/error-handling.md)
- Env: `.env.example`
