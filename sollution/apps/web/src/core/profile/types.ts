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
