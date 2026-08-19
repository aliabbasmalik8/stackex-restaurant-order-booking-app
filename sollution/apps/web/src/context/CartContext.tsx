import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/context/AuthContext'
import { AppError } from '@/lib/errors'
import { pickupCustomerAddress, useCatalog } from '@/core/catalog'
import { createOrder, type Order } from '@/core/orders'
import { getAppSettings } from '@/core/settings'
import { queryClient } from '@/api/OrderBooking/queryClient'
import { ORDERS_QUERY_KEY } from '@/api/OrderBooking/modules/orders'
import type { CartLine, CheckoutContact } from '@/types/cart'
import {
  cartOwnerId,
  catalogFingerprint,
  readOwnerCart,
  sanitizeCartLines,
  writeOwnerCart,
} from '@/utils/cartStorage'

type AddLineInput = Omit<CartLine, 'id' | 'quantity'> & { quantity?: number }

interface CartState {
  items: CartLine[]
  itemCount: number
  subtotal: number
  vat: number
  total: number
  lastOrder: Order | null
  pendingPaymentOrder: Order | null
  addItem: (input: AddLineInput) => void
  updateQuantity: (lineId: string, quantity: number) => void
  clearCart: () => void
  removeItemsByMenuItemIds: (menuItemIds: string[]) => void
  placeOrder: (contact: CheckoutContact) => Promise<Order>
  setLastOrder: (order: Order | null) => void
  confirmPendingPaymentPaid: () => void
}

const CartContext = createContext<CartState | undefined>(undefined)

const round2 = (n: number) => Math.round(n * 100) / 100

const sameOptions = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false
  const sa = [...a].sort().join('|')
  const sb = [...b].sort().join('|')
  return sa === sb
}

function formatReadyAround(from = new Date(), minutes = 20): string {
  const d = new Date(from.getTime() + minutes * 60_000)
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { items: catalogItems, isLoading: catalogLoading, primaryBranch, branches } =
    useCatalog()
  const { user, authReady } = useAuth()
  const ownerId = cartOwnerId(user?.id)
  const [items, setItems] = useState<CartLine[]>([])
  const [hydratedFor, setHydratedFor] = useState<string | null>(null)
  const [lastOrder, setLastOrder] = useState<Order | null>(null)
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState<Order | null>(
    null,
  )
  const itemsRef = useRef(items)
  itemsRef.current = items
  const hydratedForRef = useRef(hydratedFor)
  hydratedForRef.current = hydratedFor
  const catalogRef = useRef(catalogItems)
  catalogRef.current = catalogItems
  const catalogRevision = useMemo(
    () => catalogFingerprint(catalogItems),
    [catalogItems],
  )

  useEffect(() => {
    if (!authReady || catalogLoading) return
    const previousOwner = hydratedForRef.current
    const catalog = catalogRef.current

    if (previousOwner && previousOwner !== ownerId) {
      writeOwnerCart(previousOwner, itemsRef.current)
      setItems(sanitizeCartLines(readOwnerCart(ownerId), catalog))
      setHydratedFor(ownerId)
      return
    }

    if (previousOwner === ownerId) {
      setItems((prev) => sanitizeCartLines(prev, catalog))
      return
    }

    setItems(sanitizeCartLines(readOwnerCart(ownerId), catalog))
    setHydratedFor(ownerId)
  }, [authReady, catalogLoading, ownerId, catalogRevision])

  useEffect(() => {
    if (!authReady || catalogLoading || hydratedFor !== ownerId) return
    writeOwnerCart(ownerId, items)
  }, [authReady, catalogLoading, hydratedFor, ownerId, items])

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

  const removeItemsByMenuItemIds = useCallback((menuItemIds: string[]) => {
    if (menuItemIds.length === 0) return
    const banned = new Set(menuItemIds)
    setItems((prev) => prev.filter((line) => !banned.has(line.menuItemId)))
  }, [])

  const placeOrder = useCallback(
    async (contact: CheckoutContact): Promise<Order> => {
      if (!getAppSettings().storeStatus.isAvailable) {
        throw new AppError('store_closed')
      }
      if (!user) {
        throw new AppError('permission')
      }
      if (items.length === 0) {
        throw new AppError('empty')
      }

      const settings = getAppSettings()
      const subtotal = round2(
        items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
      )
      const vat = round2(subtotal * settings.vatRate)
      const total = round2(subtotal + vat)
      const branchName = primaryBranch?.name ?? 'Branch'
      const branchNameAr = primaryBranch?.name_arabic ?? branchName
      const eta = primaryBranch?.etaMinutes ?? 20
      const pickupAddress =
        contact.address.line1.trim() && contact.address.city.trim()
          ? contact.address
          : pickupCustomerAddress(primaryBranch, branches)

      const order = await createOrder({
        readyAround: contact.readyAround ?? formatReadyAround(new Date(), eta),
        branchId: primaryBranch?.id,
        branchLabel: `${settings.businessName} · ${branchName}`,
        branchLabel_arabic: `${settings.businessName} · ${branchNameAr}`,
        address: primaryBranch?.address ?? '',
        address_arabic: primaryBranch?.address_arabic ?? '',
        customerAddress: pickupAddress,
        items: items.map((line) => {
          const next = { ...line }
          if (!next.specialInstructions?.trim()) {
            delete next.specialInstructions
          }
          return next
        }),
        subtotal,
        vat,
        total,
        contact: {
          name: contact.name,
          phone: contact.phone,
        },
        paymentMethod: contact.paymentMethod ?? 'cash',
      })

      const isCard = (contact.paymentMethod ?? 'cash') === 'card'
      if (isCard) {
        setPendingPaymentOrder(order)
        return order
      }

      setPendingPaymentOrder(null)
      setLastOrder(order)
      setItems([])
      void queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      return order
    },
    [items, primaryBranch, branches, user],
  )

  const confirmPendingPaymentPaid = useCallback(() => {
    if (!pendingPaymentOrder) return
    const paid: Order = {
      ...pendingPaymentOrder,
      status: 'pending',
      paymentStatus: 'paid',
      paidAt: new Date().toISOString(),
    }
    setPendingPaymentOrder(null)
    setLastOrder(paid)
    setItems([])
    void queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
  }, [pendingPaymentOrder])

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
      lastOrder,
      pendingPaymentOrder,
      addItem,
      updateQuantity,
      clearCart,
      removeItemsByMenuItemIds,
      placeOrder,
      setLastOrder,
      confirmPendingPaymentPaid,
    }),
    [
      items,
      itemCount,
      subtotal,
      vat,
      total,
      lastOrder,
      pendingPaymentOrder,
      addItem,
      updateQuantity,
      clearCart,
      removeItemsByMenuItemIds,
      placeOrder,
      confirmPendingPaymentPaid,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
