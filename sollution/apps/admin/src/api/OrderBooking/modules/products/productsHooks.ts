import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi } from './products';
import type { UpsertProductDto } from './products.types';

export const PRODUCTS_QUERY_KEY = ['products'] as const;

export function useProductsManage(enabled = true) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, 'manage'] as const,
    queryFn: () => productsApi.getManage(),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, id] as const,
    queryFn: () => productsApi.getById(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertProductDto) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpsertProductDto }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
}
