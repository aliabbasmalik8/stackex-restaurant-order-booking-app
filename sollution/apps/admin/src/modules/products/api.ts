import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore'
import { COLLECTIONS } from '@/lib/collections'
import { getDb } from '@/lib/firebase'
import type {
  Branch,
  MenuCategory,
  ModifierChoice,
  ModifierGroup,
  Product,
  ProductInput,
} from './types'

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function mapChoice(raw: Record<string, unknown>): ModifierChoice {
  const choice: ModifierChoice = {
    id: asString(raw.id),
    label: asString(raw.label),
    label_arabic: asString(raw.label_arabic),
    price: asNumber(raw.price),
  }
  const hint = asString(raw.hint)
  const hintAr = asString(raw.hint_arabic)
  if (hint) choice.hint = hint
  if (hintAr) choice.hint_arabic = hintAr
  return choice
}

function mapModifier(raw: Record<string, unknown>): ModifierGroup {
  const options = Array.isArray(raw.options)
    ? raw.options.map((o) => mapChoice((o ?? {}) as Record<string, unknown>))
    : []
  return {
    id: asString(raw.id),
    label: asString(raw.label),
    label_arabic: asString(raw.label_arabic),
    required: Boolean(raw.required),
    type: raw.type === 'multi' ? 'multi' : 'single',
    options,
  }
}

export function mapProduct(id: string, data: Record<string, unknown>): Product {
  const caloriesRaw = data.calories
  const calories =
    caloriesRaw === null || caloriesRaw === undefined || caloriesRaw === ''
      ? null
      : asNumber(caloriesRaw)

  return {
    id,
    name: asString(data.name),
    name_arabic: asString(data.name_arabic),
    description: asString(data.description),
    description_arabic: asString(data.description_arabic),
    longDescription: asString(data.longDescription),
    longDescription_arabic: asString(data.longDescription_arabic),
    featuredSubtitle: asString(data.featuredSubtitle),
    featuredSubtitle_arabic: asString(data.featuredSubtitle_arabic),
    price: asNumber(data.price),
    categoryId: asString(data.categoryId ?? data.category),
    branchId: asString(data.branchId),
    image: asString(data.image),
    badge: asString(data.badge),
    badge_arabic: asString(data.badge_arabic),
    calories,
    featured: Boolean(data.featured),
    available: data.available !== false,
    sortOrder: asNumber(data.sortOrder),
    modifiers: Array.isArray(data.modifiers)
      ? data.modifiers.map((m) =>
          mapModifier((m ?? {}) as Record<string, unknown>),
        )
      : [],
  }
}

/** Firestore rejects `undefined` — drop empty optional strings too where useful. */
export function toFirestorePayload(input: ProductInput): Record<string, unknown> {
  const modifiers = input.modifiers
    .filter((g) => g.id.trim() && g.label.trim())
    .map((g) => ({
      id: g.id.trim(),
      label: g.label.trim(),
      label_arabic: g.label_arabic.trim(),
      required: g.required,
      type: g.type,
      options: g.options
        .filter((o) => o.id.trim() && o.label.trim())
        .map((o) => {
          const row: Record<string, unknown> = {
            id: o.id.trim(),
            label: o.label.trim(),
            label_arabic: o.label_arabic.trim(),
            price: Number(o.price) || 0,
          }
          if (o.hint?.trim()) row.hint = o.hint.trim()
          if (o.hint_arabic?.trim()) row.hint_arabic = o.hint_arabic.trim()
          return row
        }),
    }))

  const payload: Record<string, unknown> = {
    name: input.name.trim(),
    name_arabic: input.name_arabic.trim(),
    description: input.description.trim(),
    description_arabic: input.description_arabic.trim(),
    price: Number(input.price) || 0,
    categoryId: input.categoryId.trim(),
    branchId: input.branchId.trim(),
    image: input.image.trim(),
    featured: Boolean(input.featured),
    available: Boolean(input.available),
    sortOrder: Number(input.sortOrder) || 0,
    modifiers,
  }

  if (input.longDescription.trim()) {
    payload.longDescription = input.longDescription.trim()
  }
  if (input.longDescription_arabic.trim()) {
    payload.longDescription_arabic = input.longDescription_arabic.trim()
  }
  if (input.featuredSubtitle.trim()) {
    payload.featuredSubtitle = input.featuredSubtitle.trim()
  }
  if (input.featuredSubtitle_arabic.trim()) {
    payload.featuredSubtitle_arabic = input.featuredSubtitle_arabic.trim()
  }
  if (input.badge.trim()) payload.badge = input.badge.trim()
  if (input.badge_arabic.trim()) payload.badge_arabic = input.badge_arabic.trim()
  if (input.calories !== null && input.calories !== undefined) {
    payload.calories = Number(input.calories) || 0
  }

  return payload
}

export async function fetchProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(getDb(), COLLECTIONS.menuItems))
  return snap.docs
    .map((d) => mapProduct(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.menuItems, id))
  if (!snap.exists()) return null
  return mapProduct(snap.id, snap.data() as Record<string, unknown>)
}

export async function saveProduct(
  id: string,
  input: ProductInput,
): Promise<Product> {
  const payload = toFirestorePayload(input)
  await setDoc(doc(getDb(), COLLECTIONS.menuItems, id), payload, {
    merge: true,
  })
  return mapProduct(id, payload)
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.menuItems, id))
}

export async function fetchCategories(): Promise<MenuCategory[]> {
  const snap = await getDocs(collection(getDb(), COLLECTIONS.menuCategories))
  return snap.docs
    .map((d) => {
      const data = d.data() as Record<string, unknown>
      return {
        id: d.id,
        label: asString(data.label),
        label_arabic: asString(data.label_arabic),
        sortOrder: asNumber(data.sortOrder),
      }
    })
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export async function fetchBranches(): Promise<Branch[]> {
  const snap = await getDocs(collection(getDb(), COLLECTIONS.branches))
  return snap.docs
    .map((d) => {
      const data = d.data() as Record<string, unknown>
      return {
        id: d.id,
        name: asString(data.name),
        name_arabic: asString(data.name_arabic),
        address: asString(data.address),
        address_arabic: asString(data.address_arabic),
        etaMinutes: asNumber(data.etaMinutes, 15),
        active: data.active !== false,
        sortOrder: asNumber(data.sortOrder),
      }
    })
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

/** Slug id from English name — used when creating products. */
export function slugifyProductId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}
