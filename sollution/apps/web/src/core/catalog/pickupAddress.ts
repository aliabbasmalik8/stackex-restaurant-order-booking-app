import type { UserAddress } from '@/core/profile'
import type { Branch } from './types'

function branchAsCustomerAddress(branch: Branch): UserAddress | null {
  const lat = branch.lat
  const lng = branch.lng
  if (
    typeof lat !== 'number' ||
    !Number.isFinite(lat) ||
    typeof lng !== 'number' ||
    !Number.isFinite(lng)
  ) {
    return null
  }

  const parts = branch.address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  const city = parts.length > 1 ? parts[parts.length - 1]! : 'Pickup'
  const line1 =
    parts.length > 1
      ? parts.slice(0, -1).join(', ')
      : branch.address.trim() || branch.name

  return { line1, city, lat, lng }
}

/** Pickup pin for Nest coverage — kitchen coords, not a delivery address. */
export function pickupCustomerAddress(
  primary: Branch | null,
  branches: Branch[],
): UserAddress | null {
  if (primary) {
    const fromPrimary = branchAsCustomerAddress(primary)
    if (fromPrimary) return fromPrimary
  }
  for (const branch of branches) {
    const next = branchAsCustomerAddress(branch)
    if (next) return next
  }
  return null
}
