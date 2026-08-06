# Scripts

Shared tooling for this template (local Firebase ops, future sync jobs, etc.).

`package.json` and `.env` live here so **all** scripts under `scripts/` reuse the same deps and credentials.

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

(Those packages are already listed under `pnpm.onlyBuiltDependencies` in `package.json`.)

1. Open [Firebase Console](https://console.firebase.google.com/project/restaurent-order-app-local/overview) → Project settings → **Service accounts** → **Generate new private key**.
2. Save the JSON as `scripts/service-account.json` (gitignored).
3. Fill `scripts/.env` (see `.env.example`).

| Variable | Required | Purpose |
|----------|----------|---------|
| `FIREBASE_PROJECT_ID` | yes | Target project (default local: `restaurent-order-app-local`) |
| `GOOGLE_APPLICATION_CREDENTIALS` | one of | Path to service account JSON (relative to `scripts/`) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | one of | Inline service account JSON (CI) |
| `SEED_USER_ID` | no | Replace `REPLACE_WITH_AUTH_UID` in seed docs |
| `SEED_DATA_PATH` | no | Override seed file (default `../firebase/seed-data.json`) |

Admin SDK writes **bypass Firestore security rules** — safe for local seeding; keep keys out of git.

## Scripts

| Command | What it does |
|---------|----------------|
| `pnpm upload:seed` | Upload `firebase/seed-data.json` → Firestore |

Details: [sync-data/upload-seed-data/README.md](./sync-data/upload-seed-data/README.md)

## Layout

```text
scripts/
  package.json          # shared deps
  .env / .env.example   # shared credentials
  .gitignore
  sync-data/
    upload-seed-data/
      upload.mjs
      README.md
```

Add new tools as sibling folders under `scripts/` (or under `sync-data/`) and register a pnpm script in this `package.json`.
