import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressesApi } from './addresses';
import type {
  CreateAddressRequest,
  ReverseGeocodeRequest,
} from './addresses.types';

export const ADDRESSES_QUERY_KEY = ['addresses'] as const;

export function useAddresses(enabled: boolean = true) {
  return useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: () => addressesApi.list(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/** Confirm pin → English street fields (Nest + Google). */
export function useReverseGeocode() {
  return useMutation({
    mutationFn: (body: ReverseGeocodeRequest) =>
      addressesApi.reverseGeocode(body),
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateAddressRequest) => addressesApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressesApi.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}
