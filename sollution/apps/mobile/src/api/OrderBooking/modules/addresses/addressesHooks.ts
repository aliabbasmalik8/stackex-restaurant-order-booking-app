import { useQuery } from '@tanstack/react-query';
import { addressesApi } from './addresses';

export const ADDRESSES_QUERY_KEY = ['addresses'] as const;

export function useAddresses(enabled: boolean = true) {
  return useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: () => addressesApi.list(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
