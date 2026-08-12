import type {
  SettingValueType,
  SettingVisibility,
} from '@database/entities/AppSetting.model';

/** Scalar or JSON-object setting values. */
export type SettingValue =
  | string
  | number
  | boolean
  | Record<string, unknown>;

/** @deprecated use SettingValue — kept for call-site clarity on scalars */
export type SettingPrimitive = string | number | boolean;

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

export type SettingCatalogEntry = {
  key: string;
  type: SettingValueType;
  visibility: SettingVisibility;
  default: SettingValue;
  /** Short admin label */
  label: string;
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

/**
 * Canonical white-label settings — DB rows are overrides only.
 * Related dial fields live in one `dial` JSON value so they stay in sync.
 */
export const SETTINGS_CATALOG: readonly SettingCatalogEntry[] = [
  {
    key: 'business_name',
    type: 'string',
    visibility: 'public',
    default: 'Sanam Grill',
    label: 'Business name',
  },
  {
    key: 'business_monogram',
    type: 'string',
    visibility: 'public',
    default: 'S',
    label: 'Monogram',
  },
  {
    key: 'currency_code',
    type: 'string',
    visibility: 'public',
    default: 'aed',
    label: 'Currency code (ISO, lowercase)',
  },
  {
    key: 'currency_display',
    type: 'string',
    visibility: 'public',
    default: 'AED',
    label: 'Currency display label',
  },
  {
    key: 'vat_rate',
    type: 'number',
    visibility: 'public',
    default: 0.05,
    label: 'VAT rate',
  },
  {
    key: 'dial',
    type: 'json',
    visibility: 'public',
    default: { ...DEFAULT_DIAL },
    label: 'Phone dial (code, region, flag)',
  },
  {
    key: 'order_prefix',
    type: 'string',
    visibility: 'public',
    default: 'S',
    label: 'Order code prefix',
  },
  {
    key: 'timezone',
    type: 'string',
    visibility: 'public',
    default: 'Asia/Dubai',
    label: 'Timezone',
  },
  {
    key: 'store_status',
    type: 'json',
    visibility: 'public',
    default: { ...DEFAULT_STORE_STATUS },
    label: 'Store availability',
  },
] as const;

export const SETTINGS_CATALOG_BY_KEY: ReadonlyMap<
  string,
  SettingCatalogEntry
> = new Map(SETTINGS_CATALOG.map((entry) => [entry.key, entry]));

export function isDialSetting(value: unknown): value is DialSetting {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const o = value as Record<string, unknown>;
  return (
    typeof o.code === 'string' &&
    o.code.trim() !== '' &&
    typeof o.region === 'string' &&
    o.region.trim() !== '' &&
    typeof o.flag === 'string' &&
    o.flag.trim() !== ''
  );
}

export function normalizeDial(value: unknown): DialSetting | null {
  if (!isDialSetting(value)) {
    return null;
  }
  return {
    code: value.code.trim(),
    region: value.region.trim(),
    flag: value.flag.trim(),
  };
}

export function isStoreStatusSetting(
  value: unknown,
): value is StoreStatusSetting {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const o = value as Record<string, unknown>;
  return (
    typeof o.isAvailable === 'boolean' &&
    typeof o.closedMessage === 'string' &&
    typeof o.closedMessageArabic === 'string'
  );
}

export function normalizeStoreStatus(
  value: unknown,
): StoreStatusSetting | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const o = value as Record<string, unknown>;
  if (typeof o.isAvailable !== 'boolean') {
    return null;
  }
  if (o.isAvailable) {
    return {
      isAvailable: true,
      closedMessage: '',
      closedMessageArabic: '',
    };
  }
  const closedMessage =
    typeof o.closedMessage === 'string' ? o.closedMessage.trim() : '';
  const closedMessageArabic =
    typeof o.closedMessageArabic === 'string'
      ? o.closedMessageArabic.trim()
      : '';
  return {
    isAvailable: false,
    closedMessage,
    closedMessageArabic,
  };
}

/** Stricter for writes: closed store requires both messages. */
export function coerceStoreStatusUpdate(
  value: unknown,
): StoreStatusSetting | null {
  const normalized = normalizeStoreStatus(value);
  if (!normalized) return null;
  if (
    !normalized.isAvailable &&
    (!normalized.closedMessage || !normalized.closedMessageArabic)
  ) {
    return null;
  }
  return normalized;
}

export function parseSettingValue(
  raw: string | undefined | null,
  type: SettingValueType,
): SettingValue | null {
  if (raw === undefined || raw === null) {
    return null;
  }
  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }

  switch (type) {
    case 'string':
      return trimmed;
    case 'number': {
      const n = Number(trimmed);
      return Number.isFinite(n) ? n : null;
    }
    case 'boolean': {
      const lower = trimmed.toLowerCase();
      if (['1', 'true', 'yes', 'on'].includes(lower)) return true;
      if (['0', 'false', 'no', 'off'].includes(lower)) return false;
      return null;
    }
    case 'json': {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (
          typeof parsed === 'string' ||
          typeof parsed === 'number' ||
          typeof parsed === 'boolean'
        ) {
          return parsed;
        }
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
        return null;
      } catch {
        return null;
      }
    }
    default:
      return null;
  }
}

export function serializeSettingValue(
  value: SettingValue,
  type: SettingValueType,
): string {
  if (type === 'json') {
    return JSON.stringify(value);
  }
  if (type === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (type === 'number') {
    return String(value);
  }
  return String(value);
}

/** Validate raw update payload against catalog type (+ dial shape). */
export function coerceUpdateValue(
  key: string,
  raw: unknown,
  type: SettingValueType,
): SettingValue | null {
  if (type === 'json') {
    if (key === 'dial') {
      return normalizeDial(raw);
    }
    if (key === 'store_status') {
      return coerceStoreStatusUpdate(raw);
    }
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return raw as Record<string, unknown>;
    }
    if (typeof raw === 'string') {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (key === 'dial') {
          return normalizeDial(parsed);
        }
        if (key === 'store_status') {
          return coerceStoreStatusUpdate(parsed);
        }
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        return null;
      }
    }
    return null;
  }

  if (type === 'string' && typeof raw === 'string') {
    const t = raw.trim();
    return t === '' ? null : t;
  }
  if (type === 'number') {
    const n = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  if (type === 'boolean') {
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'string') {
      return parseSettingValue(raw, 'boolean');
    }
  }
  return null;
}
