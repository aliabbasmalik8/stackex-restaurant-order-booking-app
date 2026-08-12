import { SettingDbService } from '@database/services/setting-db.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { OrderBookingException } from '@utils/order-booking.exception';
import { PublicSettingsDto, SettingItemDto } from './setting.dto';
import {
  SETTINGS_CATALOG,
  SETTINGS_CATALOG_BY_KEY,
  coerceUpdateValue,
  normalizeDial,
  normalizeStoreStatus,
  parseSettingValue,
  serializeSettingValue,
  type SettingValue,
} from './settings.catalog';

@Injectable()
export class SettingService {
  constructor(private readonly settingDb: SettingDbService) {}

  async getPublic(): Promise<PublicSettingsDto> {
    const map = await this.resolveMap('public');
    return Object.fromEntries(map);
  }

  async listAll(): Promise<SettingItemDto[]> {
    return this.resolveItems('all');
  }

  async getValue<T extends SettingValue>(
    key: string,
    fallback?: T,
  ): Promise<T> {
    if (!SETTINGS_CATALOG_BY_KEY.has(key)) {
      if (fallback !== undefined) return fallback;
      throw new OrderBookingException({
        error_detail: `Unknown setting key: ${key}`,
        user_error_detail: {
          english: 'This setting was not found.',
          arabic: 'لم يتم العثور على هذا الإعداد.',
        },
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const map = await this.resolveMap('all');
    const value = map.get(key);
    if (value === undefined) {
      if (fallback !== undefined) return fallback;
      throw new OrderBookingException({
        error_detail: `Setting not resolved: ${key}`,
        user_error_detail: {
          english: 'This setting could not be loaded.',
          arabic: 'تعذر تحميل هذا الإعداد.',
        },
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return value as T;
  }

  async update(key: string, rawValue: unknown): Promise<SettingItemDto> {
    const entry = SETTINGS_CATALOG_BY_KEY.get(key);
    if (!entry) {
      throw new OrderBookingException({
        error_detail: `Unknown setting key on update: ${key}`,
        user_error_detail: {
          english: 'This setting was not found.',
          arabic: 'لم يتم العثور على هذا الإعداد.',
        },
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    let payload = rawValue;
    if (
      entry.type === 'json' &&
      rawValue &&
      typeof rawValue === 'object' &&
      !Array.isArray(rawValue)
    ) {
      const current = await this.getValue<Record<string, unknown>>(key);
      payload = { ...current, ...(rawValue as Record<string, unknown>) };
    }

    const coerced = coerceUpdateValue(key, payload, entry.type);
    if (coerced === null) {
      const shapeHint =
        key === 'dial'
          ? ' object { code, region, flag }'
          : key === 'store_status'
            ? ' object { isAvailable, closedMessage, closedMessageArabic } (both messages required when closed)'
            : '';
      throw new OrderBookingException({
        error_detail: `Invalid value for ${key}; expected ${entry.type}${shapeHint}.`,
        user_error_detail: {
          english: 'The value you entered is not valid for this setting.',
          arabic: 'القيمة التي أدخلتها غير صالحة لهذا الإعداد.',
        },
      });
    }

    return this.persist(key, coerced);
  }

  private async persist(
    key: string,
    value: SettingValue,
  ): Promise<SettingItemDto> {
    const entry = SETTINGS_CATALOG_BY_KEY.get(key)!;
    const stored = serializeSettingValue(value, entry.type);
    await this.settingDb.upsertOverride(key, stored);

    return {
      key: entry.key,
      value,
      valueType: entry.type,
      visibility: entry.visibility,
      label: entry.label,
      defaultValue: entry.default,
      isOverride: true,
    };
  }

  private async resolveItems(
    mode: 'public' | 'all',
  ): Promise<SettingItemDto[]> {
    const rows = await this.settingDb.listOverrides();
    const byKey = new Map(rows.map((r) => [r.key, r]));

    const catalog =
      mode === 'public'
        ? SETTINGS_CATALOG.filter((e) => e.visibility === 'public')
        : SETTINGS_CATALOG;

    return catalog.map((entry) => {
      const row = byKey.get(entry.key);
      const parsed = parseSettingValue(row?.value, entry.type);
      const value = this.resolveEffective(entry.key, entry.default, parsed);

      return {
        key: entry.key,
        value,
        valueType: entry.type,
        visibility: entry.visibility,
        label: entry.label,
        defaultValue: entry.default,
        isOverride: row !== undefined,
      };
    });
  }

  private resolveEffective(
    key: string,
    catalogDefault: SettingValue,
    parsed: SettingValue | null,
  ): SettingValue {
    if (key === 'dial') {
      return (
        normalizeDial(parsed) ??
        normalizeDial(catalogDefault) ??
        catalogDefault
      );
    }
    if (key === 'store_status') {
      return (
        normalizeStoreStatus(parsed) ??
        normalizeStoreStatus(catalogDefault) ??
        catalogDefault
      );
    }
    return parsed ?? catalogDefault;
  }

  private async resolveMap(
    mode: 'public' | 'all',
  ): Promise<Map<string, SettingValue>> {
    const items = await this.resolveItems(mode);
    return new Map(items.map((i) => [i.key, i.value]));
  }
}
