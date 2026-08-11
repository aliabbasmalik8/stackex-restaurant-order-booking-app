import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type { SettingItemDto, SettingValue } from './settings.types';

export const settingsApi = {
  listAll: (): Promise<SettingItemDto[]> =>
    orderBookingApiClient.get<SettingItemDto[]>('/settings'),

  update: (key: string, value: SettingValue): Promise<SettingItemDto> =>
    orderBookingApiClient.patch<SettingItemDto>(`/settings/${key}`, {
      value,
    }),
};
