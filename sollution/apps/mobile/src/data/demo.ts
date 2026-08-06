/** Placeholders until Auth + orders APIs land. Menu/catalog comes from Firestore. */

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
