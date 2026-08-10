import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useBranches } from '@/api/OrderBooking/modules/branches';
import { useCategories } from '@/api/OrderBooking/modules/categories';
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from '@/api/OrderBooking/modules/products';
import {
  mapBranch,
  mapCategory,
  mapProduct,
  slugifyProductId,
  toUpsertPayload,
} from '../api';
import { emptyProduct } from '../types';
import type { Branch, MenuCategory, Product, ProductInput } from '../types';

type UseProductEditorResult = {
  form: ProductInput;
  setForm: Dispatch<SetStateAction<ProductInput>>;
  productId: string;
  slug: string;
  setSlug: (slug: string) => void;
  isNew: boolean;
  categories: MenuCategory[];
  branches: Branch[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  save: () => Promise<Product | null>;
  patch: <K extends keyof ProductInput>(
    key: K,
    value: ProductInput[K],
  ) => void;
};

export function useProductEditor(idParam: string): UseProductEditorResult {
  const isNew = idParam === 'new';
  const [form, setForm] = useState<ProductInput>(emptyProduct());
  const [productId, setProductId] = useState(isNew ? '' : idParam);
  const [slug, setSlug] = useState('');
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categoriesQuery = useCategories();
  const branchesQuery = useBranches();
  const productQuery = useProduct(idParam, !isNew);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const categories = useMemo(
    () =>
      (categoriesQuery.data ?? [])
        .map(mapCategory)
        .filter((c) => c.slug !== 'all'),
    [categoriesQuery.data],
  );

  const branches = useMemo(
    () => (branchesQuery.data ?? []).map(mapBranch),
    [branchesQuery.data],
  );

  const hydrated = hydratedFor === idParam;

  useEffect(() => {
    if (hydratedFor === idParam) return;
    if (categoriesQuery.isLoading || branchesQuery.isLoading) return;
    if (!isNew && productQuery.isLoading) return;

    if (isNew) {
      if (!categoriesQuery.data || !branchesQuery.data) return;
      setForm({
        ...emptyProduct(),
        categoryId: categories[0]?.id ?? '',
        branchId: branches[0]?.id ?? '',
        sortOrder: 0,
      });
      setProductId('');
      setSlug('');
      setError(null);
      setHydratedFor(idParam);
      return;
    }

    if (productQuery.error) {
      setError(
        productQuery.error instanceof Error
          ? productQuery.error.message
          : 'Failed to load',
      );
      setHydratedFor(idParam);
      return;
    }

    if (productQuery.data) {
      const product = mapProduct(productQuery.data);
      const { id, slug: productSlug, ...rest } = product;
      setForm(rest);
      setProductId(id);
      setSlug(productSlug);
      setError(null);
      setHydratedFor(idParam);
      return;
    }

    if (!productQuery.isFetching) {
      setError('Product not found');
      setHydratedFor(idParam);
    }
  }, [
    idParam,
    hydratedFor,
    isNew,
    categories,
    branches,
    categoriesQuery.isLoading,
    categoriesQuery.data,
    branchesQuery.isLoading,
    branchesQuery.data,
    productQuery.isLoading,
    productQuery.isFetching,
    productQuery.data,
    productQuery.error,
  ]);

  const patch = useCallback(
    <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const saving = createMutation.isPending || updateMutation.isPending;

  const save = useCallback(async () => {
    setError(null);
    try {
      const nextSlug = (isNew ? slug || slugifyProductId(form.name) : slug)
        .trim()
        .toLowerCase();
      if (!nextSlug) {
        setError('Product id is required');
        return null;
      }
      if (!form.name.trim()) {
        setError('Name is required');
        return null;
      }
      if (!form.categoryId.trim()) {
        setError('Category is required');
        return null;
      }

      const payload = toUpsertPayload(form, nextSlug);
      const saved = isNew
        ? mapProduct(await createMutation.mutateAsync(payload))
        : mapProduct(
            await updateMutation.mutateAsync({
              id: productId,
              data: payload,
            }),
          );
      setProductId(saved.id);
      setSlug(saved.slug);
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      return null;
    }
  }, [createMutation, form, isNew, productId, slug, updateMutation]);

  const loading =
    !hydrated ||
    categoriesQuery.isLoading ||
    branchesQuery.isLoading ||
    (!isNew && productQuery.isLoading);

  return {
    form,
    setForm,
    productId,
    slug,
    setSlug,
    isNew,
    categories,
    branches,
    loading,
    saving,
    error,
    save,
    patch,
  };
}
