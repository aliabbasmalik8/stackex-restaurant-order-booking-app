import { collection, getDocs } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { COLLECTIONS } from '../constants';
import type { Branch } from '../types';

export async function fetchBranches(): Promise<Branch[]> {
  const snap = await getDocs(collection(getDb(), COLLECTIONS.branches));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Branch, 'id'>) }))
    .filter((b) => b.active !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}
