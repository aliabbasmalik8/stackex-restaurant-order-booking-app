import type { DialSetting, SettingValue } from './catalog';
import {
  DEFAULT_DIAL,
  SETTINGS_CATALOG,
  SETTINGS_CATALOG_DEFAULTS,
} from './catalog';

export type ResolvedAppSettings = {
  businessName: string;
  businessMonogram: string;
  currencyCode: string;
  currencyDisplay: string;
  vatRate: number;
  dial: DialSetting;
  orderPrefix: string;
  timezone: string;
  /** Raw key → value map (catalog keys). */
  raw: Record<string, SettingValue>;
};

function asString(value: SettingValue | undefined, fallback: string): string {
  return typeof value === 'string' && value.trim() !== ''
    ? value.trim()
    : fallback;
}

function asNumber(value: SettingValue | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asDial(value: SettingValue | undefined): DialSetting {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ...DEFAULT_DIAL };
  }
  const o = value as Record<string, unknown>;
  const code = typeof o.code === 'string' ? o.code.trim() : '';
  const region = typeof o.region === 'string' ? o.region.trim() : '';
  const flag = typeof o.flag === 'string' ? o.flag.trim() : '';
  if (!code || !region || !flag) return { ...DEFAULT_DIAL };
  return { code, region, flag };
}

/** Merge API/cache overrides onto frontend catalog defaults. */
export function resolveAppSettings(
  overrides: Record<string, SettingValue> | null | undefined,
): ResolvedAppSettings {
  const raw: Record<string, SettingValue> = { ...SETTINGS_CATALOG_DEFAULTS };
  if (overrides) {
    for (const entry of SETTINGS_CATALOG) {
      if (overrides[entry.key] !== undefined) {
        raw[entry.key] = overrides[entry.key]!;
      }
    }
  }

  const dial = asDial(raw.dial);
  return {
    businessName: asString(raw.business_name, 'Sanam Grill'),
    businessMonogram: asString(raw.business_monogram, 'S'),
    currencyCode: asString(raw.currency_code, 'aed').toLowerCase(),
    currencyDisplay: asString(raw.currency_display, 'AED'),
    vatRate: asNumber(raw.vat_rate, 0.05),
    dial,
    orderPrefix: asString(raw.order_prefix, 'S'),
    timezone: asString(raw.timezone, 'Asia/Dubai'),
    raw,
  };
}
