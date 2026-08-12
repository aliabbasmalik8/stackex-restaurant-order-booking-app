export type SettingValueType = 'string' | 'number' | 'boolean' | 'json';
export type SettingVisibility = 'public' | 'private';

export type SettingValue =
  | string
  | number
  | boolean
  | Record<string, unknown>;

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

/** Admin list item from `GET /api/settings`. */
export type SettingItemDto = {
  key: string;
  value: SettingValue;
  valueType: SettingValueType;
  visibility: SettingVisibility;
  label: string;
  defaultValue: SettingValue;
  isOverride: boolean;
};

export type UpdateSettingDto = {
  value: SettingValue;
};
