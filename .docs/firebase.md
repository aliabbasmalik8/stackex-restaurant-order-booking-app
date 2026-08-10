# Firebase template — keep mapped

Preview backend reads **`firebase/`** at template root when provisioning a customer. The mobile catalog under **`sollution/`** must use the same collection names and document shapes.

Paths below are from **template root**.

## Purpose of `firebase/` (not the app)

| File | Responsibility |
|------|----------------|
| `firebase/config.json` | What backend enables + field docs |
| `firebase/firestore.custom.rules` | Full rules for the client project |
| `firebase/seed-data.json` | Preview / local seed documents |

These live **outside** `sollution/`. Do not move them into the Expo app.  
Backend file meanings: [../firebase/README.md](../firebase/README.md).

## Mapping checklist

| If you change… | Also update… |
|----------------|--------------|
| Collection name in seed | `firestore.custom.rules` · `config.json` · `sollution/apps/mobile/src/modules/catalog/constants.ts` · `api/*` |
| Document fields (e.g. bilingual names) | Catalog `types.ts` + mappers · seed · optionally `config.json` |
| Public vs owner rules | Rules file · Auth assumptions in the app |
| Seed-only demo content | UI that expects those doc ids / fields |

Canonical tables: [overview.md](./overview.md#proper-mapping-keep-aligned).

## Current collections

| Collection | Rules intent | Seeded? | App |
|------------|--------------|---------|-----|
| `branches` | public read / admin write | yes | `api/branches.ts` |
| `menu_categories` | public read / admin write | yes | `api/menuCategories.ts` |
| `menu_items` | public read / admin write | yes | `api/menuItems.ts` |
| `orders` | owner or client admin (dashboard) | no (runtime only) | `COLLECTIONS.orders` · `modules/orders` |
| `users` | **owner or client admin (read)** | no (runtime only) | `COLLECTIONS.users` · `modules/profile` |

**`users/{uid}`** — owner write; admin can list for the dashboard. Orders stay admin-readable so ops works. Apply `firestore.custom.rules` in the Console.

Module notes: [../sollution/apps/mobile/src/modules/catalog/README.md](../sollution/apps/mobile/src/modules/catalog/README.md) · [../sollution/apps/mobile/src/modules/profile/README.md](../sollution/apps/mobile/src/modules/profile/README.md).

## Local Admin tools (`scripts/` — maintainer only)

```bash
cd scripts
pnpm clear:firestore -- --yes
pnpm upload:seed
pnpm reseed
```

Uses service account — bypasses rules. See [../scripts/README.md](../scripts/README.md).

Mobile env (manual, six keys only — main backend standard): [environment.md](./environment.md).
