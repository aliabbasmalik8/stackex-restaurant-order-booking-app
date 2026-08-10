import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {
  useCategory,
  useCreateCategory,
  useUpdateCategory,
} from '@/api/OrderBooking/modules/categories';
import { emptyCategory, slugifyCategoryId } from '../types';
import type { Category, CategoryInput } from '../types';

type UseCategoryEditorResult = {
  form: CategoryInput;
  setForm: Dispatch<SetStateAction<CategoryInput>>;
  categoryId: string;
  slug: string;
  setSlug: (slug: string) => void;
  isNew: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  save: () => Promise<Category | null>;
  patch: <K extends keyof CategoryInput>(
    key: K,
    value: CategoryInput[K],
  ) => void;
};

export function useCategoryEditor(idParam: string): UseCategoryEditorResult {
  const isNew = idParam === 'new';
  const [form, setForm] = useState<CategoryInput>(emptyCategory());
  const [categoryId, setCategoryId] = useState(isNew ? '' : idParam);
  const [slug, setSlug] = useState('');
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categoryQuery = useCategory(idParam, !isNew);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const hydrated = hydratedFor === idParam;

  useEffect(() => {
    if (hydratedFor === idParam) return;

    if (isNew) {
      setForm(emptyCategory());
      setCategoryId('');
      setSlug('');
      setError(null);
      setHydratedFor(idParam);
      return;
    }

    if (categoryQuery.isLoading) return;

    if (categoryQuery.error) {
      setError(
        categoryQuery.error instanceof Error
          ? categoryQuery.error.message
          : 'Failed to load',
      );
      setHydratedFor(idParam);
      return;
    }

    if (categoryQuery.data) {
      const cat = categoryQuery.data;
      setForm({
        label: cat.label,
        label_arabic: cat.label_arabic,
        sortOrder: cat.sortOrder,
      });
      setCategoryId(cat.id);
      setSlug(cat.slug);
      setError(null);
      setHydratedFor(idParam);
      return;
    }

    if (!categoryQuery.isFetching) {
      setError('Category not found');
      setHydratedFor(idParam);
    }
  }, [
    idParam,
    hydratedFor,
    isNew,
    categoryQuery.isLoading,
    categoryQuery.isFetching,
    categoryQuery.data,
    categoryQuery.error,
  ]);

  const patch = useCallback(
    <K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const saving = createMutation.isPending || updateMutation.isPending;

  const save = useCallback(async () => {
    setError(null);
    try {
      const nextSlug = (isNew ? slug || slugifyCategoryId(form.label) : slug)
        .trim()
        .toLowerCase();
      if (!nextSlug) {
        setError('Category id is required');
        return null;
      }
      if (!form.label.trim()) {
        setError('Label is required');
        return null;
      }

      const payload = {
        slug: nextSlug,
        label: form.label.trim(),
        label_arabic: form.label_arabic.trim(),
        sortOrder: Number(form.sortOrder) || 0,
      };

      const saved = isNew
        ? await createMutation.mutateAsync(payload)
        : await updateMutation.mutateAsync({ id: categoryId, data: payload });

      setCategoryId(saved.id);
      setSlug(saved.slug);
      return {
        id: saved.id,
        slug: saved.slug,
        label: saved.label,
        label_arabic: saved.label_arabic,
        sortOrder: saved.sortOrder,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      return null;
    }
  }, [categoryId, createMutation, form, isNew, slug, updateMutation]);

  return {
    form,
    setForm,
    categoryId,
    slug,
    setSlug,
    isNew,
    loading: !hydrated || (!isNew && categoryQuery.isLoading),
    saving,
    error,
    save,
    patch,
  };
}
