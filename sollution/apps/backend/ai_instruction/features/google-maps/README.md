# Feature: Google Maps (Geocoding + Places)

Server-side **reverse geocoding** and **Places search** so the app never holds a Google Maps key. English address lines.

Optional: omit `GOOGLE_MAPS_API_KEY` → Maps routes return **503** (app still boots).

**Docs sync:** env, quotas, or consuming modules change → this file, [setup.md](./setup.md), and listed module docs ([maintenance.md](../../maintenance.md)).

## Architecture (white-label hybrid)

```text
@shared GoogleMapsService   → API key + Google Geocoding / Places HTTP (no routes)
modules/address             → JWT, throttle, request DTOs
```

Same pattern as Firebase Admin (shared) + product modules for HTTP.

## Setup

→ **[setup.md](./setup.md)**

## Modules / services that use this feature

| Layer | Doc / code | Role |
|-------|------------|------|
| `@shared` `GoogleMapsService` | [`google-maps.service.ts`](../../../src/shared/services/google-maps.service.ts) · [shared-services](../../shared-services.md) | Vendor client (`language=en`) |
| Nest `address` | [modules/address](../../modules/address/README.md) | Product routes + throttle |

## Flow (summary)

**Pin (map / GPS)**

1. Client has a pin.  
2. `POST /api/addresses/reverse-geocode` with JWT + `{ lat, lng }`.  
3. `{ line1, line2, area, city, formattedAddress, lat, lng }`.

**Search**

1. Client types a query (optional `lat`/`lng` bias, optional `sessionToken`).  
2. `POST /api/addresses/place-autocomplete` → `{ placeId, description, mainText, secondaryText }[]`.  
3. User picks one → `POST /api/addresses/place-details` `{ placeId, sessionToken? }` → same street fields + pin as reverse geocode.  
4. Client moves the map / fills the form / `POST /api/addresses`.

Rate limits live on the Nest **route** (in-memory throttler), not in shared. Also set a **daily quota** in Google Cloud.

## Related

- [../README.md](../README.md)  
- [../../modules/address/README.md](../../modules/address/README.md)  
- [../../shared-services.md](../../shared-services.md)
