# Google Maps — setup (white-label)

One deploy = one Google Cloud project (same pattern as Stripe). **Two Google keys** — Nest (IP) vs browser Maps JS (HTTP referrers). Do not reuse the Nest key in the browser. Mobile and admin can share the Maps JS key.

| Key | Where | APIs | Restriction |
|-----|--------|------|-------------|
| `GOOGLE_MAPS_API_KEY` | Nest `apps/backend/.env` | Geocoding + Places (legacy Autocomplete + Details) | **IP** of the Nest host |
| `EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY` | Mobile `apps/mobile/.env` (web pin map only) | **Maps JavaScript API** only | **HTTP referrers** (e.g. `http://localhost:8081/*`) |
| `VITE_GOOGLE_MAPS_WEB_KEY` | Admin `apps/admin/.env` (branch pin editor) | **Maps JavaScript API** only | **HTTP referrers** (e.g. `http://localhost:5173/*`) |

The web keys are public (bundled). Never put the Nest key in `EXPO_PUBLIC_*` or `VITE_*`. Mobile and admin may share **one** Maps JS key if both origins are on that key’s referrer list.

## Prerequisites

1. Google Cloud project with billing  
2. Enable **Geocoding API**, **Places API** (legacy Place Autocomplete + Details), and **Maps JavaScript API**  
3. Create **two** API keys (Nest IP key + one Maps JS key for mobile web and/or admin)  
4. Set a **budget alert** and optional **daily quotas** (Geocoding, Places, Dynamic Maps)

## Backend env (`apps/backend/.env`)

```bash
GOOGLE_MAPS_API_KEY=AIza...
```

Without the key, Maps HTTP routes return **503**. Nest still starts (`GoogleMapsService.isConfigured()` is false).

## Mobile web env (`apps/mobile/.env`)

```bash
EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY=AIza...
```

Without this key, web shows the stand-in (search + GPS still work). Native maps do not use this key (Maps SDK).

Restart Expo after changing it (`expo start`).

## Admin env (`apps/admin/.env`)

```bash
VITE_GOOGLE_MAPS_WEB_KEY=AIza...
```

Loaded **only** when an operator opens **Branches → location → Edit pin on map**. List / hub do not create a map. Without this key, admin keeps lat/lng number fields.

Restart Vite after changing it (`pnpm dev`).

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

Web map loads are **Dynamic Maps** (client JS) — not these Nest routes. Pan / zoom is not an extra load.

## Security

- Nest key stays on the server (`GoogleMapsService`).  
- Web map keys are browser-visible; restrict by referrer + Maps JavaScript API only.  
- JWT required on the product HTTP routes.  
- Nest throttle + Google Console quota.

## Related

- [README.md](./README.md)  
- [modules/address](../../modules/address/README.md)  
- [shared-services.md](../../shared-services.md)
