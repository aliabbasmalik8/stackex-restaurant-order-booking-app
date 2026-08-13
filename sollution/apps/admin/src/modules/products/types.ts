export type ModifierChoice = {
  id: string
  label: string
  label_arabic: string
  price: number
  hint?: string
  hint_arabic?: string
}

export type ModifierGroup = {
  id: string
  label: string
  label_arabic: string
  required: boolean
  type: 'single' | 'multi'
  options: ModifierChoice[]
}

export type MenuCategory = {
  id: string
  slug: string
  label: string
  label_arabic: string
  sortOrder?: number
}

export type Product = {
  id: string
  slug: string
  name: string
  name_arabic: string
  description: string
  description_arabic: string
  longDescription: string
  longDescription_arabic: string
  featuredSubtitle: string
  featuredSubtitle_arabic: string
  price: number
  categoryId: string
  image: string
  badge: string
  badge_arabic: string
  calories: number | null
  featured: boolean
  available: boolean
  sortOrder: number
  modifiers: ModifierGroup[]
}

/** Writable payload (no id/slug — slug is set on create). */
export type ProductInput = Omit<Product, 'id' | 'slug'>

export function emptyProduct(): ProductInput {
  return {
    name: '',
    name_arabic: '',
    description: '',
    description_arabic: '',
    longDescription: '',
    longDescription_arabic: '',
    featuredSubtitle: '',
    featuredSubtitle_arabic: '',
    price: 0,
    categoryId: '',
    image: '',
    badge: '',
    badge_arabic: '',
    calories: null,
    featured: false,
    available: true,
    sortOrder: 0,
    modifiers: [],
  }
}

export function emptyModifierGroup(): ModifierGroup {
  return {
    id: '',
    label: '',
    label_arabic: '',
    required: false,
    type: 'single',
    options: [],
  }
}

export function emptyModifierChoice(): ModifierChoice {
  return {
    id: '',
    label: '',
    label_arabic: '',
    price: 0,
  }
}
