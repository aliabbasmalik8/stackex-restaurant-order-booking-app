# Database (Postgres + TypeORM)

Paths from **template root**.

Backend: `sollution/apps/backend`  
Seed: `scripts/seed-data.json`  
Migrations: `sollution/apps/backend/src/migrations/history/`

## Rules

- `synchronize: false` — schema only via migrations
- Generate: `cd sollution/apps/backend && pnpm generate-migration-file --name=myChange`
- Apply: `pnpm migration:run`

Same flow as native-builder-backend (pnpm instead of npm).

## Entities

| Entity | Table | Notes |
|--------|-------|-------|
| `User` | `user` | email/password auth; `is_super_admin`, `is_active` |
| `Category` | `category` | `slug` = old Firestore doc id |
| `Product` | `product` | FK `category_id`; `modifiers` jsonb; `branch_id` string until branch table |

## Seed mapping (`scripts/seed-data.json`)

Firestore-shaped JSON kept for familiarity:

| Seed path | Postgres |
|-----------|----------|
| `collections.menu_categories[].id` | `category.slug` (skip `all`) |
| `label` / `label_arabic` / `sortOrder` | `label` / `label_arabic` / `sort_order` |
| `collections.menu_items[].id` | `product.slug` |
| camelCase fields | snake_case columns |
| `categoryId` | resolve slug → `category.id` |
| `branchId` | `product.branch_id` (string) |
| `modifiers` | `product.modifiers` jsonb |
| `collections.branches` | **not seeded** (no branch table yet) |

```bash
cd scripts && pnpm reseed
cd scripts && pnpm create:admin
```
