# Order booking backend

NestJS API. Auth + TypeORM flow matches `native-builder-backend` (use `npm` for migration generate if preferred).

## Setup

```bash
cd apps/backend
pnpm install
cp .env.example .env
# Postgres must be reachable
pnpm migration:run
pnpm start:dev
```

## APIs

### Auth / profile

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/users/signup` | public |
| `POST` | `/api/users/login` | public |
| `GET` | `/api/users/me` | Bearer JWT |
| `PATCH` | `/api/users/me` | Bearer JWT |

### Catalog (public)

| Method | Path |
|--------|------|
| `GET` | `/api/branches` |
| `GET` | `/api/categories` |
| `GET` | `/api/products?branchId=` |
| `GET` | `/api/products/:id` |

### Orders (auth)

| Method | Path |
|--------|------|
| `GET` | `/api/orders` |
| `POST` | `/api/orders` |

```bash
# login
curl -s -X POST http://localhost:8000/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ada@example.com","password":"secret1"}'

# me
curl -s http://localhost:8000/api/users/me \
  -H "Authorization: Bearer <token>"
```

## Migrations

```bash
npm run generate-migration-file --name=myChange
npm run migration:run
```

## Env

| Key | Example |
|-----|---------|
| `PORT` | `8000` |
| `environment` | `development` |
| `DATABASE_URL` | `postgres://…` |
| `JWT_SECRET` | JWT secret |

## Layout

```text
src/
├── database/entities|services
├── migrations/
├── modules/
│   ├── user/ | branch/ | category/ | product/ | order/ | health/
├── shared/                ← AuthService, AuthGuard (JWT-only)
└── utils/
```
