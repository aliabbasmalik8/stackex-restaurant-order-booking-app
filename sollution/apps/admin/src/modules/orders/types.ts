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

export type OrderLine = {
  id: string
  menuItemId?: string
  name: string
  name_arabic?: string
  image?: string
  unitPrice: number
  quantity: number
  optionsSummary?: string
  optionsSummary_arabic?: string
  selectedOptionIds?: string[]
}

export type Order = {
  id: string
  userId: string
  orderCode: string
  status: OrderStatus
  readyAround?: string
  branchId?: string
  branchLabel: string
  branchLabel_arabic: string
  address: string
  address_arabic: string
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

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'draft',
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'cancelled',
] as const

export const PAYMENT_METHODS: readonly PaymentMethod[] = ['cash', 'card'] as const

export const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  'not_required',
  'unpaid',
  'paid',
  'failed',
  'cancelled',
] as const
