# Google Maps — setup (white-label)

One deploy = one Google Cloud project (same pattern as Stripe). Server key only — never `EXPO_PUBLIC_*`.

## Prerequisites

1. Google Cloud project with billing  
2. Enable **Geocoding API** and **Places API** (legacy Place Autocomplete + Details)  
3. Create an API key  
4. Restrict the key to **IP addresses** of this Nest host (and those two APIs only)  
5. Set a **budget alert** and an optional **daily quota** on Geocoding and Places

## Backend env (`apps/backend/.env`)

```bash
GOOGLE_MAPS_API_KEY=AIza...
```

Without the key, Maps routes return **503**. Nest still starts (`GoogleMapsService.isConfigured()` is false).

## API

Owned by the **`address`** module (calls shared `GoogleMapsService`):

| Method | Path | Auth | Body |
|--------|------|------|------|
| `POST` | `/api/addresses/reverse-geocode` | JWT | `{ "lat": 25.2365, "lng": 55.2784 }` |
| `POST` | `/api/addresses/place-autocomplete` | JWT | `{ "query": "satwa", "lat"?: 25.23, "lng"?: 55.27, "sessionToken"?: "…" }` |
| `POST` | `/api/addresses/place-details` | JWT | `{ "placeId": "ChIJ…", "sessionToken"?: "…" }` |

**Reverse geocode / place details response:** `{ line1, line2, area, city, formattedAddress, lat, lng }` (English).

**Autocomplete response:** `{ placeId, description, mainText, secondaryText }[]` (empty list if nothing matches).

Throttle per user (in-memory):

- Reverse geocode: **8 / minute**, **20 / hour**
- Places autocomplete + details: **30 / minute**, **80 / hour**

Pass the same `sessionToken` (UUID) on autocomplete then details so Google bills them as one session.

## Security

- Key stays on Nest (`GoogleMapsService`). Mobile never sees it.  
- JWT required on the product routes.  
- Nest throttle + Google Console quota. Redis not required on a single instance.

## Related

- [README.md](./README.md)  
- [modules/address](../../modules/address/README.md)  
- [shared-services.md](../../shared-services.md)
