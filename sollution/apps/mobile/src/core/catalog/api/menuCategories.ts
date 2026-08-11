import { categoriesApi } from '@/api/OrderBooking/modules/categories';
import type { MenuCategory } from '../types';

export async function fetchMenuCategories(): Promise<MenuCategory[]> {
  return categoriesApi.getAll();
}
