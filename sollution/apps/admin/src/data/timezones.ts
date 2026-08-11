/**
 * IANA timezones for admin settings.
 * Prefers `Intl.supportedValuesOf('timeZone')` when available.
 */

const FALLBACK_TIMEZONES = [
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Qatar',
  'Asia/Kuwait',
  'Asia/Bahrain',
  'Asia/Muscat',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Colombo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Singapore',
  'Asia/Kuala_Lumpur',
  'Asia/Jakarta',
  'Asia/Bangkok',
  'Asia/Manila',
  'Asia/Ho_Chi_Minh',
  'Asia/Jerusalem',
  'Asia/Amman',
  'Asia/Beirut',
  'Asia/Baghdad',
  'Europe/London',
  'Europe/Dublin',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Amsterdam',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Stockholm',
  'Europe/Moscow',
  'Europe/Istanbul',
  'Africa/Cairo',
  'Africa/Casablanca',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Africa/Johannesburg',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'America/Mexico_City',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
  'UTC',
] as const

export type TimezoneOption = {
  value: string
  label: string
  description?: string
  searchText: string
}

function listIanaZones(): string[] {
  try {
    const intlWithZones = Intl as typeof Intl & {
      supportedValuesOf?: (key: string) => string[]
    }
    if (typeof intlWithZones.supportedValuesOf === 'function') {
      return intlWithZones.supportedValuesOf('timeZone')
    }
  } catch {
    // ignore — use fallback
  }
  return [...FALLBACK_TIMEZONES]
}

function offsetLabel(timeZone: string, now = new Date()): string | undefined {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
    }).formatToParts(now)
    return parts.find((p) => p.type === 'timeZoneName')?.value
  } catch {
    return undefined
  }
}

export function getTimezoneOptions(): TimezoneOption[] {
  const now = new Date()
  return listIanaZones()
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .map((value) => {
      const label = value.replace(/_/g, ' ')
      const offset = offsetLabel(value, now)
      return {
        value,
        label,
        description: offset,
        searchText: `${value} ${label} ${offset ?? ''}`,
      }
    })
}
