import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchBranches, fetchMenuCategories, fetchMenuItems } from './api';
import type { Branch, MenuCategory, MenuItem } from './types';
import { type AppErrorCode, toAppError } from '@/lib/errors';

type CatalogState = {
  branches: Branch[];
  categories: MenuCategory[];
  items: MenuItem[];
  primaryBranch: Branch | null;
  isLoading: boolean;
  errorCode: AppErrorCode | null;
  refetch: () => Promise<void>;
  getItemById: (id: string) => MenuItem | undefined;
};

const CatalogContext = createContext<CatalogState | undefined>(undefined);

export const CatalogProvider = ({ children }: { children: ReactNode }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<AppErrorCode | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorCode(null);
    try {
      const nextBranches = await fetchBranches();
      const primary = nextBranches[0] ?? null;
      const [nextCategories, nextItems] = await Promise.all([
        fetchMenuCategories(),
        fetchMenuItems(primary?.id),
      ]);
      setBranches(nextBranches);
      setCategories(nextCategories);
      setItems(nextItems);
      if (nextItems.length === 0 && nextCategories.length === 0) {
        setErrorCode('empty');
      }
    } catch (e) {
      const appError = toAppError(e);
      setErrorCode(appError.code);
      setBranches([]);
      setCategories([]);
      setItems([]);
      console.error('[catalog]', appError.code, appError.cause ?? e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const primaryBranch = branches[0] ?? null;

  const getItemById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items],
  );

  const value = useMemo(
    () => ({
      branches,
      categories,
      items,
      primaryBranch,
      isLoading,
      errorCode,
      refetch: load,
      getItemById,
    }),
    [
      branches,
      categories,
      items,
      primaryBranch,
      isLoading,
      errorCode,
      load,
      getItemById,
    ],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error('useCatalog must be used within CatalogProvider');
  }
  return ctx;
};
