# Clear Postgres catalog tables

```bash
cd scripts
pnpm clear:db -- --dry-run
pnpm clear:db -- --yes
pnpm clear:db -- --yes --users   # also truncate "user"
```
