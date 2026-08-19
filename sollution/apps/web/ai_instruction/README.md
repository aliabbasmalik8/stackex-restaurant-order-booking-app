# AI instructions — order-booking web

Instructions for humans and agents working on `sollution/apps/web` (Vite + React guest SPA).

## Docs sync (mandatory)

**Code changes to screens, API clients, features, theme, or env are not done until `ai_instruction/` is updated.**

→ **[maintenance.md](./maintenance.md)**

## Core docs

| Doc | When |
|-----|------|
| [maintenance.md](./maintenance.md) | Any feature / route / API / env change |
| [architecture.md](./architecture.md) | Layers, API, folders |
| [error-handling.md](./error-handling.md) | API error display / `user_error_detail` |
| [coding-standards.md](./coding-standards.md) | Naming, imports, feature gating |
| [features/README.md](./features/README.md) | Injectable features + env checks |

## Non‑negotiables

1. **Features are modular** — register in `FEATURE_REGISTRY`; gate with helpers only.
2. **API only via** `src/api/OrderBooking`.
3. **API failures shown via** `getErrorMessage`.
4. **i18n** + **theme** tokens for UI.
5. **Docs stay in sync** with code.

## Related

- Mobile (same guest features): [`../../mobile/ai_instruction/`](../../mobile/ai_instruction/)
- Backend: [`../../backend/ai_instruction/`](../../backend/ai_instruction/)
