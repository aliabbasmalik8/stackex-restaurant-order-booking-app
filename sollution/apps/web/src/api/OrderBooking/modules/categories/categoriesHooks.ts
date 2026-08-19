import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from './categories'

export const CATEGORIES_QUERY_KEY = ['categories'] as const

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => categoriesApi.getAll(),
    staleTime: 5 * 60 * 1000,
  })
}
