import type { CartLine } from '@/types/cart';
import type { UserAddress } from '@/core/profile';

/** Order status values used by Nest + mobile UI. */
export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'card';

export type PaymentStatus =
  | 'not_required'
  | 'unpaid'
  | 'paid'
  | 'failed'
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
  orderCode: number;
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
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = Omit<
  Order,
  | 'id'
  | 'orderCode'
  | 'status'
  | 'paymentMethod'
  | 'paymentStatus'
  | 'stripePaymentIntentId'
  | 'paidAt'
> & {
  /** Server sets status from payment method; client may omit. */
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  stripePaymentIntentId?: string | null;
  paidAt?: string | null;
};
