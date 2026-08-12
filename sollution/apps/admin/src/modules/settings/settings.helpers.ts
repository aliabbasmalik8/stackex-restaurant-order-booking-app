import type {
  DialSetting,
  SettingItemDto,
  SettingValue,
  StoreStatusSetting,
} from '@/api/OrderBooking/modules/settings'

export function isDial(value: SettingValue | undefined): value is DialSetting {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const o = value as Record<string, unknown>
  return (
    typeof o.code === 'string' &&
    typeof o.region === 'string' &&
    typeof o.flag === 'string'
  )
}

export function isStoreStatus(
  value: SettingValue | undefined,
): value is StoreStatusSetting {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const o = value as Record<string, unknown>
  return (
    typeof o.isAvailable === 'boolean' &&
    typeof o.closedMessage === 'string' &&
    typeof o.closedMessageArabic === 'string'
  )
}

export function itemByKey(
  items: SettingItemDto[],
  key: string,
): SettingItemDto | undefined {
  return items.find((i) => i.key === key)
}

export function stringSetting(
  value: SettingValue | undefined,
): string {
  return typeof value === 'string' ? value : ''
}

export function numberSettingLabel(
  value: SettingValue | undefined,
): string {
  return typeof value === 'number' ? String(value) : '—'
}

export function displayValue(value: SettingValue | undefined): string {
  if (value === undefined || value === null) return '—'
  if (typeof value === 'string') return value.trim() || '—'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (isDial(value)) {
    return `${value.flag} ${value.code} (${value.region})`
  }
  if (isStoreStatus(value)) {
    return value.isAvailable ? 'Open' : 'Closed'
  }
  return '—'
}
