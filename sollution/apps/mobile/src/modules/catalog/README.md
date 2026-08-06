# Catalog module (Firestore)

White-label menu catalog: collection names, API fetches, provider, hooks.

**Must stay mapped** to template-root `firebase/` (seed + rules). Maintainer map:  
[../../../../../../.docs/overview.md](../../../../../../.docs/overview.md) · [../../../../../../.docs/firebase.md](../../../../../../.docs/firebase.md)

```text
modules/catalog/
  constants.ts          # COLLECTIONS — rename here + firebase seed/rules together
  types.ts              # Branch, MenuCategory, MenuItem, modifiers
  api/                  # Pure Firestore calls (no React)
  CatalogProvider.tsx   # Loads once; shares via context
  hooks/useMenuItem.ts  # Cache + single-doc fallback
  index.ts              # Public exports
```

## Collection map

| `COLLECTIONS` key | Firestore name | Seed |
|-------------------|----------------|------|
| `branches` | `branches` | `firebase/seed-data.json` |
| `menuCategories` | `menu_categories` | same |
| `menuItems` | `menu_items` | same |
| `orders` | `orders` | not seeded — created at checkout |
| `users` | `users` | not seeded — `modules/profile` |

## Usage

```tsx
import { CatalogProvider, useCatalog, useMenuItem } from '@/modules/catalog';

const { items, categories, primaryBranch, isLoading, refetch } = useCatalog();
const { item } = useMenuItem(id);
```

Wire `CatalogProvider` above screens that need the menu (already in `AppProvider`).

Env: only the six `EXPO_PUBLIC_FIREBASE_*` keys — see `apps/mobile/.env.example` and [.docs/environment.md](../../../../../../.docs/environment.md).
