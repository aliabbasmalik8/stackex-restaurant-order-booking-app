# Settings (public bootstrap)

Frontend catalog defaults + `GET /api/settings/public` on every app load. No AsyncStorage cache.

**Code:** `src/core/settings/` · API: `src/api/OrderBooking/modules/settings/`

## Load flow (app start)

```text
AppProvider (before splash hide)
  → bootstrapAppSettings()
       1. Fetch /api/settings/public → memory + notify listeners
       2. On network fail → catalog defaults + schedule retry
  → SettingsProvider (subscribes to store updates)
```

Retry interval: `SETTINGS_FETCH_RETRY_MS` = **5 min** (`catalog.ts`).  
On retry success, timer is cleared. On retry fail, schedules again.

## Frontend catalog

`src/core/settings/catalog.ts` — same public keys as backend (`business_name`, `dial`, `vat_rate`, `currency_*`, `store_status`, …).  
Always the fallback when the API is unreachable.

## Usage

```ts
import { useSettings, useBrand, useStoreAvailability, getAppSettings } from '@/core/settings';

const { currencyDisplay, vatRate } = useSettings();
const { name, monogram, dialCode } = useBrand();
const { isClosed, closedMessage } = useStoreAvailability();
// Outside React (e.g. money.ts / CartContext): getAppSettings()
```

Do **not** hardcode business name / dial / VAT / currency in screens.

## Docs sync

Registry/catalog/retry/API changes → update this file + [../architecture.md](../architecture.md) + [../maintenance.md](../maintenance.md).

Backend: [`../../../../backend/ai_instruction/modules/setting/`](../../../../backend/ai_instruction/modules/setting/README.md)
