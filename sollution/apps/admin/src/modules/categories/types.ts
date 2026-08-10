export type Category = {
  id: string
  label: string
  label_arabic: string
  sortOrder: number
}

export type CategoryInput = Omit<Category, 'id'>

/** Synthetic “All” chip in the guest app — never delete from admin. */
export const PROTECTED_CATEGORY_IDS = new Set(['all'])

export function emptyCategory(): CategoryInput {
  return {
    label: '',
    label_arabic: '',
    sortOrder: 0,
  }
}

export function slugifyCategoryId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}
