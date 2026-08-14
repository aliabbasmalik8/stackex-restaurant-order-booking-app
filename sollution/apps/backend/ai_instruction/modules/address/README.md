# Module: `address`

**Code:** [`src/modules/address/`](../../../src/modules/address/)

## What it’s for

Saved delivery addresses for the signed-in user (label, street fields, map pin). First address, or `isDefault: true`, becomes the default.

Also owns **reverse geocode** HTTP (pin → English street fields) via `@shared` `GoogleMapsService`. Missing `GOOGLE_MAPS_API_KEY` → 503.

## Routes

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/addresses` | JWT — caller’s addresses (default first) |
| `POST` | `/api/addresses` | JWT — create (`lat`/`lng` required) |
| `POST` | `/api/addresses/reverse-geocode` | JWT — body `{ lat, lng }` (throttled) |

Reverse-geocode throttle (in-memory, per user): **8 / minute** and **20 / hour**.

## Depends on

- Entity `UserAddress` (`user_address`)
- `UserAddressDbService` (`listByUserIdOrdered`, `insertForUser`)
- `SharedModule` → `AuthGuard`, `GoogleMapsService` (`GoogleReverseGeocodeResult`)
- `@nestjs/throttler` (`AddressGeocodeThrottlerGuard` on reverse-geocode only)

## Exports

None.

## Product features

- [Google Maps / Geocoding](../../features/google-maps/README.md)
