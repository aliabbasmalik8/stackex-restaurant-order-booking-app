import { productsApi } from '@/api/OrderBooking/modules/products';
import type { MenuItem } from '../types';

export async function fetchMenuItems(branchId?: string): Promise<MenuItem[]> {
  return productsApi.getAll(branchId);
}

export async function fetchMenuItemById(id: string): Promise<MenuItem | null> {
  try {
    return await productsApi.getById(id);
  } catch {
    return null;
  }
}
