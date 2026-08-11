# Documentation maintenance (required)

**Rule:** Feature registry, feature UI, API client, screens, theme, i18n, or env changes **must** update matching `ai_instruction/` docs in the **same change set**. Incomplete without docs.

Agents: treat doc updates as part of the task, not optional follow-up.

## Features ↔ docs connection

| Code change | Docs that must move with it |
|-------------|----------------------------|
| `ServiceId` / `SERVICE_REGISTRY` / resolve logic | [`features/README.md`](./features/README.md) (resolution rules + catalog table) |
| New or changed feature behavior | `features/<id>/README.md` |
| New `EXPO_PUBLIC_SERVICE_*` (or other feature env) | `.env.example` + feature README + catalog row |
| `requiredEnvKeys` / `alternativeAvailable` / `mode` | That feature README **and** catalog table |
| Settings catalog / TTL / bootstrap / public API | [`features/settings/README.md`](./features/settings/README.md) + [architecture.md](./architecture.md) |

Resolution contract (keep README + code identical):

```text
env missing → hidden (if alternativeAvailable) else disabled
env OK     → registry `mode` (enabled | disabled | hidden)
```

## Other updates

| You changed… | Also update |
|--------------|-------------|
| `src/api/OrderBooking/**` | [architecture.md](./architecture.md) if client contract changed |
| Major folders / routes | [architecture.md](./architecture.md) |
| Gating / coding conventions | [coding-standards.md](./coding-standards.md) |

## Checklist (every PR / agent finish)

- [ ] Feature still gated only via helpers (no raw env in screens)?
- [ ] Resolution rules still match `resolveServiceMode`?
- [ ] Catalog table + `features/<id>/README.md` accurate?
- [ ] Settings bootstrap/catalog/TTL docs match code if touched?
- [ ] `.env.example` lists required feature env keys?
- [ ] [features/README.md](./features/README.md) + [README.md](./README.md) indexes OK?

## Agents

1. Diff `src/modules/services/**`, `features` UI, API, env  
2. Open the matching paths above  
3. Edit docs in the **same turn** as code  
