import { ApiError } from '@/api/OrderBooking/client';
import { categoriesApi } from '@/api/OrderBooking/modules/categories';
import type { CategoryDto } from '@/api/OrderBooking/modules/categories';
import { productsApi } from '@/api/OrderBooking/modules/products';
import type {
  ProductDto,
  UpsertProductDto,
} from '@/api/OrderBooking/modules/products';
import type { MenuCategory, Product, ProductInput } from './types';

export function mapProduct(dto: ProductDto): Product {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    name_arabic: dto.name_arabic,
    description: dto.description ?? '',
    description_arabic: dto.description_arabic ?? '',
    longDescription: dto.longDescription ?? '',
    longDescription_arabic: dto.longDescription_arabic ?? '',
    featuredSubtitle: dto.featuredSubtitle ?? '',
    featuredSubtitle_arabic: dto.featuredSubtitle_arabic ?? '',
    price: dto.price,
    categoryId: dto.categoryId,
    image: dto.image ?? '',
    badge: dto.badge ?? '',
    badge_arabic: dto.badge_arabic ?? '',
    calories: dto.calories,
    featured: dto.featured,
    available: dto.available,
    sortOrder: dto.sortOrder,
    modifiers: dto.modifiers ?? [],
  };
}

export function mapCategory(dto: CategoryDto): MenuCategory {
  return {
    id: dto.id,
    slug: dto.slug,
    label: dto.label,
    label_arabic: dto.label_arabic,
    sortOrder: dto.sortOrder,
  };
}

export function toUpsertPayload(
  input: ProductInput,
  slug?: string,
): UpsertProductDto {
  const modifiers = input.modifiers
    .filter((g) => g.id.trim() && g.label.trim())
    .map((g) => ({
      id: g.id.trim(),
      label: g.label.trim(),
      label_arabic: g.label_arabic.trim(),
      required: g.required,
      type: g.type,
      options: g.options
        .filter((o) => o.id.trim() && o.label.trim())
        .map((o) => {
          const row = {
            id: o.id.trim(),
            label: o.label.trim(),
            label_arabic: o.label_arabic.trim(),
            price: Number(o.price) || 0,
            hint: o.hint?.trim() || undefined,
            hint_arabic: o.hint_arabic?.trim() || undefined,
          };
          return row;
        }),
    }));

  return {
    slug: slug?.trim().toLowerCase() || undefined,
    name: input.name.trim(),
    name_arabic: input.name_arabic.trim(),
    description: input.description.trim(),
    description_arabic: input.description_arabic.trim(),
    longDescription: input.longDescription.trim() || undefined,
    longDescription_arabic: input.longDescription_arabic.trim() || undefined,
    featuredSubtitle: input.featuredSubtitle.trim() || null,
    featuredSubtitle_arabic: input.featuredSubtitle_arabic.trim() || null,
    price: Number(input.price) || 0,
    categoryId: input.categoryId.trim(),
    image: input.image.trim(),
    featured: Boolean(input.featured),
    available: Boolean(input.available),
    sortOrder: Number(input.sortOrder) || 0,
    badge: input.badge.trim() || null,
    badge_arabic: input.badge_arabic.trim() || null,
    calories:
      input.calories !== null && input.calories !== undefined
        ? Number(input.calories) || 0
        : null,
    modifiers,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const rows = await productsApi.getManage();
  return rows
    .map(mapProduct)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    return mapProduct(await productsApi.getById(id));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function saveProduct(
  input: ProductInput,
  options: { isNew: boolean; id?: string; slug?: string },
): Promise<Product> {
  const payload = toUpsertPayload(input, options.slug);
  if (options.isNew) {
    return mapProduct(await productsApi.create(payload));
  }
  if (!options.id) throw new Error('Product id is required');
  return mapProduct(await productsApi.update(options.id, payload));
}

export async function deleteProduct(id: string): Promise<void> {
  await productsApi.remove(id);
}

export async function fetchCategories(): Promise<MenuCategory[]> {
  const rows = await categoriesApi.getAll();
  return rows
    .map(mapCategory)
    .sort(
      (a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.label.localeCompare(b.label),
    );
}

/** Slug from English name — used when creating products. */
export function slugifyProductId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}
