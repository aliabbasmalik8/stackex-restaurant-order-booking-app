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

export type PlacedOrder = {
  orderCode: string;
  readyAround: string;
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
};
