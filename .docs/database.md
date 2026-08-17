# Database (Postgres + TypeORM)

Paths from **template root**.

Backend: `sollution/apps/backend`  
Seed: `scripts/seed-data.json`  
Migrations: `sollution/apps/backend/src/migrations/history/`

## Rules

- `synchronize: false` — schema only via migrations
- Generate: `cd sollution/apps/backend && npm run generate-migration-file --name=myChange`
- Apply: `npm run migration:run`
- **Agents:** never generate or edit migration files unless the human **explicitly** asks. See backend [ai_instruction/README.md](../sollution/apps/backend/ai_instruction/README.md#nonnegotiables) (rule 9) and [coding-standards.md](../sollution/apps/backend/ai_instruction/coding-standards.md).

## Entities

| Entity | Table | Notes |
|--------|-------|-------|
| `User` | `user` | auth + profile (`contact_phone`); `is_super_admin`; `firebase_uid`; `password` **deprecated** (Nest-local auth, remove later) |
| `UserAddress` | `user_address` | saved delivery addresses (`label`, street fields, `lat`/`lng`, `is_default`); FK `user_id` |
| `Branch` | `branch` | kitchens / fulfillment locations; `slug`; optional `lat`/`lng`/`delivery_radius_km` |
| `Category` | `category` | `slug` stable id for seed upserts |
| `Product` | `product` | FK `category_id`; `modifiers` jsonb; brand-level menu (not per-branch) |
| `Order` | `order` | `items` / `contact` / `customer_address` as **jsonb** snapshots (no product/user joins for display) |

## Seed mapping (`scripts/seed-data.json`)

Catalog seed uses a nested `collections` shape:

| Seed path | Postgres |
|-----------|----------|
| `collections.branches[].id` | `branch.slug` |
| `name` / `address` / `etaMinutes` / `lat` / `lng` / `deliveryRadiusKm` / … | snake_case columns |
| `collections.menu_categories[].id` | `category.slug` (skip `all`) |
| `label` / `label_arabic` / `sortOrder` | `label` / `label_arabic` / `sort_order` |
| `collections.menu_items[].id` | `product.slug` |
| camelCase fields | snake_case columns |
| `categoryId` | resolve slug → `category.id` |
| `modifiers` | `product.modifiers` jsonb |
| user profile fields | `user.contact_phone` |
| `orders` | not seeded (created by app at checkout) |

```bash
cd scripts && pnpm reseed
cd scripts && pnpm create:admin
```
