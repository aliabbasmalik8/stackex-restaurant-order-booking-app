export type Branch = {
  id: string
  slug: string
  name: string
  name_arabic: string
  address: string
  address_arabic: string
  etaMinutes: number
  lat: number | null
  lng: number | null
  deliveryRadiusKm: number | null
  active: boolean
  sortOrder: number
}

export type BranchInput = {
  name: string
  name_arabic: string
  address: string
  address_arabic: string
  etaMinutes: number
  lat: number | null
  lng: number | null
  deliveryRadiusKm: number | null
  active: boolean
  sortOrder: number
}

export function emptyBranch(): BranchInput {
  return {
    name: '',
    name_arabic: '',
    address: '',
    address_arabic: '',
    etaMinutes: 15,
    lat: null,
    lng: null,
    deliveryRadiusKm: null,
    active: true,
    sortOrder: 0,
  }
}

export function parseOptionalNumber(raw: string): number | null {
  const t = raw.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}
