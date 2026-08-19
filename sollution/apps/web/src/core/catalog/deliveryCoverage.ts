import { haversineKm } from '@/lib/geo'
import type { Branch } from './types'

export function branchHasDeliveryCoverage(branch: Branch): boolean {
  return (
    typeof branch.lat === 'number' &&
    Number.isFinite(branch.lat) &&
    typeof branch.lng === 'number' &&
    Number.isFinite(branch.lng) &&
    typeof branch.deliveryRadiusKm === 'number' &&
    Number.isFinite(branch.deliveryRadiusKm) &&
    branch.deliveryRadiusKm > 0
  )
}

/**
 * True when the pin is inside at least one branch radius.
 * If no kitchen has coverage configured yet, allow checkout (Nest skips too).
 */
export function isPinCoveredByAnyBranch(
  pin: { lat: number; lng: number } | null | undefined,
  branches: Branch[],
): boolean {
  if (!branches.some(branchHasDeliveryCoverage)) return true
  if (!pin || !Number.isFinite(pin.lat) || !Number.isFinite(pin.lng)) {
    return false
  }
  return branches.some((branch) => {
    if (!branchHasDeliveryCoverage(branch)) return false
    const km = haversineKm(pin, {
      lat: branch.lat as number,
      lng: branch.lng as number,
    })
    return km <= (branch.deliveryRadiusKm as number)
  })
}
