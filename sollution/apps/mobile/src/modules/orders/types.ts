import type { CartLine } from '@/types/cart';
import type { UserAddress } from '@/modules/profile';

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

/** Customer address snapshot on the order (not branch pickup `address`). */
export type OrderCustomerAddress = UserAddress;

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
  /** Branch / pickup location (catalog). */
  address: string;
  address_arabic: string;
  /** Customer address copied at checkout. */
  customerAddress: OrderCustomerAddress | null;
  items: OrderLine[];
  subtotal: number;
  vat: number;
  total: number;
  contact: OrderContact;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = Omit<Order, 'id'>;
