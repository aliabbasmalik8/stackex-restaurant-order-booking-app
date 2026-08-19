import type { CartLine } from '@/types/cart'
import type { UserAddress } from '@/core/profile'

export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'

export type PaymentMethod = 'cash' | 'card'

export type PaymentStatus =
  | 'not_required'
  | 'unpaid'
  | 'paid'
  | 'failed'
  | 'cancelled'

export type OrderContact = {
  name: string
  name_arabic?: string
  phone: string
}

export type OrderCustomerAddress = UserAddress
export type OrderLine = CartLine

export type Order = {
  id: string
  userId: string
  orderCode: number
  status: OrderStatus
  readyAround?: string
  branchId?: string
  branchLabel: string
  branchLabel_arabic: string
  address: string
  address_arabic: string
  customerAddress: OrderCustomerAddress | null
  items: OrderLine[]
  subtotal: number
  vat: number
  total: number
  contact: OrderContact
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  stripePaymentIntentId?: string | null
  paidAt?: string | null
  createdAt: string
  updatedAt: string
}

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
  status?: OrderStatus
  paymentMethod?: PaymentMethod
  paymentStatus?: PaymentStatus
  stripePaymentIntentId?: string | null
  paidAt?: string | null
}
