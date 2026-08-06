# Firebase (preview backend)

This folder is consumed by our **preview backend** when provisioning a Firebase project for each customer preview.

It is **not** shipped inside the mobile app and lives **next to** `sollution/`, not inside it. The backend reads these files, enables services, applies rules, and seeds sample data.

**Keep mapped** with the Expo catalog module — maintainer checklist:  
[.docs/firebase.md](../.docs/firebase.md) · full folder map: [.docs/overview.md](../.docs/overview.md)

## How provisioning uses these files

| File | Backend use |
|------|-------------|
| `config.json` | What to **enable** (Auth providers, Firestore, admin flag, collection field docs) |
| `firestore.custom.rules` | Full Firestore security rules — **replaces** the project’s custom rules |
| `seed-data.json` | Demo documents so the customer preview is not empty |

Flow (high level):

1. Customer preview is created for this template.
2. Backend creates / attaches a Firebase project for that client.
3. Reads `config.json` → enables listed services and optional admin setup.
4. Deploys `firestore.custom.rules` as the project’s custom rules.
5. Seeds `seed-data.json` into Firestore for **catalog** preview data (orders are created by the app at checkout — not seeded).

## `config.json`

- `services` — e.g. `auth`, `firestore`
- `auth.providers` — e.g. `password`
- `should_config_admin` — whether to provision admin claim / admin user
- `firestore.collections` — schema metadata (field types, status enums)

## `firestore.custom.rules`

App-specific rules. On provision, the backend applies this file **as-is** (full replace).

| Collection | Read | Write |
|------------|------|-------|
| `branches` | public | `admin` claim |
| `menu_categories` | public | `admin` claim |
| `menu_items` | public | `admin` claim |
| `orders` | owner or `admin` | create: self; update: owner/`admin`; delete: denied |

## `seed-data.json`

Preview sample documents. Keys under `collections` are **real collection names** — must match `sollution/apps/mobile/src/modules/catalog/constants.ts`.

| Collection | Contents | App client |
|------------|----------|------------|
| `branches` | Pickup location(s) | `modules/catalog/api/branches.ts` |
| `menu_categories` | Category chips (incl. `all`) | `api/menuCategories.ts` |
| `menu_items` | Dishes (bilingual + modifiers) | `api/menuItems.ts` |
| `orders` | — (created by app at checkout) | `COLLECTIONS.orders` · `modules/orders` |

- Each item’s `id` becomes the Firestore document id.
Seed catalog collections from `seed-data.json`. Orders are **not** seeded — the app creates them at checkout.
- Local tooling: [scripts/](../scripts/README.md) — `pnpm reseed`.

## Notes

- Add new collections here first (`config` + rules + seed), then wire `sollution/.../modules/catalog`.
- Do not put real production secrets or customer PII in seed data.
