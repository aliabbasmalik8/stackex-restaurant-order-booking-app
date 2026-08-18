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
