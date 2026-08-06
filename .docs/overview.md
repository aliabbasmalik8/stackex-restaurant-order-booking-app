# Overview — purpose, split, and mapping

Paths below are from **template root** (`order-booking-app/`) unless noted.

## About this repo

**Purpose:** white-label **restaurant pickup ordering** template for Stackex / native-builder.

It supplies:

1. A **shippable Expo guest app** (`sollution/`) for customer preview / white-label base.
2. **Firebase template files** (`firebase/`) the preview backend uses to provision Auth, rules, and seed per customer.
3. **Local maintainer tooling** (`scripts/`) and **design reference** (`claude-design/`) — not part of the customer deliverable.
4. **Maintainer docs** (`.docs/` — this folder) — how to maintain the template, not product UI.

```text
order-booking-app/                 ← template repo root
├── .docs/                         ← maintainer docs (this folder) — NOT shippable
├── sollution/                     ← SHIPPABLE solution only
│   ├── apps/mobile/               ← Expo guest app
│   ├── shared/                    ← shared types (@repo/shared)
│   └── README.md                  ← app / theme / screens
├── firebase/                      ← preview-backend: config, rules, seed
├── scripts/                       ← local Admin SDK tooling
├── claude-design/                 ← design / prototype reference
└── README.md                      ← short template index
```

---

## `sollution/` vs the rest

| | `sollution/` | Rest (`.docs/`, `firebase/`, `scripts/`, `claude-design/`) |
|--|--------------|-----------------------------------------------------------|
| **Role** | Actual product solution | Template / preview pipeline / local work / maintainer docs |
| **What it is** | Expo app + shared TS | Docs, provisioning assets, Admin scripts, design |
| **Customer preview** | Yes — what runs / ships | Not the app bundle |
| **Day-to-day edits** | Screens, theme, i18n, catalog client | Schema, rules, seed, Firebase ops, design sync, docs |
| **Depends on** | Injected `EXPO_PUBLIC_FIREBASE_*` | Service account (`scripts/`); preview backend (`firebase/`) |

**Rule of thumb**

| Change | Edit here |
|--------|-----------|
| Screens, theme, i18n, catalog client | `sollution/` |
| Preview service enable/disable (Apple, Google, future addons) | `sollution/apps/mobile/src/modules/services/` — [modules.md](./modules.md) · [services.md](./services.md) |
| Domain modules (auth, catalog, orders, …) | `sollution/apps/mobile/src/modules/<name>/` — [modules.md](./modules.md) |
| Collections, rules, seed documents | `firebase/` (+ keep catalog mapped below) |
| Reseed / clear Firestore | `scripts/` |
| Mobile Firebase `.env` (six keys only) | Fill manually — [environment.md](./environment.md) |
| Match UI to design | read `claude-design/` → implement in `sollution/` |
| How-to-maintain docs | `.docs/` |

Do **not** put Admin SDK code, service accounts, seed JSON, or maintainer docs inside `sollution/apps/mobile`.

---

## Proper mapping (keep aligned)

### Folder ↔ responsibility

| Path | Maps to | Keep in sync with |
|------|---------|-------------------|
| `sollution/apps/mobile/` | Guest Expo app | Env keys ↔ main backend; collections ↔ `firebase/` |
| `sollution/apps/mobile/src/modules/` | Domain modules + addon registry | [modules.md](./modules.md) |
| `sollution/apps/mobile/src/modules/services/` | Preview feature availability (`enabled` / `disabled` / `hidden`) | Optional `EXPO_PUBLIC_SERVICE_*` · [services.md](./services.md) |
| `sollution/apps/mobile/src/modules/auth/` | Firebase email/password Auth API + gates | Console Email/Password + `AuthContext` |
| `sollution/apps/mobile/src/modules/catalog/` | Firestore catalog client | `firebase/seed-data.json` fields + collection ids |
| `sollution/apps/mobile/src/modules/orders/` | Create + list owner orders | Firestore `orders` (not seeded) |
| `sollution/apps/mobile/src/modules/profile/` | Extended profile (`users/{uid}`) + address | Firestore `users` (not seeded) · Auth for email/name mirror |
| `sollution/apps/mobile/src/modules/catalog/constants.ts` | `COLLECTIONS` name strings | Seed top-level keys + `firestore.custom.rules` |
| `sollution/apps/mobile/src/lib/firebaseEnv.ts` | Allowed Expo Firebase env keys | Main backend + `.env.example` |
| `sollution/apps/mobile/.env.example` | Documented env surface | Exact six `EXPO_PUBLIC_FIREBASE_*` keys |
| `sollution/apps/mobile/src/data/demo.ts` | VAT rate helper | Orders live in Firestore |
| `sollution/shared/` | Shared types / schemas | Mobile via `@repo/shared` |
| `.docs/` | Maintainer instructions | Reality of folders above |
| `firebase/config.json` | What preview backend enables | Product features + rules/seed |
| `firebase/firestore.custom.rules` | Client security rules | Collection names used by the app |
| `firebase/seed-data.json` | Preview / local seed docs | Catalog types + UI expectations |
| `scripts/` | Clear / seed Firestore | Reads `firebase/seed-data.json` |
| `claude-design/` | Visual / flow reference | `sollution/apps/mobile/app/` + `src/screens/` |

### Data flow

```text
claude-design/            ──(implement)──►  sollution/apps/mobile/
firebase/seed-data.json   ──(scripts)────►  Firestore project
firebase/*.rules          ──(backend)────►  Firestore rules
Firestore                         │
                                         ▼
                    sollution/.../modules/catalog  (client reads)
```

### Collection map (must match)

| Firestore collection | `firebase/seed-data.json` | App (`constants.ts` / API) | Rules intent |
|----------------------|---------------------------|----------------------------|--------------|
| `branches` | yes | `COLLECTIONS.branches` · `api/branches.ts` | public read / admin write |
| `menu_categories` | yes | `COLLECTIONS.menuCategories` · `api/menuCategories.ts` | public read / admin write |
| `menu_items` | yes | `COLLECTIONS.menuItems` · `api/menuItems.ts` | public read / admin write |
| `orders` | no | `COLLECTIONS.orders` · `modules/orders` | owner / admin |
| `users` | no | `COLLECTIONS.users` · `modules/profile` | owner read/write (email stays in Auth) |

Rename a collection → update **seed + rules + `config.json` + `constants.ts` + API files** in one change. Detail: [firebase.md](./firebase.md).

### Env map (must match)

| Layer | Keys |
|-------|------|
| Main backend → preview | Six `EXPO_PUBLIC_FIREBASE_*` only — [environment.md](./environment.md) |
| `firebaseEnv.ts` + `.env.example` | Same six names |
| Local maintainer `.env` | Fill manually from Firebase Console Web config (same six keys) |

Do **not** add Firebase client env keys outside this list without updating the main backend.

---

## Do not break

1. **Pseudo-monorepo** — no workspace root under `sollution/`; mobile installs alone (pnpm hoisted), same idea as order-desk for VM preview.
2. **Metro** — `withStackExMetro` + `@repo/shared` watch path must stay.
3. **Env contract** — no extra Firebase client keys without main backend support.
4. **Mapping** — collection names and seed fields stay aligned across `firebase/` ↔ catalog module.

## Local smoke check

```bash
# from template root
cd sollution/apps/mobile && cp .env.example .env   # fill six keys — see environment.md
pnpm install && pnpm start

cd scripts && pnpm reseed
```

White-label demo brand: `sollution/apps/mobile/src/theme/brand.ts`.
