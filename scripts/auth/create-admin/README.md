# Create / update Postgres admin user

```bash
cd scripts
pnpm create:admin
pnpm create:admin -- --email=you@example.com --password='Secret123'
pnpm create:admin -- --dry-run
```

Sets `is_super_admin = true`. Password hashed with bcryptjs (10 rounds), matching the Nest backend.
