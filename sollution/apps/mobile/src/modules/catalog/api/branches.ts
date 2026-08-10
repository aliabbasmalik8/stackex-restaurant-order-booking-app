import { branchesApi } from '@/api/OrderBooking/modules/branches';
import type { Branch } from '../types';

export async function fetchBranches(): Promise<Branch[]> {
  return branchesApi.getAll();
}
