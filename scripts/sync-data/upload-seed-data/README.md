# Upload seed → Postgres

Reads `scripts/seed-data.json` (`collections.branches` / `menu_categories` / `menu_items`).

- Skips synthetic category `all`
- Upserts by `slug` (seed item `id`)
- Maps `categoryId` slugs → UUID FKs (products are brand-level; not tied to a branch)
- Branch seed may include `lat` / `lng` / `deliveryRadiusKm`

```bash
cd scripts
pnpm upload:seed
pnpm upload:seed -- --dry-run
```

Requires migrations applied (`pnpm --dir ../sollution/apps/backend migration:run`).
