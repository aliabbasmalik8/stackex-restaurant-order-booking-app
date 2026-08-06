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
- `firestore.collections` — schema metadata for this template (field types, status enums). Used for docs / validation during provisioning; not a live Firestore API by itself

## `firestore.custom.rules`

App-specific rules for this order-booking template. On provision, the backend applies this file **as-is** for that client (full replace, not merge with generic suffix rules).

Current collection:

| Collection | Create | Read | Update | Delete |
|------------|--------|------|--------|--------|
| `orders` | signed-in user as self (`userId` = auth uid) | owner or `admin` claim | owner (immutable `userId` / `orderCode`) or admin | denied |

## `seed-data.json`

Preview-only sample documents. Keys under `collections` are **real collection names** (e.g. `orders`).

- Each array item is one document; `id` becomes the Firestore document id.
- Replace `userId: "REPLACE_WITH_AUTH_UID"` with a real Auth uid after preview users are created (or let the backend rewrite this during seed).

Keep seed data minimal and realistic for demos — bilingual fields match the mobile app’s pickup order shape.

## Notes

- Lives next to `sollution/`, not inside it — same idea as other native-builder templates.
- Add new collections here first (`config` schema + rules + seed), then wire the app to those names.
- Do not put real production secrets or customer PII in seed data.
