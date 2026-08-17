import { Branch } from '@database/entities/Branch.model';
import { haversineKm, type GeoPin } from '@utils/geo';

export function branchHasDeliveryCoverage(branch: Branch): boolean {
  return (
    typeof branch.lat === 'number' &&
    Number.isFinite(branch.lat) &&
    typeof branch.lng === 'number' &&
    Number.isFinite(branch.lng) &&
    typeof branch.delivery_radius_km === 'number' &&
    Number.isFinite(branch.delivery_radius_km) &&
    branch.delivery_radius_km > 0
  );
}

export function isPinInsideBranch(pin: GeoPin, branch: Branch): boolean {
  if (!branchHasDeliveryCoverage(branch)) return false;
  const km = haversineKm(pin, {
    lat: branch.lat as number,
    lng: branch.lng as number,
  });
  return km <= (branch.delivery_radius_km as number);
}

/**
 * Active kitchens that can deliver to `pin`. Prefers `preferredId` when it
 * still covers; otherwise the nearest covering branch.
 */
export function pickCoveringBranch(
  branches: Branch[],
  pin: GeoPin,
  preferredId?: string | null,
): Branch | null {
  const covering = branches
    .filter((branch) => isPinInsideBranch(pin, branch))
    .sort((a, b) => {
      const da = haversineKm(pin, {
        lat: a.lat as number,
        lng: a.lng as number,
      });
      const db = haversineKm(pin, {
        lat: b.lat as number,
        lng: b.lng as number,
      });
      return da - db;
    });
  if (covering.length === 0) return null;
  if (preferredId) {
    const preferred = covering.find((branch) => branch.id === preferredId);
    if (preferred) return preferred;
  }
  return covering[0] ?? null;
}
