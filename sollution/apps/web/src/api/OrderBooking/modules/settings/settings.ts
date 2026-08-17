import { orderBookingApiClient } from '@/api/OrderBooking/client'
import type { SettingValue } from '@/core/settings/catalog'

export type PublicSettingsDto = Record<string, SettingValue>

export const settingsApi = {
  getPublic: (): Promise<PublicSettingsDto> =>
    orderBookingApiClient.get<PublicSettingsDto>('/settings/public', {
      skipAuth: true,
    }),
}
