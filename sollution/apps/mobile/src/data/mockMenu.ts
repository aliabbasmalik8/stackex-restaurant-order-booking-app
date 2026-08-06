import type { AppLocale } from '@/i18n';

export type MenuCategoryId =
  | 'all'
  | 'shawarma'
  | 'broasted'
  | 'grills'
  | 'juices';

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

export type MenuItem = {
  id: string;
  name: string;
  name_arabic: string;
  description: string;
  description_arabic: string;
  longDescription?: string;
  longDescription_arabic?: string;
  price: number;
  category: Exclude<MenuCategoryId, 'all'>;
  image: string;
  badge?: string;
  badge_arabic?: string;
  calories?: number;
  featured?: boolean;
  featuredSubtitle?: string;
  featuredSubtitle_arabic?: string;
  modifiers?: ModifierGroup[];
};

export type MenuCategory = {
  id: MenuCategoryId;
  label: string;
  label_arabic: string;
};

/** Pick English or Arabic field based on active locale. */
export const localized = (
  locale: string | AppLocale,
  en: string,
  ar?: string | null,
) => (locale.startsWith('ar') && ar ? ar : en);

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'all', label: 'All', label_arabic: 'الكل' },
  { id: 'shawarma', label: 'Shawarma', label_arabic: 'شاورما' },
  { id: 'broasted', label: 'Broasted', label_arabic: 'بروستد' },
  { id: 'grills', label: 'Grills', label_arabic: 'مشاوي' },
  { id: 'juices', label: 'Juices', label_arabic: 'عصائر' },
];

export const BRANCH = {
  id: 'al-satwa',
  name: 'Al Satwa',
  name_arabic: 'السطوة',
  address: '2nd December St · counter pickup',
  address_arabic: 'شارع الثاني من ديسمبر · استلام من الكاونتر',
  etaMinutes: 15,
};

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'super-box',
    name: 'Super Shawarma Box',
    name_arabic: 'سوبر شاورما بوكس',
    description: 'Wrap + fries + drink',
    description_arabic: 'راب + بطاطس + مشروب',
    featuredSubtitle: 'Wrap + fries + drink',
    featuredSubtitle_arabic: 'راب + بطاطس + مشروب',
    longDescription: 'Chicken shawarma wrap, crispy fries, and a soft drink.',
    longDescription_arabic: 'شاورما دجاج، بطاطس مقرمشة، ومشروب غازي.',
    price: 25,
    category: 'shawarma',
    image:
      'https://images.pexels.com/photos/842545/pexels-photo-842545.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: true,
    badge: 'combo',
    badge_arabic: 'كومبو',
    calories: 920,
  },
  {
    id: 'chicken-shawarma',
    name: 'Chicken Shawarma',
    name_arabic: 'شاورما دجاج',
    description: 'Garlic sauce, pickles',
    description_arabic: 'ثومية ومخلل',
    longDescription:
      'Charcoal-toasted saj bread, garlic toum, pickles, fries inside.',
    longDescription_arabic:
      'خبز صاج محمص على الفحم، ثومية، مخلل، وبطاطس بالداخل.',
    price: 12,
    category: 'shawarma',
    image:
      'https://images.pexels.com/photos/4828100/pexels-photo-4828100.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Best seller',
    badge_arabic: 'الأكثر مبيعاً',
    calories: 480,
    modifiers: [
      {
        id: 'bread',
        label: 'Bread',
        label_arabic: 'الخبز',
        required: true,
        type: 'single',
        options: [
          {
            id: 'saj',
            label: 'Saj wrap',
            label_arabic: 'راب صاج',
            price: 0,
            hint: 'included',
            hint_arabic: 'مشمول',
          },
          {
            id: 'samoon',
            label: 'Samoon bun',
            label_arabic: 'صمون',
            price: 2,
            hint: '+AED 2',
            hint_arabic: '+٢ درهم',
          },
        ],
      },
      {
        id: 'extras',
        label: 'Extras',
        label_arabic: 'إضافات',
        required: false,
        type: 'multi',
        options: [
          {
            id: 'toum',
            label: 'Extra toum',
            label_arabic: 'ثومية إضافية',
            price: 1,
          },
          {
            id: 'cheese',
            label: 'Cheese melt',
            label_arabic: 'جبنة مذابة',
            price: 3,
          },
          {
            id: 'harra',
            label: 'Spicy harra sauce 🌶️',
            label_arabic: 'صلصة حارة 🌶️',
            price: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'broasted-bucket',
    name: 'Broasted Bucket',
    name_arabic: 'دلو بروستد',
    description: '8 pcs, coleslaw',
    description_arabic: '٨ قطع مع كول سلو',
    longDescription: 'Crispy broasted chicken, eight pieces, with coleslaw.',
    longDescription_arabic: 'دجاج بروستد مقرمش، ثماني قطع، مع كول سلو.',
    price: 34,
    category: 'broasted',
    image:
      'https://images.pexels.com/photos/7660443/pexels-photo-7660443.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Best seller',
    badge_arabic: 'الأكثر مبيعاً',
    calories: 1180,
  },
  {
    id: 'mixed-grill',
    name: 'Mixed Grill Plate',
    name_arabic: 'صينية مشاوي مشكلة',
    description: 'Kofta, tikka, bread',
    description_arabic: 'كفتة، تكا، خبز',
    longDescription: 'Kofta, chicken tikka, and fresh bread on one plate.',
    longDescription_arabic: 'كفتة وتكا دجاج وخبز طازج في طبق واحد.',
    price: 42,
    category: 'grills',
    image:
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    calories: 860,
  },
  {
    id: 'mint-lemon',
    name: 'Fresh Mint Lemon',
    name_arabic: 'ليمون بالنعناع',
    description: 'Made to order',
    description_arabic: 'يُحضَّر عند الطلب',
    longDescription: 'Fresh lemon and mint, blended to order.',
    longDescription_arabic: 'ليمون ونعناع طازج يُخلط عند الطلب.',
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
    title_arabic: 'سوبر شاورما بوكس ×٢',
    date: 'Aug 2',
    date_arabic: '٢ أغسطس',
    total: 52.5,
    image:
      'https://images.pexels.com/photos/842545/pexels-photo-842545.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'p2',
    title: 'Mixed Grill Plate',
    title_arabic: 'صينية مشاوي مشكلة',
    date: 'Jul 28',
    date_arabic: '٢٨ يوليو',
    total: 44.1,
    image:
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'p3',
    title: 'Broasted Bucket, Mint Lemon',
    title_arabic: 'دلو بروستد، ليمون بالنعناع',
    date: 'Jul 21',
    date_arabic: '٢١ يوليو',
    total: 43.05,
    image:
      'https://images.pexels.com/photos/7660443/pexels-photo-7660443.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export const PROFILE_USER = {
  name: 'Aisha Khalid',
  name_arabic: 'عائشة خالد',
  shortName: 'Aisha K.',
  shortName_arabic: 'عائشة خ.',
  phone: '+971 50 555 0134',
  initial: 'A',
  loyaltyStamps: 7,
  loyaltyGoal: 10,
};

export const VAT_RATE = 0.05;

export const money = (n: number) =>
  `AED ${n.toFixed(n % 1 === 0 ? 0 : 2)}`;

export const moneyFixed = (n: number) => `AED ${n.toFixed(2)}`;
