# Module: `branch`

**Code:** [`src/modules/branch/`](../../../src/modules/branch/)

## What it’s for

Fulfillment locations / kitchens — public active list; super-admin manage + edit (no create/delete in API yet). Includes optional lat/lng + delivery radius for later distance checks.

## Routes

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/branches` | public — **active only** |
| `GET` | `/api/branches/manage` | super-admin — includes inactive |
| `GET` | `/api/branches/:id` | super-admin |
| `PATCH` | `/api/branches/:id` | super-admin — name, address, ETA, lat/lng, delivery radius, sort (slug immutable; **admin UI locks `active` for now**) |

## Depends on

- Entity `Branch`
- `BranchDbService` (`listActiveOrdered`, `listAllOrdered`, `findById`, `updateBranchContent`)

## Product features

None.
