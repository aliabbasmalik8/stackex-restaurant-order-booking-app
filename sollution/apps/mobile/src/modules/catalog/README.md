# Catalog module (Firestore)

White-label menu catalog: collection names, API fetches, provider, hooks.

```text
modules/catalog/
  constants.ts          # COLLECTIONS — rename here for white-label
  types.ts              # Branch, MenuCategory, MenuItem, modifiers
  api/                  # Pure Firestore calls (no React)
  CatalogProvider.tsx   # Loads once; shares via context
  hooks/useMenuItem.ts  # Cache + single-doc fallback
  index.ts              # Public exports
```

## Usage

```tsx
import { CatalogProvider, useCatalog, useMenuItem } from '@/modules/catalog';

const { items, categories, primaryBranch, isLoading, refetch } = useCatalog();
const { item } = useMenuItem(id);
```

Wire `CatalogProvider` above screens that need the menu (already in `AppProvider`).

Env: `EXPO_PUBLIC_FIREBASE_*` — see `apps/mobile/.env.example`.
