import { productsApi } from '@/api/OrderBooking/modules/products';
import type { MenuItem } from '../types';

export async function fetchMenuItems(): Promise<MenuItem[]> {
  return productsApi.getAll();
}

export async function fetchMenuItemById(id: string): Promise<MenuItem | null> {
  try {
    return await productsApi.getById(id);
  } catch {
    return null;
  }
}
