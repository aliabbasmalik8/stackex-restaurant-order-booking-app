# Shared services & cross-module logic

## What `@shared` is for

**Infrastructure services only** — auth, tokens, guards, Firebase Admin bootstrap.

`SharedModule` is `@Global()`. Many modules import it. That does **not** mean every multi-consumer thing belongs here.

| Put in `@shared` | Do **not** put in `@shared` |
|------------------|-----------------------------|
| `AuthService`, `AuthGuard`, `SuperAdminGuard` | Order / Stripe / settings / catalog rules |
| JWT registration | Domain event bus + `APP_EVENTS` catalog + live SSE |
| `FirebaseAdminService` (token verify + Storage helper) | Product image **orchestration** (`firebase-storage` module) |
| Pure cross-cutting infra with no restaurant domain | Anything an admin would think of as “the product” |

**Rule:** used by several modules ≠ `@shared`.  
Multi-consumer **domain** → own Nest module (export it; `@Global()` if needed). Examples: [`setting`](./modules/setting/README.md), [`events`](./modules/events/README.md).

`@shared` exists so feature modules do not copy JWT/guard/Firebase wiring — not as a home for business domain.

Domain **events** live in the **`events` module**, not here.

**DB access is not `@shared`.** Use `src/database/services/*-db.service.ts` via `DatabaseModule` ([database-services.md](./database-services.md)). Auth may inject `UserDbService` from there.

## What does **not** belong in `@shared`

- Stripe / PaymentIntent creation
- Order workflows or event names (`order.placed`, …)
- Settings catalog / brand knobs (`setting` module)
- Hardcoded brand, currency, dial, VAT
- Any module you would omit per white-label without removing login

## Prefer a dedicated module over stuffing `@shared`

If two feature modules need the same **business** helper (and to avoid A↔B cycles):

1. Own module + **exported** API (`SettingService.getValue`, `EventsService.emit`).
2. Do **not** fold that module into `SharedModule` just because several modules use it.
3. Avoid A importing B’s private files (and B importing A).

Pure non-DI helpers (string/money) → `src/utils/`.

## Service layering (from native-builder Nest skills)

```text
Controller → MainModuleService → (optional) Subservice
                              ↘ *DbService (persistence)
                              ↘ @shared / other exported module services
```

- Controllers only see the **main** module service.
- Subservices are private to the module.
- No sub-subservice chains.

## Related

- [maintenance.md](./maintenance.md)
- [architecture.md](./architecture.md)
- [modules/README.md](./modules/README.md)
- [coding-standards.md](./coding-standards.md)
