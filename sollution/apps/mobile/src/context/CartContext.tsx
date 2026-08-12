import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import { AppError } from '@/lib/errors';
import { useCatalog } from '@/core/catalog';
import { createOrder, type Order } from '@/core/orders';
import { getAppSettings } from '@/core/settings';
import type { CartLine, CheckoutContact } from '@/types/cart';

type AddLineInput = Omit<CartLine, 'id' | 'quantity'> & { quantity?: number };

interface CartState {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  vat: number;
  total: number;
  lastOrder: Order | null;
  activeOrder: Order | null;
  addItem: (input: AddLineInput) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  /** Persist via Nest POST /orders. Cash clears cart; card keeps cart until paid. */
  placeOrder: (contact: CheckoutContact) => Promise<Order>;
  /** Prefer an order for the confirmation / track screen (paid / cash only). */
  setLastOrder: (order: Order | null) => void;
}

const CartContext = createContext<CartState | undefined>(undefined);

const round2 = (n: number) => Math.round(n * 100) / 100;

const sameOptions = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const sa = [...a].sort().join('|');
  const sb = [...b].sort().join('|');
  return sa === sb;
};

function formatReadyAround(from = new Date(), minutes = 20): string {
  const d = new Date(from.getTime() + minutes * 60_000);
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { primaryBranch } = useCatalog();
  const { user } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const addItem = useCallback((input: AddLineInput) => {
    if (!getAppSettings().storeStatus.isAvailable) {
      throw new AppError('store_closed');
    }
    const quantity = input.quantity ?? 1;
    const note = input.specialInstructions?.trim() ?? '';
    setItems((prev) => {
      const existing = prev.find(
        (line) =>
          line.menuItemId === input.menuItemId &&
          sameOptions(line.selectedOptionIds, input.selectedOptionIds) &&
          (line.specialInstructions?.trim() ?? '') === note,
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
          specialInstructions: note || undefined,
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
    async (contact: CheckoutContact): Promise<Order> => {
      if (!getAppSettings().storeStatus.isAvailable) {
        throw new AppError('store_closed');
      }
      if (!user) {
        throw new AppError('permission');
      }
      if (items.length === 0) {
        throw new AppError('empty');
      }

      const settings = getAppSettings();
      const subtotal = round2(
        items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
      );
      const vat = round2(subtotal * settings.vatRate);
      const total = round2(subtotal + vat);
      const n = Math.floor(8 + Math.random() * 20);
      const branchName = primaryBranch?.name ?? 'Branch';
      const branchNameAr = primaryBranch?.name_arabic ?? branchName;
      const order = await createOrder({
        orderCode: `${settings.orderPrefix}-${String(n).padStart(2, '0')}`,
        readyAround: formatReadyAround(),
        branchId: primaryBranch?.id,
        branchLabel: `${settings.businessName} · ${branchName}`,
        branchLabel_arabic: `${settings.businessName} · ${branchNameAr}`,
        address: primaryBranch?.address ?? '',
        address_arabic: primaryBranch?.address_arabic ?? '',
        customerAddress: contact.address,
        items: items.map((line) => {
          const next = { ...line };
          if (!next.specialInstructions?.trim()) {
            delete next.specialInstructions;
          }
          return next;
        }),
        subtotal,
        vat,
        total,
        contact: {
          name: contact.name,
          phone: contact.phone,
        },
        paymentMethod: contact.paymentMethod ?? 'cash',
      });

      const isCard = (contact.paymentMethod ?? 'cash') === 'card';
      if (isCard) {
        // Unpaid draft lives on the server + payment route param only.
        // Keep cart so Back can edit and place again (new draft).
        return order;
      }

      setLastOrder(order);
      setActiveOrder(order);
      setItems([]);
      return order;
    },
    [items, primaryBranch, user],
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
  const vat = useMemo(
    () => round2(subtotal * getAppSettings().vatRate),
    [subtotal],
  );
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
      setLastOrder,
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
