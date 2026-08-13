import type { BranchInput } from './types'

export const BRANCH_SECTIONS = ['basics', 'address', 'location'] as const

export type BranchSection = (typeof BRANCH_SECTIONS)[number]

export function isBranchSection(value: string): value is BranchSection {
  return (BRANCH_SECTIONS as readonly string[]).includes(value)
}

/** Fields touched when saving a section (whole branch is still PATCHed). */
export const BRANCH_SECTION_FIELDS: Record<
  BranchSection,
  readonly (keyof BranchInput)[]
> = {
  basics: ['name', 'name_arabic', 'sortOrder', 'active'],
  address: ['address', 'address_arabic'],
  location: ['lat', 'lng', 'deliveryRadiusKm', 'etaMinutes'],
}

export function truncateText(value: string, max = 80): string {
  const t = value.trim()
  if (!t) return ''
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}
