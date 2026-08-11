# Module: `user`

**Code:** [`src/modules/user/`](../../../src/modules/user/)

## What it’s for

Signup, login (JWT), profile (`/me`).

## Routes

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/users/signup` | public |
| `POST` | `/api/users/login` | public |
| `GET` | `/api/users/me` | JWT |
| `PATCH` | `/api/users/me` | JWT |

## Depends on

- `SharedModule` (`AuthService`, `UserDbService`)
- Env: `JWT_SECRET`

## Exports

None (auth primitives live in `@shared`).

## Product features

None specific today. Card checkout requires a logged-in user (JWT) from this flow.

`user.stripe_customer_id` is set lazily by the [payment](../payment/README.md) module on first `POST /api/payments/intent` (not exposed on `/me`).
