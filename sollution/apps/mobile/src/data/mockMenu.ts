export type MenuCategoryId =
  | 'all'
  | 'shawarma'
  | 'broasted'
  | 'grills'
  | 'juices';

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Exclude<MenuCategoryId, 'all'>;
  image: string;
  badge?: string;
  featured?: boolean;
  featuredSubtitle?: string;
};

export const MENU_CATEGORIES: { id: MenuCategoryId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'shawarma', label: 'Shawarma' },
  { id: 'broasted', label: 'Broasted' },
  { id: 'grills', label: 'Grills' },
  { id: 'juices', label: 'Juices' },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'super-box',
    name: 'Super Shawarma Box',
    description: 'Wrap + fries + drink',
    featuredSubtitle: 'Wrap + fries + drink',
    price: 25,
    category: 'shawarma',
    image:
      'https://images.pexels.com/photos/842545/pexels-photo-842545.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: true,
    badge: 'combo',
  },
  {
    id: 'chicken-shawarma',
    name: 'Chicken Shawarma',
    description: 'Garlic sauce, pickles',
    price: 12,
    category: 'shawarma',
    image:
      'https://images.pexels.com/photos/4828100/pexels-photo-4828100.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'broasted-bucket',
    name: 'Broasted Bucket',
    description: '8 pcs, coleslaw',
    price: 34,
    category: 'broasted',
    image:
      'https://images.pexels.com/photos/7660443/pexels-photo-7660443.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Best seller',
  },
  {
    id: 'mixed-grill',
    name: 'Mixed Grill Plate',
    description: 'Kofta, tikka, bread',
    price: 42,
    category: 'grills',
    image:
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'mint-lemon',
    name: 'Fresh Mint Lemon',
    description: 'Made to order',
    price: 9,
    category: 'juices',
    image:
      'https://images.pexels.com/photos/5337685/pexels-photo-5337685.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export const MOCK_CART = {
  count: 3,
  total: 65,
};
