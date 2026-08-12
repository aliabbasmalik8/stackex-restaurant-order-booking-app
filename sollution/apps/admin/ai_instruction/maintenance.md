# Documentation maintenance (required)

**Rule:** Screens, API client, routes, theme, i18n, or env changes **must** update matching `ai_instruction/` docs in the **same change set**. Incomplete without docs.

Agents: treat doc updates as part of the task, not optional follow-up.

## What moves with what

| You changed… | Also update |
|--------------|-------------|
| Routes / sidebar | [architecture.md](./architecture.md) route table + [README.md](./README.md) if indexed |
| `src/api/OrderBooking/**` | [architecture.md](./architecture.md) if client contract changed |
| Error display / `getErrorMessage` / `ApiError.user_error_detail` | [error-handling.md](./error-handling.md) (+ backend [error-handling](../../backend/ai_instruction/error-handling.md) if response shape changed) |
| Major folders / layers | [architecture.md](./architecture.md) |
| Coding conventions | [coding-standards.md](./coding-standards.md) |
| Settings admin UI / settings API usage | [architecture.md](./architecture.md) Settings section |
| New `VITE_*` env | `.env.example` + architecture/README as needed |
| Feature registry / `src/features/**` | [features/README.md](./features/README.md) + feature subfolder if any |

## Checklist (every PR / agent finish)

- [ ] New screen has route + nav (if sidebar) + i18n (en + ar)?
- [ ] API lives under `src/api/OrderBooking/modules/<resource>/`?
- [ ] User-visible API errors use `getErrorMessage` ([error-handling.md](./error-handling.md))?
- [ ] Architecture route/API notes still accurate?
- [ ] `.env.example` lists required public env keys?
## Agents

1. Diff routes, API modules, screens, env  
2. Open the matching paths above  
3. Edit docs in the **same turn** as code  
