# AI instructions — order-booking admin

Instructions for humans and agents working on `sollution/apps/admin` (Vite + React SPA).

## Docs sync (mandatory)

**Code changes to screens, API clients, routes, theme, or env are not done until `ai_instruction/` is updated.**

→ **[maintenance.md](./maintenance.md)**

## What we document here

| Focus | Docs | Code |
|-------|------|------|
| **App structure** | [architecture.md](./architecture.md) | `src/screens`, `src/components`, routes |
| **API** | [architecture.md](./architecture.md) | `src/api/OrderBooking` |
| **Errors** | [error-handling.md](./error-handling.md) | `getErrorMessage` + `ApiError.user_error_detail` |
| **Conventions** | [coding-standards.md](./coding-standards.md) | naming, layers, i18n |

Keep docs **generic** for now — expand with feature-specific folders when a capability needs its own contract.

## Core docs

| Doc | When |
|-----|------|
| [maintenance.md](./maintenance.md) | Any route / API / screen / env change |
| [architecture.md](./architecture.md) | Layers, folders, API client |
| [error-handling.md](./error-handling.md) | API error display / `user_error_detail` |
| [coding-standards.md](./coding-standards.md) | Naming, imports, UI patterns |

## Non‑negotiables

1. **API only via** `src/api/OrderBooking` (axios + React Query hooks).
2. **Screens stay thin** — domain helpers live under `src/modules/<area>/`.
3. **i18n** for all user-facing copy (`src/i18n/locales`).
4. **API failures shown via** `getErrorMessage` ([error-handling.md](./error-handling.md)) — never raw Nest / technical strings.
5. **Theme tokens** for colors / radii — no one-off hex in screens.
6. **Super-admin APIs** require authenticated admin session (`is_super_admin`).
7. **Docs stay in sync** — [maintenance.md](./maintenance.md).

## Related

- Backend: [`../../backend/ai_instruction/`](../../backend/ai_instruction/) · [error-handling](../../backend/ai_instruction/error-handling.md)
- Mobile: [`../../mobile/ai_instruction/`](../../mobile/ai_instruction/)
- Env: `.env.example` (`VITE_API_URL`)
