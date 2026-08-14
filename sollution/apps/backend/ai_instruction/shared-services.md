# Shared services & cross-module logic

## What `@shared` is for

**Infrastructure services only** — auth, tokens, guards, and **thin third-party clients** (Firebase Admin, Google Maps).

`SharedModule` is `@Global()`. Many modules import it. That does **not** mean every multi-consumer thing belongs here.

| Put in `@shared` | Do **not** put in `@shared` |
|------------------|-----------------------------|
| `AuthService`, `AuthGuard`, `SuperAdminGuard` | Order / Stripe PaymentIntents / settings / catalog rules |
| JWT registration | Domain event bus + `APP_EVENTS` catalog + live SSE |
| `FirebaseAdminService` (token verify + Storage helper) | Product image **HTTP orchestration** (`firebase-storage` module) |
| `GoogleMapsService` (Geocoding / future Places **client** only) | Reverse-geocode **routes**, throttle, address request DTOs (`address` module) |
| Pure cross-cutting infra with no restaurant domain | Anything an admin would think of as “the product” |

**White-label hybrid (vendor clients):**

```text
@shared/*Service     → secret + talk to vendor (no Nest routes; missing key → degrade)
modules/<domain>/    → JWT routes, throttle, DTOs, product mapping / persistence
```

Examples: Firebase Admin → `auth` / `firebase-storage`; Google Maps → `address` (reverse-geocode HTTP).

Optional vendors must **not** crash boot when the env key is missing (same pattern as Storage / Maps → 503 on use).

## Types live with the service

Public input/result types for a shared service are **exported from that same `*.service.ts` file** (not duplicated in module DTOs). Example today: `GoogleMapsService` → `GoogleReverseGeocodeResult` (`address` reverse-geocode reuses it). Align other shared services the same way later.

Module **request** DTOs (class-validator) stay in the Nest module.

**Rule:** used by several modules ≠ `@shared`.  
Multi-consumer **domain** → own Nest module (export it; `@Global()` if needed). Examples: [`setting`](./modules/setting/README.md), [`events`](./modules/events/README.md).

`@shared` exists so feature modules do not copy JWT/guard/Firebase/Google wiring — not as a home for business domain.

Domain **events** live in the **`events` module**, not here.

**DB access is not `@shared`.** Use `src/database/services/*-db.service.ts` via `DatabaseModule` ([database-services.md](./database-services.md)). Auth may inject `UserDbService` from there.

## What does **not** belong in `@shared`

- Stripe / PaymentIntent creation (optional payments module — not a shared “login infra” client today)
- Order workflows or event names (`order.placed`, …)
- Settings catalog / brand knobs (`setting` module)
- Hardcoded brand, currency, dial, VAT
- Nest **controllers**, route throttle, or product DTOs for vendor features
- Pure helpers that need no DI → `src/utils/` instead

## Prefer a dedicated module over stuffing `@shared`

If two feature modules need the same **business** helper (and to avoid A↔B cycles):

1. Own module + **exported** API (`SettingService.getValue`, `EventsService.emit`).
2. Do **not** fold that module into `SharedModule` just because several modules use it.
3. Avoid A importing B’s private files (and B importing A).

Thin **vendor** clients (Google, Firebase) may live in `@shared` when several modules need the same secret/HTTP wrapper — still **no product HTTP** in shared.

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
- [features/google-maps](./features/google-maps/README.md)
