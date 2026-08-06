import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { BRANCH, VAT_RATE } from '@/data/mockMenu';
import { brand } from '@/theme';
import type { CartLine, CheckoutContact, PlacedOrder } from '@/types/cart';

type AddLineInput = Omit<CartLine, 'id' | 'quantity'> & { quantity?: number };

interface CartState {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  vat: number;
  total: number;
  lastOrder: PlacedOrder | null;
  activeOrder: PlacedOrder | null;
  addItem: (input: AddLineInput) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (contact: CheckoutContact) => PlacedOrder;
}

const CartContext = createContext<CartState | undefined>(undefined);

const round2 = (n: number) => Math.round(n * 100) / 100;

const sameOptions = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const sa = [...a].sort().join('|');
  const sb = [...b].sort().join('|');
  return sa === sb;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartLine[]>([]);
  const [lastOrder, setLastOrder] = useState<PlacedOrder | null>(null);
  const [activeOrder, setActiveOrder] = useState<PlacedOrder | null>(null);

  const addItem = useCallback((input: AddLineInput) => {
    const quantity = input.quantity ?? 1;
    setItems((prev) => {
      const existing = prev.find(
        (line) =>
          line.menuItemId === input.menuItemId &&
          sameOptions(line.selectedOptionIds, input.selectedOptionIds),
      );
      if (existing) {
        return prev.map((line) =>
          line.id === existing.id
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        );
      }
      return [
        ...prev,
        {
          ...input,
          id: `${input.menuItemId}_${Date.now()}`,
          quantity,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((line) => line.id !== lineId);
      return prev.map((line) =>
        line.id === lineId ? { ...line, quantity } : line,
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const placeOrder = useCallback(
    (contact: CheckoutContact): PlacedOrder => {
      void contact;
      const subtotal = round2(
        items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
      );
      const vat = round2(subtotal * VAT_RATE);
      const total = round2(subtotal + vat);
      const n = Math.floor(8 + Math.random() * 20);
      const order: PlacedOrder = {
        orderCode: `${brand.monogram}-${String(n).padStart(2, '0')}`,
        readyAround: '7:55 PM',
        branchLabel: `${brand.name} · ${BRANCH.name}`,
        address: BRANCH.address,
        items: [...items],
        subtotal,
        vat,
        total,
        createdAt: new Date().toISOString(),
      };
      setLastOrder(order);
      setActiveOrder(order);
      setItems([]);
      return order;
    },
    [items],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () =>
      round2(
        items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
      ),
    [items],
  );
  const vat = useMemo(() => round2(subtotal * VAT_RATE), [subtotal]);
  const total = useMemo(() => round2(subtotal + vat), [subtotal, vat]);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      vat,
      total,
      lastOrder,
      activeOrder,
      addItem,
      updateQuantity,
      clearCart,
      placeOrder,
    }),
    [
      items,
      itemCount,
      subtotal,
      vat,
      total,
      lastOrder,
      activeOrder,
      addItem,
      updateQuantity,
      clearCart,
      placeOrder,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
