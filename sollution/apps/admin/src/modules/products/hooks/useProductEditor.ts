import { getErrorMessage } from '@/lib/getErrorMessage';
import { useTranslation } from 'react-i18next';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useCategories } from '@/api/OrderBooking/modules/categories';
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from '@/api/OrderBooking/modules/products';
import { mapCategory, mapProduct, slugifyProductId, toUpsertPayload } from '../api';
import { emptyProduct } from '../types';
import type { MenuCategory, Product, ProductInput } from '../types';

type UseProductEditorResult = {
  form: ProductInput;
  setForm: Dispatch<SetStateAction<ProductInput>>;
  productId: string;
  slug: string;
  setSlug: (slug: string) => void;
  isNew: boolean;
  categories: MenuCategory[];
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
  const { t } = useTranslation();
  const isNew = idParam === 'new';
  const [form, setForm] = useState<ProductInput>(emptyProduct());
  const [productId, setProductId] = useState(isNew ? '' : idParam);
  const [slug, setSlug] = useState('');
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categoriesQuery = useCategories();
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

  const hydrated = hydratedFor === idParam;

  useEffect(() => {
    if (hydratedFor === idParam) return;
    if (categoriesQuery.isLoading) return;
    if (!isNew && productQuery.isLoading) return;

    if (isNew) {
      if (!categoriesQuery.data) return;
      setForm({
        ...emptyProduct(),
        categoryId: categories[0]?.id ?? '',
        sortOrder: 0,
      });
      setProductId('');
      setSlug('');
      setError(null);
      setHydratedFor(idParam);
      return;
    }

    if (productQuery.error) {
      setError(getErrorMessage(productQuery.error, t('errors.loadFailed')));
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
      setError(t('errors.notFound'));
      setHydratedFor(idParam);
    }
  }, [
    idParam,
    hydratedFor,
    isNew,
    categories,
    categoriesQuery.isLoading,
    categoriesQuery.data,
    productQuery.isLoading,
    productQuery.isFetching,
    productQuery.data,
    productQuery.error,
    t,
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
        setError(t('errors.productIdRequired'));
        return null;
      }
      if (!form.name.trim()) {
        setError(t('errors.nameRequired'));
        return null;
      }
      if (!form.categoryId.trim()) {
        setError(t('errors.categoryRequired'));
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
      setError(getErrorMessage(err, t('errors.saveFailed')));
      return null;
    }
  }, [createMutation, form, isNew, productId, slug, t, updateMutation]);

  const loading =
    !hydrated ||
    categoriesQuery.isLoading ||
    (!isNew && productQuery.isLoading);

  return {
    form,
    setForm,
    productId,
    slug,
    setSlug,
    isNew,
    categories,
    loading,
    saving,
    error,
    save,
    patch,
  };
}
