export type MenuCategoryId =
  | 'all'
  | 'shawarma'
  | 'broasted'
  | 'grills'
  | 'juices';

export type ModifierChoice = {
  id: string;
  label: string;
  price: number;
  hint?: string;
};

export type ModifierGroup = {
  id: string;
  label: string;
  required: boolean;
  type: 'single' | 'multi';
  options: ModifierChoice[];
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  category: Exclude<MenuCategoryId, 'all'>;
  image: string;
  badge?: string;
  calories?: number;
  featured?: boolean;
  featuredSubtitle?: string;
  modifiers?: ModifierGroup[];
};

export const MENU_CATEGORIES: { id: MenuCategoryId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'shawarma', label: 'Shawarma' },
  { id: 'broasted', label: 'Broasted' },
  { id: 'grills', label: 'Grills' },
  { id: 'juices', label: 'Juices' },
];

export const BRANCH = {
  id: 'al-satwa',
  name: 'Al Satwa',
  address: '2nd December St · counter pickup',
  etaMinutes: 15,
};

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'super-box',
    name: 'Super Shawarma Box',
    description: 'Wrap + fries + drink',
    featuredSubtitle: 'Wrap + fries + drink',
    longDescription: 'Chicken shawarma wrap, crispy fries, and a soft drink.',
    price: 25,
    category: 'shawarma',
    image:
      'https://images.pexels.com/photos/842545/pexels-photo-842545.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: true,
    badge: 'combo',
    calories: 920,
  },
  {
    id: 'chicken-shawarma',
    name: 'Chicken Shawarma',
    description: 'Garlic sauce, pickles',
    longDescription:
      'Charcoal-toasted saj bread, garlic toum, pickles, fries inside.',
    price: 12,
    category: 'shawarma',
    image:
      'https://images.pexels.com/photos/4828100/pexels-photo-4828100.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Best seller',
    calories: 480,
    modifiers: [
      {
        id: 'bread',
        label: 'Bread',
        required: true,
        type: 'single',
        options: [
          { id: 'saj', label: 'Saj wrap', price: 0, hint: 'included' },
          { id: 'samoon', label: 'Samoon bun', price: 2, hint: '+AED 2' },
        ],
      },
      {
        id: 'extras',
        label: 'Extras',
        required: false,
        type: 'multi',
        options: [
          { id: 'toum', label: 'Extra toum', price: 1 },
          { id: 'cheese', label: 'Cheese melt', price: 3 },
          { id: 'harra', label: 'Spicy harra sauce 🌶️', price: 1 },
        ],
      },
    ],
  },
  {
    id: 'broasted-bucket',
    name: 'Broasted Bucket',
    description: '8 pcs, coleslaw',
    longDescription: 'Crispy broasted chicken, eight pieces, with coleslaw.',
    price: 34,
    category: 'broasted',
    image:
      'https://images.pexels.com/photos/7660443/pexels-photo-7660443.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Best seller',
    calories: 1180,
  },
  {
    id: 'mixed-grill',
    name: 'Mixed Grill Plate',
    description: 'Kofta, tikka, bread',
    longDescription: 'Kofta, chicken tikka, and fresh bread on one plate.',
    price: 42,
    category: 'grills',
    image:
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    calories: 860,
  },
  {
    id: 'mint-lemon',
    name: 'Fresh Mint Lemon',
    description: 'Made to order',
    longDescription: 'Fresh lemon and mint, blended to order.',
    price: 9,
    category: 'juices',
    image:
      'https://images.pexels.com/photos/5337685/pexels-photo-5337685.jpeg?auto=compress&cs=tinysrgb&w=800',
    calories: 90,
  },
];

export const getMenuItem = (id: string) =>
  MENU_ITEMS.find((item) => item.id === id);

export const PAST_ORDERS = [
  {
    id: 'p1',
    title: 'Super Shawarma Box ×2',
    date: 'Aug 2',
    total: 52.5,
    image:
      'https://images.pexels.com/photos/842545/pexels-photo-842545.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'p2',
    title: 'Mixed Grill Plate',
    date: 'Jul 28',
    total: 44.1,
    image:
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'p3',
    title: 'Broasted Bucket, Mint Lemon',
    date: 'Jul 21',
    total: 43.05,
    image:
      'https://images.pexels.com/photos/7660443/pexels-photo-7660443.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export const PROFILE_USER = {
  name: 'Aisha Khalid',
  shortName: 'Aisha K.',
  phone: '+971 50 555 0134',
  initial: 'A',
  loyaltyStamps: 7,
  loyaltyGoal: 10,
  language: 'English',
};

export const VAT_RATE = 0.05;

export const money = (n: number) =>
  `AED ${n.toFixed(n % 1 === 0 ? 0 : 2)}`;

export const moneyFixed = (n: number) => `AED ${n.toFixed(2)}`;
