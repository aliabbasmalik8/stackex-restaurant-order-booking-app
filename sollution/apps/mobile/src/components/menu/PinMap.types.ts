export type PinMapProps = {
  /** Kitchen pin from the active branch (seed Al Satwa in this template). */
  latitude?: number | null;
  longitude?: number | null;
};

/** Fallback = `scripts/seed-data.json` Al Satwa. */
export const FALLBACK_BRANCH_PIN = {
  latitude: 25.2365,
  longitude: 55.2784,
} as const;

export function regionFromBranchPin(
  latitude?: number | null,
  longitude?: number | null,
) {
  const lat =
    typeof latitude === 'number' && Number.isFinite(latitude)
      ? latitude
      : FALLBACK_BRANCH_PIN.latitude;
  const lng =
    typeof longitude === 'number' && Number.isFinite(longitude)
      ? longitude
      : FALLBACK_BRANCH_PIN.longitude;
  return {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };
}
