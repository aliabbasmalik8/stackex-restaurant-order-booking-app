import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type { SettingValue } from '@/core/settings/catalog';

/** Public settings object — catalog keys → resolved values. */
export type PublicSettingsDto = Record<string, SettingValue>;

export const settingsApi = {
  getPublic: (): Promise<PublicSettingsDto> =>
    orderBookingApiClient.get<PublicSettingsDto>('/settings/public', {
      skipAuth: true,
    }),
};
