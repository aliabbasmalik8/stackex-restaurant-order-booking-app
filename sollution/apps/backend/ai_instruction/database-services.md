# Database services

> Persistence gateway for this backend. Update when adding entities or `*-db.service` methods.

## Rule (non‑negotiable)

**All database access goes through `src/database/services/*-db.service.ts`.**

| Do | Don’t |
|----|--------|
| Inject `OrderDbService`, `UserDbService`, … | Inject `Repository<T>` in module services/controllers |
| Call purpose-named methods with plain data | Pass QueryBuilder / `FindOptions` / raw SQL from modules |
| Put TypeORM only inside `database/services/` | Scatter `save` / `update` / ad-hoc queries across modules |

```text
Controller → Module service (business rules)
                → *DbService (persistence only)
                     → TypeORM Repository  (private to database/services)
```

Import alias:

```ts
import { OrderDbService } from '@database/services/order-db.service';
```

`DatabaseModule` is `@Global()` and registered in `AppModule` — feature modules do **not** call `TypeOrmModule.forFeature` themselves.

## Purpose-oriented API (not generic CRUD)

Bad:

```ts
update(id, patch: Partial<Order>)
save(entity)
find(where: FindOptionsWhere<Order>)
```

Good:

```ts
applyPaymentSucceeded(orderId, paymentIntentId)
bindStripePaymentIntent(orderId, paymentIntentId)
insertCheckoutOrder(input)
listByUserExcludingDraftNewestFirst(userId)
listAllNewestFirst()
updateProfile(id, { name?, contactPhone?, address? })
upsertOverride(key, serializedValue)
```

Each method encodes **one intent**. Callers pass only the values needed for that intent — never a free-form query object.

## Services today

| Service | File | Examples |
|---------|------|----------|
| `UserDbService` | `user-db.service.ts` | `create`, `findByEmail`, `findById`, `setActiveStatus`, `updateProfile` |
| `OrderDbService` | `order-db.service.ts` | `insertCheckoutOrder`, `listByUserExcludingDraftNewestFirst`, `listAllNewestFirst`, `applyPaymentSucceeded`, … |
| `SettingDbService` | `setting-db.service.ts` | `listOverrides`, `findOverrideByKey`, `upsertOverride` |
| `BranchDbService` | `branch-db.service.ts` | `listActiveOrdered`, `findById` |
| `CategoryDbService` | `category-db.service.ts` | `insertCategory`, `updateCategoryContent`, `deleteById`, … |
| `ProductDbService` | `product-db.service.ts` | `listAvailable`, `insertProduct`, `replaceProductContent`, `countByCategoryId`, … |

Entities stay in `src/database/entities/`. Wiring: `src/database/database.module.ts`.

## ESLint enforcement (build / CI)

Adapted from native-builder-backend ESLint setup. This repo adds a **DB boundary** rule:

- Modules **must not** import `Repository`, `InjectRepository`, `TypeOrmModule`, `DataSource`, etc.
- Allowlist: `src/database/services/**`, `database.module.ts`, `app.module.ts`, `src/migrations/**`

```bash
npm run lint:check
```

Fails with `no-restricted-imports` if someone queries outside `*-db.service.ts`.

## Adding a new persistence method

1. Add a **named** method on the right `*-db.service.ts` (or create a new `foo-db.service.ts` + register in `DatabaseModule`).
2. Accept a small typed input (scalars / DTO-like object) — not `Partial<Entity>` dumps unless the purpose is truly “replace these known columns”.
3. Keep Nest HTTP exceptions / business rules in the **module** service; Db services return `null` / booleans / entities.
4. Update this doc’s table if you add a new `*DbService`.
5. Full entity workflow: [add-database-entity.md](./add-database-entity.md)

## What stays in module services

- Ownership / authz checks  
- Stripe / external APIs  
- Settings catalog coercion & defaults (`SettingService`)  
- DTO ↔ response mapping  
- HTTP exceptions  

## Related

- [add-database-entity.md](./add-database-entity.md)  
- [architecture.md](./architecture.md)  
- [coding-standards.md](./coding-standards.md)  
- [shared-services.md](./shared-services.md) — `@shared` is **not** for DB access  
- [maintenance.md](./maintenance.md)  
