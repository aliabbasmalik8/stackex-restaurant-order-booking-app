# Shared services & cross-module logic

## What `@shared` is for

Cross-cutting **infrastructure** used by many modules:

- `AuthService`, `AuthGuard`, `SuperAdminGuard`
- JWT registration

`SharedModule` is `@Global()` in this template — still **do not** dump feature logic into it.

**DB access is not `@shared`.** Use `src/database/services/*-db.service.ts` via `DatabaseModule` ([database-services.md](./database-services.md)). Auth may inject `UserDbService` from there.

## What does **not** belong in `@shared`

- Stripe / PaymentIntent creation
- Order status workflows
- Settings catalog business rules (those live in `setting` module)
- Hardcoded brand, currency, dial, VAT

## Prefer shared extraction over module-to-module tangles

If two feature modules need the same **business** helper:

1. Prefer putting the source of truth in one module and **exporting** a small API (`SettingService.getValue`).
2. Or extract a dedicated module (`SettingModule`) owned by that concern.
3. Avoid A importing B’s private helpers and B importing A (circular).

If the helper is pure infrastructure (string/money util with no Nest DI), put it in `src/utils/`.

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
