# Feature: Google Maps (Geocoding + Places + web map)

**Nest:** server-side reverse geocoding and Places search so Geocoding/Places keys never ship in the app. English address lines.

**Web pin map:** separate **Maps JavaScript API** key on the Expo web client (`EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY`). Native pin map uses the Maps SDK (no this key).

Optional: omit `GOOGLE_MAPS_API_KEY` → Nest Maps routes return **503**. Omit `EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY` → web stand-in (search + GPS still work).

**Docs sync:** env, quotas, or consuming modules change → this file, [setup.md](./setup.md), and listed module docs ([maintenance.md](../../maintenance.md)).

## Architecture (white-label hybrid)

```text
@shared GoogleMapsService   → Nest API key + Geocoding / Places HTTP (no routes)
modules/address             → JWT, throttle, request DTOs
mobile PinMap.web           → Maps JavaScript API (separate browser key)
mobile PinMap.native        → Maps SDK (unlimited map loads; no web key)
```

Same Nest pattern as Firebase Admin (shared) + product modules for HTTP.

## Setup

→ **[setup.md](./setup.md)**

## Modules / services that use this feature

| Layer | Doc / code | Role |
|-------|------------|------|
| `@shared` `GoogleMapsService` | [`google-maps.service.ts`](../../../src/shared/services/google-maps.service.ts) · [shared-services](../../shared-services.md) | Vendor client (`language=en`) |
| Nest `address` | [modules/address](../../modules/address/README.md) | Product routes + throttle |
| Mobile web pin | `PinMap.web.tsx` · `EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY` | Dynamic map load (pan is free) |

## Flow (summary)

**Pin (map / GPS)**

1. Client has a pin (native Maps SDK, or web Maps JS / stand-in).  
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
