# Module: `address`

**Code:** [`src/modules/address/`](../../../src/modules/address/)

## What it’s for

Saved delivery addresses for the signed-in user (label, street fields, map pin). First address, or `isDefault: true`, becomes the default.

## Routes

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/addresses` | JWT — caller’s addresses (default first) |
| `POST` | `/api/addresses` | JWT — create (`lat`/`lng` required) |

## Depends on

- Entity `UserAddress` (`user_address`)
- `UserAddressDbService` (`listByUserIdOrdered`, `insertForUser`)
- `SharedModule` (`AuthGuard`)

## Exports

None.

## Product features

None.
