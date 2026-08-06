import { collection, getDocs } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { COLLECTIONS } from '../constants';
import type { MenuCategory } from '../types';

export async function fetchMenuCategories(): Promise<MenuCategory[]> {
  const snap = await getDocs(collection(getDb(), COLLECTIONS.menuCategories));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<MenuCategory, 'id'>) }))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}
