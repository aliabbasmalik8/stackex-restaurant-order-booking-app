import { IsDefined } from 'class-validator';
import type {
  SettingValueType,
  SettingVisibility,
} from '@database/entities/AppSetting.model';
import type { SettingValue } from './settings.catalog';

/** Admin list item (resolved value). */
export class SettingItemDto {
  key!: string;
  value!: SettingValue;
  valueType!: SettingValueType;
  visibility!: SettingVisibility;
  label!: string;
  defaultValue!: SettingValue;
  isOverride!: boolean;
}

/** Public bootstrap: catalog key → resolved value (defaults already applied). */
export type PublicSettingsDto = Record<string, SettingValue>;

export class UpdateSettingDto {
  /** Scalar, full JSON group, or partial JSON merge for `type: json` keys. */
  @IsDefined()
  value!: string | number | boolean | Record<string, unknown>;
}
