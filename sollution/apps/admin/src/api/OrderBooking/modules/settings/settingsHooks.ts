import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from './settings';
import type { SettingValue } from './settings.types';

export const SETTINGS_QUERY_KEY = ['settings'] as const;

export function useSettingsList() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => settingsApi.listAll(),
    staleTime: 60 * 1000,
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: SettingValue }) =>
      settingsApi.update(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
}
