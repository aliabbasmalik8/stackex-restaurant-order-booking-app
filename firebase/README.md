# Firebase (preview backend)

This folder is consumed by our **preview backend** when provisioning a Firebase project for each customer preview.

It is **not** shipped inside the mobile app. The backend reads these files, enables the configured services, applies rules, and seeds sample data for that client’s preview environment.

## How provisioning uses these files

| File | Backend use |
|------|-------------|
| `config.json` | What to **enable** for this template (Auth providers, Firestore, admin flag, collection field docs) |
| `firestore.custom.rules` | Full Firestore security rules document — **replaces** the project’s custom rules for that client |
| `seed-data.json` | Demo documents written into Firestore so the customer preview is not empty |

Flow (high level):

1. Customer preview is created for this template.
2. Backend creates / attaches a Firebase project for that client.
3. Reads `config.json` → enables listed services (e.g. Auth password, Firestore) and optional admin setup.
4. Deploys `firestore.custom.rules` as the project’s custom rules.
5. Seeds `seed-data.json` into the client’s Firestore so menu/order screens have preview data.

## `config.json`

Tells the backend **what to turn on** and documents the expected collection shapes.

- `services` — e.g. `auth`, `firestore`
- `auth.providers` — e.g. `password`
- `should_config_admin` — whether to provision admin claim / admin user for kitchen tooling
- `firestore.collections` — schema metadata for this template (field types, status enums)

## `firestore.custom.rules`

App-specific rules. On provision, the backend applies this file **as-is** (full replace).

| Collection | Read | Write |
|------------|------|-------|
| `branches` | public | `admin` claim |
| `menu_categories` | public | `admin` claim |
| `menu_items` | public | `admin` claim |
| `orders` | owner or `admin` | create: self; update: owner/`admin`; delete: denied |

## `seed-data.json`

Preview sample documents. Keys under `collections` are **real collection names**.

| Collection | Contents |
|------------|----------|
| `branches` | Pickup location(s) |
| `menu_categories` | Category chips (incl. `all`) |
| `menu_items` | Dishes (bilingual + modifiers) — mirrors mobile mock menu |
| `orders` | Sample pickup orders |

- Each item’s `id` becomes the Firestore document id.
- Replace `userId: "REPLACE_WITH_AUTH_UID"` on orders (or set `SEED_USER_ID` when seeding).
- Local tooling: **[scripts/](../scripts/README.md)** — `pnpm clear:firestore` then `pnpm upload:seed`.

## Notes

- Lives next to `sollution/`, not inside it.
- Add new collections here first (`config` + rules + seed), then wire the app.
- Do not put real production secrets or customer PII in seed data.
