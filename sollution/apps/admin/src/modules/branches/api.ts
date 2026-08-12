import { ApiError } from '@/api/OrderBooking/client'
import { branchesApi } from '@/api/OrderBooking/modules/branches'
import type { BranchDto } from '@/api/OrderBooking/modules/branches'
import type { Branch, BranchInput } from './types'

export function mapBranch(dto: BranchDto): Branch {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    name_arabic: dto.name_arabic,
    address: dto.address,
    address_arabic: dto.address_arabic,
    etaMinutes: dto.etaMinutes,
    active: dto.active,
    sortOrder: dto.sortOrder,
  }
}

export async function fetchBranchesManage(): Promise<Branch[]> {
  const rows = await branchesApi.getManage()
  return rows
    .map(mapBranch)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
    )
}

export async function fetchBranchById(id: string): Promise<Branch | null> {
  try {
    return mapBranch(await branchesApi.getById(id))
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export async function saveBranch(
  id: string,
  input: BranchInput,
): Promise<Branch> {
  return mapBranch(
    await branchesApi.update(id, {
      name: input.name.trim(),
      name_arabic: input.name_arabic.trim(),
      address: input.address.trim(),
      address_arabic: input.address_arabic.trim(),
      etaMinutes: Number(input.etaMinutes) || 0,
      active: Boolean(input.active),
      sortOrder: Number(input.sortOrder) || 0,
    }),
  )
}
