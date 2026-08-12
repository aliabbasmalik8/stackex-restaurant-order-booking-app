/** Setting keys owned by each admin settings section. */
export const BUSINESS_SETTING_KEYS = [
  'business_name',
  'business_monogram',
  'order_prefix',
  'currency_code',
  'currency_display',
  'vat_rate',
  'dial',
] as const

export const OPERATIONS_SETTING_KEYS = [
  'timezone',
  'store_status',
] as const

export type BusinessSettingKey = (typeof BUSINESS_SETTING_KEYS)[number]
export type OperationsSettingKey = (typeof OPERATIONS_SETTING_KEYS)[number]
