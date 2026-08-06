/** Firestore collection names — change here for white-label variants. */
export const COLLECTIONS = {
  branches: 'branches',
  menuCategories: 'menu_categories',
  menuItems: 'menu_items',
  orders: 'orders',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
