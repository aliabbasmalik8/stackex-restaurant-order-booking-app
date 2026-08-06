export type ModifierChoice = {
  id: string;
  label: string;
  label_arabic: string;
  price: number;
  hint?: string;
  hint_arabic?: string;
};

export type ModifierGroup = {
  id: string;
  label: string;
  label_arabic: string;
  required: boolean;
  type: 'single' | 'multi';
  options: ModifierChoice[];
};

export type Branch = {
  id: string;
  name: string;
  name_arabic: string;
  address: string;
  address_arabic: string;
  etaMinutes: number;
  active?: boolean;
  sortOrder?: number;
};

export type MenuCategory = {
  id: string;
  label: string;
  label_arabic: string;
  sortOrder?: number;
};

export type MenuItem = {
  id: string;
  name: string;
  name_arabic: string;
  description: string;
  description_arabic: string;
  longDescription?: string;
  longDescription_arabic?: string;
  featuredSubtitle?: string;
  featuredSubtitle_arabic?: string;
  price: number;
  /** Matches Firestore `categoryId` */
  categoryId: string;
  branchId?: string;
  image: string;
  badge?: string;
  badge_arabic?: string;
  calories?: number;
  featured?: boolean;
  available?: boolean;
  sortOrder?: number;
  modifiers?: ModifierGroup[];
};
