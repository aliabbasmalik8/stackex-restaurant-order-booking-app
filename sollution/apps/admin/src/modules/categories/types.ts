export type Category = {
  id: string;
  slug: string;
  label: string;
  label_arabic: string;
  sortOrder: number;
};

export type CategoryInput = {
  label: string;
  label_arabic: string;
  sortOrder: number;
};

/** Synthetic “All” chip in the guest app — never delete from admin. */
export const PROTECTED_CATEGORY_SLUGS = new Set(['all']);

/** @deprecated use PROTECTED_CATEGORY_SLUGS */
export const PROTECTED_CATEGORY_IDS = PROTECTED_CATEGORY_SLUGS;

export function emptyCategory(): CategoryInput {
  return {
    label: '',
    label_arabic: '',
    sortOrder: 0,
  };
}

export function slugifyCategoryId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}
