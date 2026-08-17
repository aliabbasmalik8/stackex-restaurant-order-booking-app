import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { useBranches } from '@/api/OrderBooking/modules/branches'
import { useCategories } from '@/api/OrderBooking/modules/categories'
import { useProducts } from '@/api/OrderBooking/modules/products'
import type { Branch, MenuCategory, MenuItem } from './types'
import { type AppErrorCode, toAppError } from '@/lib/errors'

type CatalogState = {
  branches: Branch[]
  categories: MenuCategory[]
  items: MenuItem[]
  primaryBranch: Branch | null
  isLoading: boolean
  errorCode: AppErrorCode | null
  error: unknown | null
  refetch: () => Promise<void>
  getItemById: (id: string) => MenuItem | undefined
}

const CatalogContext = createContext<CatalogState | undefined>(undefined)

export const CatalogProvider = ({ children }: { children: ReactNode }) => {
  const branchesQuery = useBranches()
  const categoriesQuery = useCategories()
  const productsQuery = useProducts()
  const branches = branchesQuery.data ?? []
  const primaryBranch = branches[0] ?? null

  const categories = categoriesQuery.data ?? []
  const items = productsQuery.data ?? []

  const isLoading =
    branchesQuery.isLoading ||
    categoriesQuery.isLoading ||
    productsQuery.isLoading

  const rawError =
    branchesQuery.error ?? categoriesQuery.error ?? productsQuery.error ?? null

  const errorCode = useMemo<AppErrorCode | null>(() => {
    if (rawError) return toAppError(rawError).code
    if (
      !isLoading &&
      branchesQuery.isSuccess &&
      categoriesQuery.isSuccess &&
      productsQuery.isSuccess &&
      items.length === 0 &&
      categories.length === 0
    ) {
      return 'empty'
    }
    return null
  }, [
    rawError,
    branchesQuery.isSuccess,
    categoriesQuery.isSuccess,
    productsQuery.isSuccess,
    isLoading,
    items.length,
    categories.length,
  ])

  const load = useCallback(async () => {
    await Promise.all([
      branchesQuery.refetch(),
      categoriesQuery.refetch(),
      productsQuery.refetch(),
    ])
  }, [branchesQuery, categoriesQuery, productsQuery])

  const getItemById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items],
  )

  const value = useMemo(
    () => ({
      branches,
      categories,
      items,
      primaryBranch,
      isLoading,
      errorCode,
      error: rawError,
      refetch: load,
      getItemById,
    }),
    [
      branches,
      categories,
      items,
      primaryBranch,
      isLoading,
      errorCode,
      rawError,
      load,
      getItemById,
    ],
  )

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  )
}

export const useCatalog = () => {
  const ctx = useContext(CatalogContext)
  if (!ctx) {
    throw new Error('useCatalog must be used within CatalogProvider')
  }
  return ctx
}
