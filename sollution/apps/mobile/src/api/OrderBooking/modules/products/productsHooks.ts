import { useQuery } from '@tanstack/react-query';
import { productsApi } from './products';

export const PRODUCTS_QUERY_KEY = ['products'] as const;

export function productsQueryKey(branchId?: string) {
  return [...PRODUCTS_QUERY_KEY, branchId ?? 'all'] as const;
}

export function useProducts(branchId?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: productsQueryKey(branchId),
    queryFn: () => productsApi.getAll(branchId),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, 'detail', id] as const,
    queryFn: () => productsApi.getById(id),
    enabled: enabled && Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}
