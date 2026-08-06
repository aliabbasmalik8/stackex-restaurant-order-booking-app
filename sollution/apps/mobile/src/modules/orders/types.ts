import type { CartLine } from '@/types/cart';

/** Matches `firebase/config.json` statusValues. */
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type OrderContact = {
  name: string;
  name_arabic?: string;
  phone: string;
};

/** Line items embedded on the order doc (same shape as cart lines). */
export type OrderLine = CartLine;

export type Order = {
  id: string;
  userId: string;
  orderCode: string;
  status: OrderStatus;
  readyAround?: string;
  branchId?: string;
  branchLabel: string;
  branchLabel_arabic: string;
  address: string;
  address_arabic: string;
  items: OrderLine[];
  subtotal: number;
  vat: number;
  total: number;
  contact: OrderContact;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = Omit<Order, 'id'>;
