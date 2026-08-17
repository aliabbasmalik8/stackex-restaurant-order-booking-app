import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AppError } from '@/lib/errors'
import { getAppSettings } from '@/core/settings'
import type { CartLine } from '@/types/cart'

type AddLineInput = Omit<CartLine, 'id' | 'quantity'> & { quantity?: number }

interface CartState {
  items: CartLine[]
  itemCount: number
  subtotal: number
  vat: number
  total: number
  addItem: (input: AddLineInput) => void
  updateQuantity: (lineId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartState | undefined>(undefined)

const round2 = (n: number) => Math.round(n * 100) / 100

const sameOptions = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false
  const sa = [...a].sort().join('|')
  const sb = [...b].sort().join('|')
  return sa === sb
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartLine[]>([])

  const addItem = useCallback((input: AddLineInput) => {
    if (!getAppSettings().storeStatus.isAvailable) {
      throw new AppError('store_closed')
    }
    const quantity = input.quantity ?? 1
    const note = input.specialInstructions?.trim() ?? ''
    setItems((prev) => {
      const existing = prev.find(
        (line) =>
          line.menuItemId === input.menuItemId &&
          sameOptions(line.selectedOptionIds, input.selectedOptionIds) &&
          (line.specialInstructions?.trim() ?? '') === note,
      )
      if (existing) {
        return prev.map((line) =>
          line.id === existing.id
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        )
      }
      return [
        ...prev,
        {
          ...input,
          specialInstructions: note || undefined,
          id: `${input.menuItemId}_${Date.now()}`,
          quantity,
        },
      ]
    })
  }, [])

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((line) => line.id !== lineId)
      return prev.map((line) =>
        line.id === lineId ? { ...line, quantity } : line,
      )
    })
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const itemCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items],
  )
  const subtotal = useMemo(
    () =>
      round2(
        items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
      ),
    [items],
  )
  const vat = useMemo(
    () => round2(subtotal * getAppSettings().vatRate),
    [subtotal],
  )
  const total = useMemo(() => round2(subtotal + vat), [subtotal, vat])

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      vat,
      total,
      addItem,
      updateQuantity,
      clearCart,
    }),
    [items, itemCount, subtotal, vat, total, addItem, updateQuantity, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
