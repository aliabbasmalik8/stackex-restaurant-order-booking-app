import { ordersApi } from '@/api/OrderBooking/modules/orders'
import type { OrderDto } from '@/api/OrderBooking/modules/orders'
import type { Order, OrderStatus } from './types'

export function mapOrder(dto: OrderDto): Order {
  return {
    ...dto,
    paymentMethod: dto.paymentMethod ?? 'cash',
    paymentStatus: dto.paymentStatus ?? 'not_required',
    stripePaymentIntentId: dto.stripePaymentIntentId ?? null,
    paidAt: dto.paidAt ?? null,
    customerAddress: dto.customerAddress ?? null,
  }
}

function sortNewestFirst(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export async function fetchAllOrders(): Promise<Order[]> {
  const rows = await ordersApi.getManage()
  return sortNewestFirst(rows.map(mapOrder))
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  return mapOrder(await ordersApi.updateStatus(orderId, { status }))
}
