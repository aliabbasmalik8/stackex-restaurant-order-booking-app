# Documentation maintenance (required)

**Rule:** If you change Nest modules, product features, env, routes, or white-label settings behavior, you **must** update the matching docs under `ai_instruction/` in the **same PR / same change set**. Code without doc updates is incomplete.

## What to update

| You changed… | Update these |
|--------------|--------------|
| Files in `src/modules/<name>/` (routes, deps, exports, files) | [`modules/<name>/README.md`](./modules/README.md) |
| New Nest module under `src/modules/` | New `modules/<name>/README.md` + index in [`modules/README.md`](./modules/README.md) + pointer `src/modules/<name>/README.md` + register note in [`architecture.md`](./architecture.md) if layout changed |
| Stripe keys, webhook, PaymentIntent flow, order payment fields, currency from settings | [`features/stripe/README.md`](./features/stripe/README.md) (module usage table) **and** [`features/stripe/setup.md`](./features/stripe/setup.md) **and** touched [`modules/*/README.md`](./modules/README.md) rows that mention Stripe |
| New product integration (OTP, push, …) | New `features/<feature>/README.md` + `setup.md` + list every Nest module that uses it; link from those `modules/<name>/` docs |
| Env keys | `.env.example` + feature `setup.md` and/or module README |
| Settings catalog keys / visibility / dial shape | [`modules/setting/README.md`](./modules/setting/README.md); if payments consume them → [`features/stripe/`](./features/stripe/README.md) |
| New admin-manageable brand knobs | Prefer **settings catalog** (not hardcoded); update setting module doc + any feature that reads the key |
| Layering / shared vs module / white-label rules | [`architecture.md`](./architecture.md), [`shared-services.md`](./shared-services.md), [`coding-standards.md`](./coding-standards.md), [README white-label](./README.md#white-label-first-mandatory) |
| New entity, `*DbService`, or persistence rules | [`database-services.md`](./database-services.md) + [`add-database-entity.md`](./add-database-entity.md) + [`architecture.md`](./architecture.md) persistence section |
| Naming / DTO / error conventions | [`coding-standards.md`](./coding-standards.md) |

## Checklist (paste into PR or agent summary)

- [ ] `ai_instruction/modules/<name>/` matches code (routes, deps, exports, feature links)
- [ ] If a **feature** was touched: `features/<feature>/README.md` module table still accurate
- [ ] If **setup** changed: `features/<feature>/setup.md` (+ `.env.example`)
- [ ] `src/modules/<name>/README.md` still points at the correct `ai_instruction` docs
- [ ] Indexes updated: [modules/README.md](./modules/README.md), [features/README.md](./features/README.md), [ai_instruction/README.md](./README.md) if new entries

## Agents

Before finishing a backend task:

1. Diff which `src/modules/*` or integrations changed  
2. Open the matching `ai_instruction` paths above  
3. Apply doc edits in the same turn as code — do not leave “docs later”

## Related

- [README.md](./README.md) — modules vs features  
- [coding-standards.md](./coding-standards.md) — API checklist  
