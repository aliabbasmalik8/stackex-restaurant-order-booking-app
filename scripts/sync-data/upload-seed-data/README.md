# Upload seed → Postgres

Reads `scripts/seed-data.json` (`collections.branches` / `menu_categories` / `menu_items`).

- Skips synthetic category `all`
- Upserts by `slug` (seed item `id`)
- Maps `categoryId` / `branchId` slugs → UUID FKs

```bash
cd scripts
pnpm upload:seed
pnpm upload:seed -- --dry-run
```

Requires migrations applied (`pnpm --dir ../sollution/apps/backend migration:run`).
