import { useCallback, useMemo, useState } from 'react';
import {
  useCategories as useCategoriesQuery,
  useDeleteCategory,
} from '@/api/OrderBooking/modules/categories';
import { useProductsManage } from '@/api/OrderBooking/modules/products';
import { ApiError } from '@/api/OrderBooking/client';
import { PROTECTED_CATEGORY_SLUGS, type Category } from '../types';

export type CategoryRow = Category & {
  productCount: number;
  protected: boolean;
};

type UseCategoriesResult = {
  categories: CategoryRow[];
  loading: boolean;
  error: string | null;
  deletingId: string | null;
  refresh: () => Promise<void>;
  remove: (id: string) => Promise<{ ok: true } | { ok: false; reason: string }>;
};

function mapCategory(row: {
  id: string;
  slug: string;
  label: string;
  label_arabic: string;
  sortOrder: number;
}): Category {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    label_arabic: row.label_arabic,
    sortOrder: row.sortOrder,
  };
}

export function useCategories(): UseCategoriesResult {
  const categoriesQuery = useCategoriesQuery();
  const productsQuery = useProductsManage();
  const deleteMutation = useDeleteCategory();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const productCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of productsQuery.data ?? []) {
      const key = product.categoryId;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [productsQuery.data]);

  const categories = useMemo<CategoryRow[]>(() => {
    const list = (categoriesQuery.data ?? []).map(mapCategory);
    return list
      .map((cat) => ({
        ...cat,
        productCount: productCounts.get(cat.id) ?? 0,
        protected: PROTECTED_CATEGORY_SLUGS.has(cat.slug),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
  }, [categoriesQuery.data, productCounts]);

  const refresh = useCallback(async () => {
    await Promise.all([
      categoriesQuery.refetch(),
      productsQuery.refetch(),
    ]);
  }, [categoriesQuery, productsQuery]);

  const remove = useCallback(
    async (id: string) => {
      const cat = categories.find((c) => c.id === id);
      if (cat?.protected) {
        return { ok: false as const, reason: 'PROTECTED' };
      }
      setDeletingId(id);
      try {
        await deleteMutation.mutateAsync(id);
        return { ok: true as const };
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          const data = err.data as { count?: number } | undefined;
          const count = data?.count;
          return {
            ok: false as const,
            reason: count ? `IN_USE:${count}` : 'IN_USE',
          };
        }
        if (
          err instanceof ApiError &&
          (err.status === 400 || err.message.includes('cannot be deleted'))
        ) {
          return { ok: false as const, reason: 'PROTECTED' };
        }
        const message =
          err instanceof Error ? err.message : 'Failed to delete category';
        if (message === 'PROTECTED_CATEGORY') {
          return { ok: false as const, reason: 'PROTECTED' };
        }
        if (message === 'CATEGORY_IN_USE') {
          return { ok: false as const, reason: 'IN_USE' };
        }
        return { ok: false as const, reason: message };
      } finally {
        setDeletingId(null);
      }
    },
    [categories, deleteMutation],
  );

  const loading = categoriesQuery.isLoading || productsQuery.isLoading;
  const error =
    categoriesQuery.error instanceof Error
      ? categoriesQuery.error.message
      : productsQuery.error instanceof Error
        ? productsQuery.error.message
        : null;

  return { categories, loading, error, deletingId, refresh, remove };
}
