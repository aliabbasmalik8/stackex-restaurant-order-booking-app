<!-- Sollutions readme - internal -->

# Order Booking App (template)

White-label restaurant pickup ordering template for Stackex / native-builder.

## Contents

| Path | Purpose |
|------|---------|
| `sollution/` | Shipable solution — Expo mobile + shared types |
| `claude-design/` | Screen designs & interactive prototypes |
| `firebase/` | Preview-backend config, rules, seed (`orders`) |

## Quick start (mobile)

```bash
cd sollution/apps/mobile
pnpm install
pnpm start
```

Full solution docs, white-label theming, and structure: **[sollution/README.md](./sollution/README.md)**.

## Firebase

Template files for preview provisioning live in **[firebase/](./firebase/)** — see **[firebase/README.md](./firebase/README.md)** for how `config.json`, rules, and seed data are used by the backend when spinning up a customer preview.

### Local testing

Use this Firebase project while developing against a real backend (not the per-customer preview):

| | |
|--|--|
| **Project ID** | `restaurent-order-app-local` |
| **Console** | https://console.firebase.google.com/project/restaurent-order-app-local/overview |

Wire the mobile app’s Firebase config to this project when testing Auth / Firestore locally. Apply `firebase/firestore.custom.rules` and optionally seed from `firebase/seed-data.json` so local data matches the template.
