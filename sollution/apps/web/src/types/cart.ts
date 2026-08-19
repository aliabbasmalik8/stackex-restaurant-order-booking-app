import type { UserAddress } from '@/core/profile'

export type CartLine = {
  id: string
  menuItemId: string
  name: string
  name_arabic: string
  image: string
  unitPrice: number
  quantity: number
  optionsSummary: string
  optionsSummary_arabic: string
  selectedOptionIds: string[]
  specialInstructions?: string
}

export type CheckoutContact = {
  name: string
  phone: string
  address: UserAddress
  paymentMethod?: 'cash' | 'card'
  readyAround?: string
}
