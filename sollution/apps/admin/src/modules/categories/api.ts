import { ApiError } from '@/api/OrderBooking/client';
import { categoriesApi } from '@/api/OrderBooking/modules/categories';
import type { CategoryDto } from '@/api/OrderBooking/modules/categories';
import {
  PROTECTED_CATEGORY_SLUGS,
  type Category,
  type CategoryInput,
} from './types';

function mapCategory(dto: CategoryDto): Category {
  return {
    id: dto.id,
    slug: dto.slug,
    label: dto.label,
    label_arabic: dto.label_arabic,
    sortOrder: dto.sortOrder,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const rows = await categoriesApi.getAll();
  return rows
    .map(mapCategory)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

export async function fetchCategoryById(id: string): Promise<Category | null> {
  try {
    return mapCategory(await categoriesApi.getById(id));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function saveCategory(
  slug: string,
  input: CategoryInput,
  options: { isNew: boolean; id?: string },
): Promise<Category> {
  const payload = {
    slug: slug.trim().toLowerCase() || undefined,
    label: input.label.trim(),
    label_arabic: input.label_arabic.trim(),
    sortOrder: Number(input.sortOrder) || 0,
  };

  if (options.isNew) {
    return mapCategory(await categoriesApi.create(payload));
  }

  if (!options.id) throw new Error('Category id is required');
  return mapCategory(await categoriesApi.update(options.id, payload));
}

export async function deleteCategory(id: string, slug?: string): Promise<void> {
  if (slug && PROTECTED_CATEGORY_SLUGS.has(slug)) {
    throw new Error('PROTECTED_CATEGORY');
  }
  try {
    await categoriesApi.remove(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      const err = new Error('CATEGORY_IN_USE') as Error & { count?: number };
      const data = error.data as { message?: string; count?: number } | undefined;
      err.count = data?.count;
      throw err;
    }
    throw error;
  }
}
