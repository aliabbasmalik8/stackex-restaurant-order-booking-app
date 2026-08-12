/**
 * Frontend settings catalog — defaults when API/cache unavailable.
 * Keys match backend `GET /api/settings/public` (catalog keys).
 */

export type DialSetting = {
  code: string;
  region: string;
  flag: string;
};

export type StoreStatusSetting = {
  isAvailable: boolean;
  closedMessage: string;
  closedMessageArabic: string;
};

export type SettingValue =
  | string
  | number
  | boolean
  | Record<string, unknown>;

export type SettingCatalogEntry = {
  key: string;
  default: SettingValue;
};

export const DEFAULT_DIAL: DialSetting = {
  code: '+971',
  region: 'AE',
  flag: '🇦🇪',
};

export const DEFAULT_STORE_STATUS: StoreStatusSetting = {
  isAvailable: true,
  closedMessage: '',
  closedMessageArabic: '',
};

/** Retry public settings fetch after a failure. */
export const SETTINGS_FETCH_RETRY_MS = 5 * 60 * 1000;

export const SETTINGS_CATALOG: readonly SettingCatalogEntry[] = [
  { key: 'business_name', default: 'Sanam Grill' },
  { key: 'business_monogram', default: 'S' },
  { key: 'currency_code', default: 'aed' },
  { key: 'currency_display', default: 'AED' },
  { key: 'vat_rate', default: 0.05 },
  { key: 'dial', default: { ...DEFAULT_DIAL } },
  { key: 'order_prefix', default: 'S' },
  { key: 'timezone', default: 'Asia/Dubai' },
  { key: 'store_status', default: { ...DEFAULT_STORE_STATUS } },
] as const;

export const SETTINGS_CATALOG_DEFAULTS: Record<string, SettingValue> =
  Object.fromEntries(SETTINGS_CATALOG.map((e) => [e.key, e.default]));
