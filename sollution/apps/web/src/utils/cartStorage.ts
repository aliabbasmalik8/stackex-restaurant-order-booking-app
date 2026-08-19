import type { CartLine } from '@/types/cart'
import type { MenuItem } from '@/core/catalog'

const STORAGE_KEY = 'order-booking.web.cart.v1'
export const GUEST_CART_OWNER = 'guest'

type CartStore = {
  v: 1
  byOwner: Record<string, unknown>
}

function emptyStore(): CartStore {
  return { v: 1, byOwner: {} }
}

function readStore(): CartStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw) as CartStore
    if (parsed?.v !== 1 || typeof parsed.byOwner !== 'object' || !parsed.byOwner) {
      return emptyStore()
    }
    return parsed
  } catch {
    return emptyStore()
  }
}

function writeStore(store: CartStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Private mode / quota — cart still works in memory.
  }
}

export function cartOwnerId(userId: string | null | undefined): string {
  return userId?.trim() || GUEST_CART_OWNER
}

/** Stable catalog snapshot so cart hydrate does not re-run on array identity churn. */
export function catalogFingerprint(catalog: MenuItem[]): string {
  return catalog
    .map((item) => {
      const options = (item.modifiers ?? [])
        .flatMap((group) =>
          group.options.map((option) => `${option.id}:${option.price}`),
        )
        .join(',')
      const available = item.available === false ? '0' : '1'
      return `${item.id}:${available}:${item.price}:${options}`
    })
    .join('|')
}

export function readOwnerCart(ownerId: string): unknown[] {
  const stored = readStore().byOwner[ownerId]
  return Array.isArray(stored) ? stored : []
}

export function writeOwnerCart(ownerId: string, items: CartLine[]) {
  const store = readStore()
  if (items.length === 0) {
    delete store.byOwner[ownerId]
  } else {
    store.byOwner[ownerId] = items
  }
  writeStore(store)
}

function choiceById(item: MenuItem, optionId: string) {
  for (const group of item.modifiers ?? []) {
    const choice = group.options.find((option) => option.id === optionId)
    if (choice) return choice
  }
  return undefined
}

/** Drop lines whose product/options are gone; refresh name/price from catalog. */
export function sanitizeCartLines(
  rawLines: unknown[],
  catalog: MenuItem[],
): CartLine[] {
  const products = new Map(catalog.map((item) => [item.id, item]))
  const next: CartLine[] = []

  for (const raw of rawLines) {
    if (!raw || typeof raw !== 'object') continue
    const line = raw as Partial<CartLine>
    const menuItemId = typeof line.menuItemId === 'string' ? line.menuItemId : ''
    const product = products.get(menuItemId)
    if (!product || product.available === false) continue

    const quantity = Math.floor(Number(line.quantity))
    if (!Number.isFinite(quantity) || quantity < 1) continue

    const optionIds = Array.isArray(line.selectedOptionIds)
      ? line.selectedOptionIds.filter((id): id is string => typeof id === 'string')
      : []
    const choices = optionIds.map((id) => choiceById(product, id))
    if (choices.some((choice) => !choice)) continue

    const requiredOk = (product.modifiers ?? []).every((group) => {
      if (!group.required) return true
      return group.options.some((option) => optionIds.includes(option.id))
    })
    if (!requiredOk) continue

    const validChoices = choices.filter(
      (choice): choice is NonNullable<typeof choice> => Boolean(choice),
    )
    const unitPrice =
      product.price + validChoices.reduce((sum, choice) => sum + choice.price, 0)
    const id = typeof line.id === 'string' && line.id ? line.id : `${product.id}_${next.length}`
    const note =
      typeof line.specialInstructions === 'string'
        ? line.specialInstructions.trim()
        : ''

    next.push({
      id,
      menuItemId: product.id,
      name: product.name,
      name_arabic: product.name_arabic,
      image: product.image,
      unitPrice,
      quantity: Math.min(99, quantity),
      optionsSummary: validChoices.map((choice) => choice.label).join(' · '),
      optionsSummary_arabic: validChoices
        .map((choice) => choice.label_arabic)
        .join(' · '),
      selectedOptionIds: optionIds,
      specialInstructions: note || undefined,
    })
  }

  return next
}
