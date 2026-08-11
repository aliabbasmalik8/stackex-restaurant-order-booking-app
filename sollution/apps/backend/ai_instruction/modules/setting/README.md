# Module: `setting`

**Code:** [`src/modules/setting/`](../../../src/modules/setting/)

## What it’s for

**Primary white-label control plane** for business configuration: catalog defaults + `app_setting` overrides.  
Public bootstrap for mobile; admin list/PATCH for overrides.

Use this module whenever a value could be managed from admin **without** shipping new code (currency, dial, VAT, names, timezone, prefixes, future ops knobs). Other Nest modules should **consume** settings — not duplicate constants.

Secrets (Stripe, JWT) are **not** stored here — env only.

See also: [architecture — white-label](../../architecture.md#white-label--admin-managed-config) · [ai_instruction README](../../README.md#white-label-first-mandatory).

## Routes

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/settings/public` | public |
| `GET` | `/api/settings` | super-admin |
| `PATCH` | `/api/settings/:key` | super-admin |

## Files

| File | Role |
|------|------|
| `setting.module.ts` | Nest module |
| `setting.controller.ts` | Routes |
| `setting.service.ts` | Resolve / update |
| `setting.dto.ts` | DTOs |
| `settings.catalog.ts` | Defaults, types, visibility, dial JSON |

## Depends on

- `SharedModule` (admin guards)
- Entity `AppSetting`

## Exports

- `SettingService` — other modules call `getValue(key)`

## Product features that consume this module

| Feature | What it reads |
|---------|----------------|
| [Stripe](../../features/stripe/README.md) | `currency_code`, `currency_display`, `business_name`, `business_monogram` |

## Setup notes

```sql
CREATE TABLE IF NOT EXISTS app_setting (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar NOT NULL UNIQUE,
  value text NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

No rows required — catalog defaults apply until overridden. JSON groups (e.g. `dial`) update as one value (PATCH merges partial objects).
