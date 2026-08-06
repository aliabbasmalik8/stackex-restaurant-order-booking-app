# Scripts

Shared tooling for this template (local Firestore clear / seed). Lives at **template root**, next to `sollution/` and `firebase/` — not inside the shippable app.

Folder roles / mapping: [../.docs/overview.md](../.docs/overview.md)

`package.json` and `.env` live here so **all** scripts under `scripts/` reuse the same deps and credentials.

Mobile Firebase env (six `EXPO_PUBLIC_*` keys only) is filled **manually** in `sollution/apps/mobile/.env` — see [../.docs/environment.md](../.docs/environment.md). These scripts do not write that file.

## Setup

```bash
cd scripts
pnpm install
cp .env.example .env
```

If pnpm asks to approve build scripts for `@firebase/util` / `protobufjs`, run:

```bash
pnpm approve-builds --all
```

1. Open [Firebase Console](https://console.firebase.google.com/project/restaurent-order-app-local/overview) → Project settings → **Service accounts** → **Generate new private key**.
2. Save the JSON as `scripts/service-account.json` (gitignored).
3. Fill `scripts/.env` (see `.env.example`).

| Variable | Required | Purpose |
|----------|----------|---------|
| `FIREBASE_PROJECT_ID` | yes | Target project (default local: `restaurent-order-app-local`) |
| `GOOGLE_APPLICATION_CREDENTIALS` | one of | Path to service account JSON (relative to `scripts/`) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | one of | Inline service account JSON (CI) |
| `SEED_USER_ID` | no | Optional rewrite for `userId` placeholders (unused while orders aren’t seeded) |
| `SEED_DATA_PATH` | no | Override seed file (default `../firebase/seed-data.json`) |

Admin SDK writes **bypass Firestore security rules** — keep keys out of git.

## Scripts

| Command | What it does | Maps to |
|---------|--------------|---------|
| `pnpm clear:firestore -- --yes` | Delete docs in template collections | Collections in `firebase/seed-data.json` |
| `pnpm upload:seed` | Upload seed → Firestore | `../firebase/seed-data.json` |
| `pnpm reseed` | Clear (`--yes`) then seed | same |

```bash
pnpm clear:firestore -- --dry-run
pnpm reseed
```

Details:

- [sync-data/clear-firestore/README.md](./sync-data/clear-firestore/README.md)
- [sync-data/upload-seed-data/README.md](./sync-data/upload-seed-data/README.md)

## Layout

```text
scripts/
  package.json
  .env / .env.example
  lib/firebase-admin.mjs
  sync-data/
    clear-firestore/
    upload-seed-data/
```

Add new tools under `scripts/` and register a pnpm script in this `package.json`.
