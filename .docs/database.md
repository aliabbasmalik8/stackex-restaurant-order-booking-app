# Database (Postgres + TypeORM)

Paths from **template root**.

Backend: `sollution/apps/backend`  
Seed: `scripts/seed-data.json`  
Migrations: `sollution/apps/backend/src/migrations/history/`

## Rules

- `synchronize: false` — schema only via migrations
- Generate: `cd sollution/apps/backend && npm run generate-migration-file --name=myChange`
- Apply: `npm run migration:run`

## Entities

| Entity | Table | Notes |
|--------|-------|-------|
| `User` | `user` | auth + profile (`contact_phone`, `address` jsonb); `is_super_admin` |
| `Branch` | `branch` | pickup locations; `slug` stable id for seed upserts |
| `Category` | `category` | `slug` stable id for seed upserts |
| `Product` | `product` | FK `category_id`, `branch_id`; `modifiers` jsonb |
| `Order` | `order` | `items` / `contact` / `customer_address` as **jsonb** snapshots (no product/user joins for display) |

## Seed mapping (`scripts/seed-data.json`)

Catalog seed uses a nested `collections` shape:

| Seed path | Postgres |
|-----------|----------|
| `collections.branches[].id` | `branch.slug` |
| `name` / `address` / `etaMinutes` / … | snake_case columns |
| `collections.menu_categories[].id` | `category.slug` (skip `all`) |
| `label` / `label_arabic` / `sortOrder` | `label` / `label_arabic` / `sort_order` |
| `collections.menu_items[].id` | `product.slug` |
| camelCase fields | snake_case columns |
| `categoryId` | resolve slug → `category.id` |
| `branchId` | resolve slug → `branch.id` |
| `modifiers` | `product.modifiers` jsonb |
| user profile fields | `user.contact_phone`, `user.address` jsonb |
| `orders` | not seeded (created by app at checkout) |

```bash
cd scripts && pnpm reseed
cd scripts && pnpm create:admin
```
