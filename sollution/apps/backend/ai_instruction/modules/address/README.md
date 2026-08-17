# Module: `address`

**Code:** [`src/modules/address/`](../../../src/modules/address/)

## What it’s for

Saved delivery addresses for the signed-in user (label, street fields, map pin). First address, or `isDefault: true`, becomes the default.

Also owns **Maps HTTP** (reverse geocode + Places search) via `@shared` `GoogleMapsService`. Missing `GOOGLE_MAPS_API_KEY` → 503.

## Routes

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/addresses` | JWT — caller’s addresses (default first) |
| `POST` | `/api/addresses` | JWT — create (`lat`/`lng` required) |
| `PATCH` | `/api/addresses/:id` | JWT — update label / street fields / notes / pin |
| `PATCH` | `/api/addresses/:id/default` | JWT — set this address as default |
| `DELETE` | `/api/addresses/:id` | JWT — delete (if default, another is promoted) |
| `POST` | `/api/addresses/reverse-geocode` | JWT — body `{ lat, lng }` (throttled) |
| `POST` | `/api/addresses/place-autocomplete` | JWT — body `{ query, lat?, lng?, sessionToken? }` (throttled) |
| `POST` | `/api/addresses/place-details` | JWT — body `{ placeId, sessionToken? }` (throttled) |

Throttle (in-memory, per user): reverse geocode **8 / minute** and **20 / hour**; Places **30 / minute** and **80 / hour**.

## Depends on

- Entity `UserAddress` (`user_address`)
- `UserAddressDbService` (`listByUserIdOrdered`, `insertForUser`, `setDefaultForUser`, `updateForUser`, `deleteForUser`)
- `SharedModule` → `AuthGuard`, `GoogleMapsService` (`GoogleReverseGeocodeResult`, `GooglePlacePrediction`)
- `@nestjs/throttler` (`AddressGeocodeThrottlerGuard` on reverse-geocode + Places routes)

## Exports

None.

## Product features

- [Google Maps / Geocoding + Places](../../features/google-maps/README.md)
