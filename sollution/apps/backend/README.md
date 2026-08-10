# Order booking backend

Minimal NestJS API. Postgres + TypeORM migration flow matches
`native-builder-backend` (pnpm instead of npm).

## Setup

```bash
cd apps/backend
pnpm install
cp .env.example .env
pnpm migration:run
pnpm start:dev
```

Health: [http://localhost:8000/api/health](http://localhost:8000/api/health)

## Migrations (same as main backend)

```bash
# after entity changes
pnpm generate-migration-file --name=myChange
pnpm migration:run
```

| Script | What it does |
|--------|----------------|
| `pnpm start:dev` | Watch mode |
| `pnpm build` | Compile to `dist/` |
| `pnpm generate-migration-file --name=<name>` | Diff entities → migration |
| `pnpm migration:run` | Apply pending migrations |
| `pnpm migration:revert` | Revert last migration |

## Env

| Key | Example |
|-----|---------|
| `PORT` | `8000` |
| `environment` | `development` \| `staging` \| `production` |
| `DATABASE_URL` | `postgres://postgres:<password>@localhost:5432/order-booking` |

`synchronize` is **off**. Schema changes only via migrations.

## Layout (same shape as native-builder-backend)

```text
src/
├── main.ts
├── database/
│   ├── entities/          ← *.model.ts
│   ├── services/          ← *-db.service.ts
│   └── index.ts
├── migrations/
│   ├── data-source.ts
│   └── history/
├── modules/
│   ├── app.module.ts
│   ├── health/
│   └── user/              ← no HTTP controller yet
└── utils/
    └── environment.util.ts
```
