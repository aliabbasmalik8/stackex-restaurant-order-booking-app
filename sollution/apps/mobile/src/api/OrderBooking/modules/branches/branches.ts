import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type { BranchDto } from './branches.types';

export const branchesApi = {
  getAll: (): Promise<BranchDto[]> =>
    orderBookingApiClient.get<BranchDto[]>('/branches'),
};
