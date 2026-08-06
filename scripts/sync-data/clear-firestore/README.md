# Clear Firestore

Deletes all documents in this template’s collections (from `firebase/seed-data.json` keys, or the default set: `branches`, `menu_categories`, `menu_items`, `orders`).

Uses the **Admin SDK** — bypasses security rules.

## Run

From `scripts/`:

```bash
# Preview what would be deleted
pnpm clear:firestore -- --dry-run

# Actually delete (requires --yes)
pnpm clear:firestore -- --yes
```

Typical reset before reseeding:

```bash
pnpm clear:firestore -- --yes
pnpm upload:seed
```

## Env

Same as other scripts — see [scripts/README.md](../../README.md):

- `FIREBASE_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT_JSON`
