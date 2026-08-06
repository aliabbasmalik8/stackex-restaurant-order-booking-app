import type { UserAddress } from '@/modules/profile';

export type CartLine = {
  id: string;
  menuItemId: string;
  name: string;
  name_arabic: string;
  image: string;
  unitPrice: number;
  quantity: number;
  optionsSummary: string;
  optionsSummary_arabic: string;
  selectedOptionIds: string[];
  /** Kitchen / pickup note from the guest (optional). */
  specialInstructions?: string;
};

/** @deprecated Prefer `Order` from `@/modules/orders` — kept for confirmation UI. */
export type PlacedOrder = {
  id?: string;
  orderCode: string;
  status?: string;
  readyAround?: string;
  branchLabel: string;
  branchLabel_arabic: string;
  address: string;
  address_arabic: string;
  items: CartLine[];
  subtotal: number;
  vat: number;
  total: number;
  createdAt: string;
};

export type CheckoutContact = {
  name: string;
  phone: string;
  /** Customer address for this order (copied onto the order doc). */
  address: UserAddress;
};
