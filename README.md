<!-- Template root readme - internal -->

# Order Booking App (template)

White-label **restaurant pickup ordering** template for Stackex / native-builder.

| | |
|--|--|
| **`sollution/`** | Shippable product — Expo guest app + shared types (customer preview runs this) |
| **Everything else** | `.docs/`, `firebase/`, `scripts/`, `claude-design/` — maintainer docs, provisioning, local Admin tooling, design. Not the app bundle |

**Maintainer map (purpose · split · folder ↔ collection ↔ env):**  
[.docs/overview.md](./.docs/overview.md)

## Folder map

| Path | Role | Docs |
|------|------|------|
| `.docs/` | How to maintain this template | [.docs/README.md](./.docs/README.md) |
| `sollution/` | Shippable solution | [sollution/README.md](./sollution/README.md) |
| `firebase/` | Preview-backend config, rules, seed | [firebase/README.md](./firebase/README.md) · [.docs/firebase.md](./.docs/firebase.md) |
| `scripts/` | Local clear / seed Firestore | [scripts/README.md](./scripts/README.md) |
| `claude-design/` | Design / prototype reference | implement in `sollution/` |

Services / preview feature gates (`enabled` · `disabled` · `hidden`): [.docs/services.md](./.docs/services.md).

## Quick start

```bash
# App — fill the six EXPO_PUBLIC_FIREBASE_* keys (main backend standard)
cd sollution/apps/mobile
pnpm install
cp .env.example .env   # see .docs/environment.md
pnpm start

# Local Firestore (template root)
cd scripts
pnpm install
cp .env.example .env   # service account + project id
pnpm reseed
```

Local Firebase project: `restaurent-order-app-local`  
Console: https://console.firebase.google.com/project/restaurent-order-app-local/overview

Apply `firebase/firestore.custom.rules` on that project so the catalog is readable.  
Mobile env contract (restricted keys): [.docs/environment.md](./.docs/environment.md).
