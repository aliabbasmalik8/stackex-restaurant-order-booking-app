import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@database/entities/Order.model';

/**
 * Compact domain payloads — ids + kitchen-relevant fields only.
 * Listeners refetch full rows. Do not put contact, items, or brand copy here.
 */

export type OrderPlacedPayload = {
  orderId: string;
  orderCode: number;
  userId: string;
  branchId: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  total: number;
};

export type OrderStatusChangedPayload = {
  orderId: string;
  orderCode: number;
  userId: string;
  status: OrderStatus;
};
