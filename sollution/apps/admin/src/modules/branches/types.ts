export type Branch = {
  id: string
  slug: string
  name: string
  name_arabic: string
  address: string
  address_arabic: string
  etaMinutes: number
  active: boolean
  sortOrder: number
}

export type BranchInput = {
  name: string
  name_arabic: string
  address: string
  address_arabic: string
  etaMinutes: number
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
    active: true,
    sortOrder: 0,
  }
}
