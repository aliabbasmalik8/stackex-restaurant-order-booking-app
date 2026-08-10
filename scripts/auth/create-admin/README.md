# Create admin user

Creates (or updates) a Firebase Auth email/password user and sets custom claim **`admin: true`** — required by Firestore rules and the admin SPA login check.

## Run

```bash
cd scripts
pnpm create:admin
```

Defaults (public preview):

| Field | Value |
|-------|--------|
| Email | `admin@example.com` |
| Password | `PreviewAdmin123!` |
| Display name | `Preview Admin` |

Override:

```bash
pnpm create:admin -- --email ops@example.com --password 'Secret123!' --display-name 'Ops'
# or
ADMIN_EMAIL=ops@example.com ADMIN_PASSWORD='Secret123!' pnpm create:admin

pnpm create:admin -- --dry-run
```

Uses `scripts/.env` credentials (`FIREBASE_PROJECT_ID` + service account).
