# Order booking backend

Minimal NestJS API for the white-label order-booking solution. Starts with a health check only; Neon/Postgres and domain modules come next.

## Setup

```bash
cd apps/backend
pnpm install
cp .env.example .env
pnpm start:dev
```

Health: [http://localhost:8000/api/health](http://localhost:8000/api/health)

| Script | What it does |
|--------|----------------|
| `pnpm start:dev` | Watch mode |
| `pnpm build` | Compile to `dist/` |
| `pnpm start:prod` | Run compiled app |

## Layout

```text
src/
├── main.ts
└── modules/
    ├── app.module.ts
    └── health/
        ├── health.module.ts
        └── health.controller.ts
```
