# Upload seed → Postgres

Reads `scripts/seed-data.json` (Firestore-shaped `collections.menu_categories` / `menu_items`).

- Skips synthetic category `all`
- Upserts by `slug` (Firestore doc id)
- Maps `categoryId` slug → `category.id` UUID

```bash
cd scripts
pnpm upload:seed
pnpm upload:seed -- --dry-run
```

Requires migrations applied (`pnpm --dir ../sollution/apps/backend migration:run`).
