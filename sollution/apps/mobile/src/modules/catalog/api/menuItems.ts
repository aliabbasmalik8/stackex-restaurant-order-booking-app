import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { COLLECTIONS } from '../constants';
import type { MenuItem } from '../types';

const mapItem = (id: string, data: Record<string, unknown>): MenuItem => {
  const raw = data as Omit<MenuItem, 'id'> & { category?: string };
  return {
    id,
    ...raw,
    categoryId: raw.categoryId ?? raw.category ?? '',
    modifiers: raw.modifiers ?? [],
  };
};

export async function fetchMenuItems(branchId?: string): Promise<MenuItem[]> {
  const col = collection(getDb(), COLLECTIONS.menuItems);
  const snap = branchId
    ? await getDocs(query(col, where('branchId', '==', branchId)))
    : await getDocs(col);

  return snap.docs
    .map((d) => mapItem(d.id, d.data() as Record<string, unknown>))
    .filter((i) => i.available !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function fetchMenuItemById(id: string): Promise<MenuItem | null> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.menuItems, id));
  if (!snap.exists()) return null;
  return mapItem(snap.id, snap.data() as Record<string, unknown>);
}
