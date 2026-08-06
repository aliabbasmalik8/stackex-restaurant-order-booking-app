# Upload seed data

Reads `firebase/seed-data.json` and writes each document into Firestore using the **Admin SDK** (rules do not apply).

## Run

From `scripts/`:

```bash
pnpm install          # once
pnpm upload:seed
```

### Options

```bash
# Preview writes without touching Firestore
pnpm upload:seed -- --dry-run

# Replace docs entirely instead of merge
pnpm upload:seed -- --overwrite
```

### Env used

Loaded from `scripts/.env` (see [scripts/README.md](../../README.md)):

- `FIREBASE_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT_JSON`
- `SEED_USER_ID` (optional) — rewrites `userId: "REPLACE_WITH_AUTH_UID"`
- `SEED_DATA_PATH` (optional)

## Seed format

```json
{
  "collections": {
    "orders": [
      { "id": "o1", "userId": "...", "...": "..." }
    ]
  }
}
```

- Top-level keys under `collections` are **collection names**.
- Each item’s `id` becomes the document id; remaining fields are the document body.

Source of truth: [`firebase/seed-data.json`](../../../firebase/seed-data.json).

Implementation: `upload.mjs` (plain Node ESM — no TypeScript build step).
