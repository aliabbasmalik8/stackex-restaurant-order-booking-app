export type CartLine = {
  id: string;
  menuItemId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  optionsSummary: string;
  selectedOptionIds: string[];
};

export type PlacedOrder = {
  orderCode: string;
  readyAround: string;
  branchLabel: string;
  address: string;
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
