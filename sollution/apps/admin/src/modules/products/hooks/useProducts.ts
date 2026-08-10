import { useCallback, useMemo, useState } from 'react';
import { useCategories } from '@/api/OrderBooking/modules/categories';
import { useProductsManage } from '@/api/OrderBooking/modules/products';
import { mapCategory, mapProduct } from '../api';
import type { MenuCategory, Product } from '../types';

type UseProductsResult = {
  products: Product[];
  filtered: Product[];
  categories: MenuCategory[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  refresh: () => Promise<void>;
};

export function useProducts(): UseProductsResult {
  const productsQuery = useProductsManage();
  const categoriesQuery = useCategories();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');

  const products = useMemo(
    () =>
      (productsQuery.data ?? [])
        .map(mapProduct)
        .sort(
          (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
        ),
    [productsQuery.data],
  );

  const categories = useMemo(
    () =>
      (categoriesQuery.data ?? [])
        .map(mapCategory)
        .sort(
          (a, b) =>
            (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
            a.label.localeCompare(b.label),
        ),
    [categoriesQuery.data],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryId !== 'all' && p.categoryId !== categoryId) return false;
      if (!q) return true;
      return [p.name, p.name_arabic, p.slug, p.id, p.badge]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [products, search, categoryId]);

  const refresh = useCallback(async () => {
    await Promise.all([productsQuery.refetch(), categoriesQuery.refetch()]);
  }, [productsQuery, categoriesQuery]);

  const error =
    productsQuery.error instanceof Error
      ? productsQuery.error.message
      : categoriesQuery.error instanceof Error
        ? categoriesQuery.error.message
        : null;

  return {
    products,
    filtered,
    categories,
    loading: productsQuery.isLoading || categoriesQuery.isLoading,
    error,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    refresh,
  };
}
