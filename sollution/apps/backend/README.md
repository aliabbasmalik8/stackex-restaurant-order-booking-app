# Order booking backend

NestJS API. Auth + TypeORM flow matches `native-builder-backend` (pnpm instead of npm).

## Setup

```bash
cd apps/backend
pnpm install
cp .env.example .env
# Postgres + Redis must be reachable
pnpm migration:run
pnpm start:dev
```

## Auth APIs (same shape as main backend)

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/users/login` | public |
| `GET` | `/api/users/me` | Bearer JWT + Redis session |

No signup/create-user HTTP API.

```bash
# login
curl -s -X POST http://localhost:8000/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"..."}'

# me
curl -s http://localhost:8000/api/users/me \
  -H "Authorization: Bearer <token>"
```

## Migrations

```bash
pnpm generate-migration-file --name=myChange
pnpm migration:run
```

## Env

| Key | Example |
|-----|---------|
| `PORT` | `8000` |
| `environment` | `development` |
| `DATABASE_URL` | `postgres://…` |
| `JWT_SECRET` | access JWT secret |
| `JWT_REFRESH_SECRET` | refresh JWT secret |
| `REDIS_URL_DEFAULT` | `redis://127.0.0.1:6379/0` |

## Layout

```text
src/
├── database/entities|services
├── migrations/
├── modules/user/          ← login + me only
├── shared/                ← AuthService, AuthGuard, Redis (like main backend)
└── utils/
```
