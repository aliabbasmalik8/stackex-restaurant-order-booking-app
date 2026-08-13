import type { Order } from '@database/entities/Order.model';
import type {
  OrderPlacedPayload,
  OrderStatusChangedPayload,
} from '../events.types';

export function toOrderPlacedPayload(row: Order): OrderPlacedPayload {
  return {
    orderId: row.id,
    orderCode: row.order_code,
    userId: row.user_id,
    branchId: row.branch_id,
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    total: row.total,
  };
}

export function toOrderStatusChangedPayload(
  row: Order,
): OrderStatusChangedPayload {
  return {
    orderId: row.id,
    orderCode: row.order_code,
    userId: row.user_id,
    status: row.status,
  };
}
