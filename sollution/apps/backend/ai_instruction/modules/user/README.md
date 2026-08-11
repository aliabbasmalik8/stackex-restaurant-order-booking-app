# Module: `user`

**Code:** [`src/modules/user/`](../../../src/modules/user/)

## What it’s for

Authenticated profile (`/me`). Login / signup live in the [auth](../auth/README.md) module.

## Routes

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/users/me` | JWT |
| `PATCH` | `/api/users/me` | JWT |

## Depends on

- `SharedModule` (`AuthService` for guards, `UserDbService`)
- Env: `JWT_SECRET`

## Exports

None.

## Product features

Card checkout requires a logged-in user (JWT).

`user.stripe_customer_id` is set lazily by the [stripe-payments](../stripe-payments/README.md) module on first `POST /api/stripe-payments/intent` (not exposed on `/me`).
