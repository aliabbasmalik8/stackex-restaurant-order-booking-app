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

1. **Features are modular and injectable** — register in the service catalog; UI/hooks gate with helpers (`isServiceInteractive`, etc.). Never scatter raw `process.env.EXPO_PUBLIC_SERVICE_*` checks in screens.
2. **Always resolve feature availability** before rendering or calling that capability (enabled / disabled / hidden).
3. **API only via** `src/api/OrderBooking` — no ad-hoc axios/fetch in screens.
4. **Expo Router** routes stay thin; screens compose UI + hooks.
5. **i18n** for user-facing strings; **theme** tokens for colors/spacing.
6. **Keep `ai_instruction/` in sync** — [maintenance.md](./maintenance.md).

## Related

- Backend: [`../../backend/ai_instruction/`](../../backend/ai_instruction/)
- Env: `.env.example`
