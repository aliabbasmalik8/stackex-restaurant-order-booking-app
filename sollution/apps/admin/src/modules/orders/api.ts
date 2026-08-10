import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { COLLECTIONS } from '@/lib/collections'
import { getDb } from '@/lib/firebase'
import type { Order, OrderLine, OrderStatus } from './types'

function mapItems(raw: unknown): OrderLine[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item, index) => {
    const row = (item ?? {}) as Record<string, unknown>
    return {
      id: typeof row.id === 'string' ? row.id : `line-${index}`,
      menuItemId:
        typeof row.menuItemId === 'string' ? row.menuItemId : undefined,
      name: typeof row.name === 'string' ? row.name : 'Item',
      name_arabic:
        typeof row.name_arabic === 'string' ? row.name_arabic : undefined,
      image: typeof row.image === 'string' ? row.image : undefined,
      unitPrice: Number(row.unitPrice) || 0,
      quantity: Number(row.quantity) || 0,
      optionsSummary:
        typeof row.optionsSummary === 'string' ? row.optionsSummary : undefined,
      optionsSummary_arabic:
        typeof row.optionsSummary_arabic === 'string'
          ? row.optionsSummary_arabic
          : undefined,
      selectedOptionIds: Array.isArray(row.selectedOptionIds)
        ? row.selectedOptionIds.filter(
            (id): id is string => typeof id === 'string',
          )
        : undefined,
    }
  })
}

export function mapOrder(id: string, data: Record<string, unknown>): Order {
  const contact = (data.contact ?? {}) as Record<string, unknown>
  return {
    id,
    userId: typeof data.userId === 'string' ? data.userId : '',
    orderCode: typeof data.orderCode === 'string' ? data.orderCode : id,
    status: (data.status as OrderStatus) ?? 'pending',
    readyAround:
      typeof data.readyAround === 'string' ? data.readyAround : undefined,
    branchId: typeof data.branchId === 'string' ? data.branchId : undefined,
    branchLabel: typeof data.branchLabel === 'string' ? data.branchLabel : '',
    branchLabel_arabic:
      typeof data.branchLabel_arabic === 'string'
        ? data.branchLabel_arabic
        : '',
    address: typeof data.address === 'string' ? data.address : '',
    address_arabic:
      typeof data.address_arabic === 'string' ? data.address_arabic : '',
    items: mapItems(data.items),
    subtotal: Number(data.subtotal) || 0,
    vat: Number(data.vat) || 0,
    total: Number(data.total) || 0,
    contact: {
      name: typeof contact.name === 'string' ? contact.name : '',
      name_arabic:
        typeof contact.name_arabic === 'string'
          ? contact.name_arabic
          : undefined,
      phone: typeof contact.phone === 'string' ? contact.phone : '',
    },
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : '',
  }
}

function sortNewestFirst(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

/** One-shot fetch (fallback / refresh). */
export async function fetchAllOrders(): Promise<Order[]> {
  const snap = await getDocs(collection(getDb(), COLLECTIONS.orders))
  return sortNewestFirst(
    snap.docs.map((d) => mapOrder(d.id, d.data() as Record<string, unknown>)),
  )
}

/** Live admin list — newest first. */
export function subscribeOrders(
  onChange: (orders: Order[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(getDb(), COLLECTIONS.orders),
    (snap) => {
      onChange(
        sortNewestFirst(
          snap.docs.map((d) =>
            mapOrder(d.id, d.data() as Record<string, unknown>),
          ),
        ),
      )
    },
    (err) => {
      onError?.(err)
    },
  )
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTIONS.orders, orderId), {
    status,
    updatedAt: new Date().toISOString(),
  })
}
