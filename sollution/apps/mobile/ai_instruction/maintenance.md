# Documentation maintenance (required)

**Rule:** Feature, API, screen, theme, i18n, or env changes must update `ai_instruction/` in the **same change set**.

## What to update

| You changed… | Update these |
|--------------|--------------|
| Feature registry / new `ServiceId` / env flag | [`features/README.md`](./features/README.md) catalog table + `features/<id>/README.md` + `.env.example` |
| Feature UI/hooks behavior | That feature’s README |
| `src/api/OrderBooking/**` | [architecture.md](./architecture.md) if client contract changed |
| Expo routes / major folders | [architecture.md](./architecture.md) |
| Coding / gating conventions | [coding-standards.md](./coding-standards.md) |
| Cross-app payments | Feature [payment-methods](./features/payment-methods/README.md) + backend Stripe docs |

## Checklist

- [ ] Feature still env-gated via helpers (no raw env in screens)?
- [ ] Catalog table + feature README accurate?
- [ ] `.env.example` lists new `EXPO_PUBLIC_SERVICE_*` keys?
- [ ] Indexes: [features/README.md](./features/README.md), [README.md](./README.md)

## Agents

1. Diff features / API / screens  
2. Update matching `ai_instruction` paths  
3. Same turn as code — no “docs later”
