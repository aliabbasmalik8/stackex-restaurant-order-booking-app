import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type { BranchDto, UpdateBranchDto } from './branches.types';

export const branchesApi = {
  /** Active branches only (guest fulfillment kitchens). */
  getAll: (): Promise<BranchDto[]> =>
    orderBookingApiClient.get<BranchDto[]>('/branches'),

  /** Admin list — includes inactive. */
  getManage: (): Promise<BranchDto[]> =>
    orderBookingApiClient.get<BranchDto[]>('/branches/manage'),

  getById: (id: string): Promise<BranchDto> =>
    orderBookingApiClient.get<BranchDto>(`/branches/${id}`),

  update: (id: string, data: UpdateBranchDto): Promise<BranchDto> =>
    orderBookingApiClient.patch<BranchDto>(`/branches/${id}`, data),
};
