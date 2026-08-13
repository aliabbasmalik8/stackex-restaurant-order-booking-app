import type { ProductInput } from '@/modules/products'

export const PRODUCT_SECTIONS = [
  'basics',
  'catalog',
  'media',
  'copy',
  'modifiers',
] as const

export type ProductSection = (typeof PRODUCT_SECTIONS)[number]

export function isProductSection(value: string): value is ProductSection {
  return (PRODUCT_SECTIONS as readonly string[]).includes(value)
}

/** Fields touched when saving a section (whole product is still PATCHed). */
export const PRODUCT_SECTION_FIELDS: Record<
  ProductSection,
  readonly (keyof ProductInput)[]
> = {
  basics: ['name', 'name_arabic', 'price', 'calories'],
  catalog: [
    'categoryId',
    'sortOrder',
    'available',
    'featured',
    'featuredSubtitle',
    'featuredSubtitle_arabic',
  ],
  media: ['image', 'badge', 'badge_arabic'],
  copy: [
    'description',
    'description_arabic',
    'longDescription',
    'longDescription_arabic',
    'featuredSubtitle',
    'featuredSubtitle_arabic',
  ],
  modifiers: ['modifiers'],
}

export function truncateText(value: string, max = 80): string {
  const t = value.trim()
  if (!t) return ''
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}
