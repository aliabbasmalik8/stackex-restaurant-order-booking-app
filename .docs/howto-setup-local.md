# How to set up (local)

Maintainer guide for Nest + Postgres so you can run the API, seed catalog, and create an admin.

Paths from **template root**.

---

## 1. Postgres + Redis

- Postgres DB (local or Neon). Example: `order-booking`
- Redis for auth sessions (same as main Nest backend pattern)

---

## 2. Backend

```bash
cd sollution/apps/backend
pnpm install
cp .env.example .env
```

Fill at least:

| Key | Example |
|-----|---------|
| `PORT` | `8000` |
| `environment` | `development` |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/order-booking` |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | long random strings |
| `REDIS_URL_DEFAULT` | `redis://127.0.0.1:6379/0` |

```bash
pnpm migration:run
pnpm start:dev
```

Health: http://localhost:8000/api/health  
Auth: [../sollution/apps/backend/README.md](../sollution/apps/backend/README.md)

---

## 3. Scripts (seed + admin)

```bash
cd scripts
pnpm install
cp .env.example .env
# DATABASE_URL = same database as backend
pnpm reseed
pnpm create:admin
```

Defaults for admin: `admin@example.com` / `PreviewAdmin123!` (override via flags or env).

Login:

```bash
curl -s -X POST http://localhost:8000/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"PreviewAdmin123!"}'
```

---

## 4. Mobile / admin apps

Apps may still contain **legacy Firebase client code** while API migration continues.  
Target: call Nest `/api/*` with Bearer tokens.

See [environment.md](./environment.md) and [../sollution/README.md](../sollution/README.md).

---

## Checklist

| Step | Done when |
|------|-----------|
| DB reachable | `DATABASE_URL` works |
| Migrations | `pnpm migration:run` OK |
| Seed | `category` / `product` rows exist |
| Admin | `pnpm create:admin` + login returns tokens |
| API up | `/api/health` → `ok: true` |
