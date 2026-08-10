import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { COLLECTIONS } from '@/lib/collections'
import { getDb } from '@/lib/firebase'
import {
  PROTECTED_CATEGORY_IDS,
  type Category,
  type CategoryInput,
} from './types'

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function mapCategory(
  id: string,
  data: Record<string, unknown>,
): Category {
  return {
    id,
    label: asString(data.label),
    label_arabic: asString(data.label_arabic),
    sortOrder: asNumber(data.sortOrder),
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const snap = await getDocs(collection(getDb(), COLLECTIONS.menuCategories))
  return snap.docs
    .map((d) => mapCategory(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
}

export async function fetchCategoryById(id: string): Promise<Category | null> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.menuCategories, id))
  if (!snap.exists()) return null
  return mapCategory(snap.id, snap.data() as Record<string, unknown>)
}

export async function saveCategory(
  id: string,
  input: CategoryInput,
): Promise<Category> {
  const payload = {
    label: input.label.trim(),
    label_arabic: input.label_arabic.trim(),
    sortOrder: Number(input.sortOrder) || 0,
  }
  await setDoc(doc(getDb(), COLLECTIONS.menuCategories, id), payload, {
    merge: true,
  })
  return mapCategory(id, payload)
}

/** How many menu_items reference this categoryId. */
export async function countProductsInCategory(
  categoryId: string,
): Promise<number> {
  const snap = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.menuItems),
      where('categoryId', '==', categoryId),
    ),
  )
  return snap.size
}

export async function deleteCategory(id: string): Promise<void> {
  if (PROTECTED_CATEGORY_IDS.has(id)) {
    throw new Error('PROTECTED_CATEGORY')
  }
  const inUse = await countProductsInCategory(id)
  if (inUse > 0) {
    const err = new Error('CATEGORY_IN_USE') as Error & { count?: number }
    err.count = inUse
    throw err
  }
  await deleteDoc(doc(getDb(), COLLECTIONS.menuCategories, id))
}
