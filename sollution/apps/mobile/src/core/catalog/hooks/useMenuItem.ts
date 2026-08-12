import { useProduct } from '@/api/OrderBooking/modules/products';
import { useCatalog } from '../CatalogProvider';
import type { MenuItem } from '../types';
import { type AppErrorCode, toAppError } from '@/lib/errors';

/**
 * Resolve a menu item from the in-memory catalog, falling back to a
 * single-product fetch (deep links / cold open on item screen).
 */
export const useMenuItem = (itemId: string) => {
  const {
    getItemById,
    isLoading: catalogLoading,
    errorCode: catalogError,
    error: catalogRawError,
  } = useCatalog();
  const cached = itemId ? getItemById(itemId) : undefined;

  const needsFetch = Boolean(itemId) && !cached && !catalogLoading;
  const productQuery = useProduct(itemId, needsFetch);

  let item: MenuItem | null = cached ?? productQuery.data ?? null;
  let isLoading = false;
  let errorCode: AppErrorCode | null = null;
  let error: unknown | null = null;

  if (!itemId) {
    item = null;
    errorCode = 'not_found';
  } else if (cached) {
    item = cached;
  } else if (catalogLoading) {
    isLoading = true;
  } else if (catalogError && catalogError !== 'empty') {
    errorCode = catalogError;
    error = catalogRawError;
    item = null;
  } else if (productQuery.isLoading) {
    isLoading = true;
  } else if (productQuery.error) {
    errorCode = toAppError(productQuery.error).code;
    error = productQuery.error;
    item = null;
  } else if (!productQuery.data) {
    errorCode = 'not_found';
    item = null;
  }

  return { item, isLoading, errorCode, error };
};
