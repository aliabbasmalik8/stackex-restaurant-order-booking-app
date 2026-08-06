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

/** Firestore rejects `undefined` anywhere — including nested cart line fields. */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as T;
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(
      value as Record<string, unknown>,
    )) {
      if (nested === undefined) continue;
      out[key] = stripUndefined(nested);
    }
    return out as T;
  }
  return value;
}

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
    const payload = stripUndefined({ ...input }) as CreateOrderInput;
    const ref = await addDoc(col, payload);
    return { id: ref.id, ...payload };
  } catch (error) {
    if (__DEV__) {
      console.warn('[orders] createOrder failed', error);
    }
    throw toAppError(error);
  }
}
