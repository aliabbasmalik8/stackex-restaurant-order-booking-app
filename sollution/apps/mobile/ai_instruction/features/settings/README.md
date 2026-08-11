# Settings (public bootstrap)

Frontend catalog defaults + `GET /api/settings/public`, cached in AsyncStorage.

**Code:** `src/core/settings/` · API: `src/api/OrderBooking/modules/settings/`

## Load flow (app start)

```text
AppProvider (before splash hide)
  → bootstrapAppSettings()
       1. Read AsyncStorage cache
       2. If fresh (TTL) → merge onto frontend catalog defaults → memory
       3. Else fetch /api/settings/public → write cache (TTL) → memory
       4. On network fail → stale cache if any, else catalog defaults
  → SettingsProvider + rest of app
```

Default TTL: `SETTINGS_CACHE_TTL_MS` = **24h** (`catalog.ts`).

## Frontend catalog

`src/core/settings/catalog.ts` — same public keys as backend (`business_name`, `dial`, `vat_rate`, `currency_*`, …).  
Always the fallback when API/cache missing.

## Usage

```ts
import { useSettings, useBrand, getAppSettings } from '@/core/settings';

const { currencyDisplay, vatRate } = useSettings();
const { name, monogram, dialCode } = useBrand();
// Outside React (e.g. money.ts / CartContext): getAppSettings()
```

Do **not** hardcode business name / dial / VAT / currency in screens.

## Docs sync

Registry/catalog/TTL/API changes → update this file + [../architecture.md](../architecture.md) + [../maintenance.md](../maintenance.md).

Backend: [`../../../../backend/ai_instruction/modules/setting/`](../../../../backend/ai_instruction/modules/setting/README.md)
