import { useEffect, useState } from 'react';
import { fetchMenuItemById } from '../api';
import { useCatalog } from '../CatalogProvider';
import type { MenuItem } from '../types';
import { type AppErrorCode, toAppError } from '@/lib/errors';

/**
 * Resolve a menu item from the in-memory catalog, falling back to a
 * single-doc fetch (deep links / cold open on item screen).
 */
export const useMenuItem = (itemId: string) => {
  const {
    getItemById,
    isLoading: catalogLoading,
    errorCode: catalogError,
  } = useCatalog();
  const cached = itemId ? getItemById(itemId) : undefined;
  const [item, setItem] = useState<MenuItem | null>(cached ?? null);
  const [isLoading, setIsLoading] = useState(!cached && !!itemId);
  const [errorCode, setErrorCode] = useState<AppErrorCode | null>(null);

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      setIsLoading(false);
      setErrorCode('not_found');
      return;
    }

    const fromCache = getItemById(itemId);
    if (fromCache) {
      setItem(fromCache);
      setIsLoading(false);
      setErrorCode(null);
      return;
    }

    if (catalogLoading) {
      setIsLoading(true);
      return;
    }

    if (catalogError && catalogError !== 'empty') {
      setItem(null);
      setIsLoading(false);
      setErrorCode(catalogError);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    void fetchMenuItemById(itemId)
      .then((doc) => {
        if (cancelled) return;
        setItem(doc);
        setErrorCode(doc ? null : 'not_found');
      })
      .catch((e) => {
        if (cancelled) return;
        setErrorCode(toAppError(e).code);
        setItem(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [itemId, getItemById, catalogLoading, catalogError]);

  return { item, isLoading, errorCode };
};
