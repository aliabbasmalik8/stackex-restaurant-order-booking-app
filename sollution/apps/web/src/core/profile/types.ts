export type UserAddress = {
  line1: string
  line2?: string
  area?: string
  city: string
  notes?: string
  lat?: number
  lng?: number
}

export type UserProfileDoc = {
  uid: string
  contactPhone: string | null
  createdAt: string
  updatedAt: string
}

export type SaveUserProfileInput = {
  displayName?: string
  contactPhone?: string | null
}

export function formatAddress(address: UserAddress | null | undefined): string {
  if (!address) return ''
  const parts = [
    address.line1?.trim(),
    address.line2?.trim(),
    address.area?.trim(),
    address.city?.trim(),
  ].filter(Boolean)
  return parts.join(', ')
}

export function hasAddress(address: UserAddress | null | undefined): boolean {
  return Boolean(address?.line1?.trim() && address?.city?.trim())
}

export function toCustomerAddress(row: {
  line1: string
  line2?: string | null
  area?: string | null
  city: string
  notes?: string | null
  lat?: number | null
  lng?: number | null
}): UserAddress {
  const next: UserAddress = {
    line1: row.line1.trim(),
    city: row.city.trim(),
  }
  const line2 = row.line2?.trim()
  const area = row.area?.trim()
  const notes = row.notes?.trim()
  if (line2) next.line2 = line2
  if (area) next.area = area
  if (notes) next.notes = notes
  if (typeof row.lat === 'number' && Number.isFinite(row.lat)) {
    next.lat = row.lat
  }
  if (typeof row.lng === 'number' && Number.isFinite(row.lng)) {
    next.lng = row.lng
  }
  return next
}
