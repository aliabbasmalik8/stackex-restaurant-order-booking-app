import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { toAppError } from '@/lib/errors';
import { COLLECTIONS } from '@/modules/catalog/constants';
import type { CreateOrderInput, Order, OrderStatus } from './types';

const mapOrder = (id: string, data: Record<string, unknown>): Order => {
  const raw = data as Omit<Order, 'id'>;
  return {
    id,
    userId: raw.userId,
    orderCode: raw.orderCode,
    status: (raw.status as OrderStatus) ?? 'pending',
    readyAround: raw.readyAround,
    branchId: raw.branchId,
    branchLabel: raw.branchLabel ?? '',
    branchLabel_arabic: raw.branchLabel_arabic ?? '',
    address: raw.address ?? '',
    address_arabic: raw.address_arabic ?? '',
    items: Array.isArray(raw.items) ? raw.items : [],
    subtotal: Number(raw.subtotal) || 0,
    vat: Number(raw.vat) || 0,
    total: Number(raw.total) || 0,
    contact: raw.contact ?? { name: '', phone: '' },
    createdAt: raw.createdAt ?? '',
    updatedAt: raw.updatedAt ?? '',
  };
};

/** Owner-scoped list; sorted newest-first on the client (no composite index). */
export async function fetchOrdersForUser(userId: string): Promise<Order[]> {
  try {
    const col = collection(getDb(), COLLECTIONS.orders);
    const snap = await getDocs(query(col, where('userId', '==', userId)));
    return snap.docs
      .map((d) => mapOrder(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch (error) {
    throw toAppError(error);
  }
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  try {
    const col = collection(getDb(), COLLECTIONS.orders);
    const payload: Record<string, unknown> = { ...input };
    for (const key of Object.keys(payload)) {
      if (payload[key] === undefined) delete payload[key];
    }
    const ref = await addDoc(col, payload);
    return { id: ref.id, ...input };
  } catch (error) {
    throw toAppError(error);
  }
}
