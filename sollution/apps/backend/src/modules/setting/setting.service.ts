import { SettingDbService } from '@database/services/setting-db.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PublicSettingsDto, SettingItemDto } from './setting.dto';
import {
  SETTINGS_CATALOG,
  SETTINGS_CATALOG_BY_KEY,
  coerceUpdateValue,
  normalizeDial,
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
      throw new NotFoundException(`Unknown setting key: ${key}`);
    }

    const map = await this.resolveMap('all');
    const value = map.get(key);
    if (value === undefined) {
      if (fallback !== undefined) return fallback;
      throw new NotFoundException(`Setting not resolved: ${key}`);
    }
    return value as T;
  }

  async update(key: string, rawValue: unknown): Promise<SettingItemDto> {
    const entry = SETTINGS_CATALOG_BY_KEY.get(key);
    if (!entry) {
      throw new NotFoundException(`Unknown setting key: ${key}`);
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
      throw new BadRequestException(
        `Invalid value for ${key}; expected ${entry.type}${
          key === 'dial' ? ' object { code, region, flag }' : ''
        }.`,
      );
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
    return parsed ?? catalogDefault;
  }

  private async resolveMap(
    mode: 'public' | 'all',
  ): Promise<Map<string, SettingValue>> {
    const items = await this.resolveItems(mode);
    return new Map(items.map((i) => [i.key, i.value]));
  }
}
