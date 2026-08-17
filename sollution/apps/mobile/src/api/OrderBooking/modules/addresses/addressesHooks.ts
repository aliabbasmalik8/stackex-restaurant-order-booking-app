import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressesApi } from './addresses';
import type {
  CreateAddressRequest,
  PlaceAutocompleteRequest,
  PlaceDetailsRequest,
  ReverseGeocodeRequest,
  UpdateAddressRequest,
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

/** Typeahead suggestions (Nest + Google Places Autocomplete). */
export function usePlaceAutocomplete() {
  return useMutation({
    mutationFn: (body: PlaceAutocompleteRequest) =>
      addressesApi.placeAutocomplete(body),
  });
}

/** Chosen suggestion → pin + street fields (Nest + Google Place Details). */
export function usePlaceDetails() {
  return useMutation({
    mutationFn: (body: PlaceDetailsRequest) => addressesApi.placeDetails(body),
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

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateAddressRequest;
    }) => addressesApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}
