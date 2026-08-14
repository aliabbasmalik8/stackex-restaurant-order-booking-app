# Feature: Google Maps (Geocoding)

Server-side **reverse geocoding** so the app never holds a Google Maps key. English address lines for a lat/lng pin.

Optional: omit `GOOGLE_MAPS_API_KEY` → reverse geocode returns **503** (app still boots).

**Docs sync:** env, quotas, or consuming modules change → this file, [setup.md](./setup.md), and listed module docs ([maintenance.md](../../maintenance.md)).

## Architecture (white-label hybrid)

```text
@shared GoogleMapsService   → API key + Google Geocoding HTTP (no routes)
modules/address             → POST /api/addresses/reverse-geocode, JWT, throttle, request DTO
```

Same pattern as Firebase Admin (shared) + product modules for HTTP.

## Setup

→ **[setup.md](./setup.md)**

## Modules / services that use this feature

| Layer | Doc / code | Role |
|-------|------------|------|
| `@shared` `GoogleMapsService` | [`google-maps.service.ts`](../../../src/shared/services/google-maps.service.ts) · [shared-services](../../shared-services.md) | Vendor client (`language=en`) |
| Nest `address` | [modules/address](../../modules/address/README.md) | Product route + throttle |

Places Autocomplete is not wired yet (extend `GoogleMapsService`; HTTP stays on a domain module).

## Flow (summary)

1. Client has a pin (GPS or map).  
2. `POST /api/addresses/reverse-geocode` with JWT + `{ lat, lng }`.  
3. `AddressService` → `GoogleMapsService.reverseGeocode` → `{ line1, line2, area, city, formattedAddress, lat, lng }`.  
4. Client fills the form / `POST /api/addresses`.

Rate limits live on the Nest **route** (in-memory throttler), not in shared. Also set a **daily quota** in Google Cloud.

## Related

- [../README.md](../README.md)  
- [../../modules/address/README.md](../../modules/address/README.md)  
- [../../shared-services.md](../../shared-services.md)
