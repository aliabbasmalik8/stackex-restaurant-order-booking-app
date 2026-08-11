# AI instructions — order-booking mobile

Instructions for humans and agents working on `sollution/apps/mobile` (Expo / React Native).

## Docs sync (mandatory)

**Code changes to screens, API clients, features, theme, or env are not done until `ai_instruction/` is updated.**

→ **[maintenance.md](./maintenance.md)**

## What we document here

| Focus | Docs | Code |
|-------|------|------|
| **Features** (optional / purchasable capabilities) | [`features/`](./features/README.md) | Gated via `src/modules/services` registry + `EXPO_PUBLIC_SERVICE_*` |
| **API** | [architecture.md](./architecture.md) | `src/api/OrderBooking` |
| **App structure** | [architecture.md](./architecture.md) | `app/`, `src/screens`, `src/components` |

We do **not** mirror Nest “modules” docs. Domain folders under `src/modules/*` are just code organization; product capability docs live under **`features/`**.

## Core docs

| Doc | When |
|-----|------|
| [maintenance.md](./maintenance.md) | Any feature / route / API / env change |
| [architecture.md](./architecture.md) | Layers, API, folders |
| [coding-standards.md](./coding-standards.md) | Naming, imports, feature gating rules |
| [features/README.md](./features/README.md) | Injectable features + env checks |

## Non‑negotiables

1. **Features are modular and injectable** — register in `SERVICE_REGISTRY`; gate with helpers only.
2. **Feature resolution:** missing required env → `hidden` if alternative else `disabled`; if env OK → enforce registry `mode`. See [features/README.md](./features/README.md).
3. **API only via** `src/api/OrderBooking`.
4. **Expo Router** routes stay thin.
5. **i18n** + **theme** tokens for UI.
6. **Docs stay in sync** with code — [maintenance.md](./maintenance.md) (especially features).

## Related

- Backend: [`../../backend/ai_instruction/`](../../backend/ai_instruction/)
- Env: `.env.example`
