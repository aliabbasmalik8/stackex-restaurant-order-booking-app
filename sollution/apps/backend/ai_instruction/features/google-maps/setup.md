# Google Maps — setup (white-label)

One deploy = one Google Cloud project (same pattern as Stripe). Server key only — never `EXPO_PUBLIC_*`.

## Prerequisites

1. Google Cloud project with billing  
2. Enable **Geocoding API**  
3. Create an API key  
4. Restrict the key to **IP addresses** of this Nest host (and Geocoding API only)  
5. Set a **budget alert** and an optional **daily quota** on Geocoding

## Backend env (`apps/backend/.env`)

```bash
GOOGLE_MAPS_API_KEY=AIza...
```

Without the key, reverse geocode returns **503**. Nest still starts (`GoogleMapsService.isConfigured()` is false).

## API

Owned by the **`address`** module (calls shared `GoogleMapsService`):

| Method | Path | Auth | Body |
|--------|------|------|------|
| `POST` | `/api/addresses/reverse-geocode` | JWT | `{ "lat": 25.2365, "lng": 55.2784 }` |

**Response:** `{ line1, line2, area, city, formattedAddress, lat, lng }` (English).

Throttle: **8 / minute** and **20 / hour** per user (in-memory on that route only).

## Security

- Key stays on Nest (`GoogleMapsService`). Mobile never sees it.  
- JWT required on the product route.  
- Nest throttle + Google Console quota. Redis not required on a single instance.

## Related

- [README.md](./README.md)  
- [modules/address](../../modules/address/README.md)  
- [shared-services.md](../../shared-services.md)
