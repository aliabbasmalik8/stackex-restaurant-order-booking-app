import { useCallback, useMemo } from 'react'
import { useBranchesManage } from '@/api/OrderBooking/modules/branches'
import { useProductsManage } from '@/api/OrderBooking/modules/products'
import { mapBranch } from '../api'
import { getErrorMessage } from '@/lib/getErrorMessage'
import type { Branch } from '../types'

export type BranchRow = Branch & {
  productCount: number
}

type UseBranchesResult = {
  branches: BranchRow[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useBranchesList(): UseBranchesResult {
  const branchesQuery = useBranchesManage()
  const productsQuery = useProductsManage()

  const productCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const product of productsQuery.data ?? []) {
      const key = product.branchId
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }, [productsQuery.data])

  const branches = useMemo<BranchRow[]>(() => {
    const list = (branchesQuery.data ?? []).map(mapBranch)
    return list
      .map((branch) => ({
        ...branch,
        productCount: productCounts.get(branch.id) ?? 0,
      }))
      .sort(
        (a, b) =>
          a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
      )
  }, [branchesQuery.data, productCounts])

  const refresh = useCallback(async () => {
    await Promise.all([branchesQuery.refetch(), productsQuery.refetch()])
  }, [branchesQuery, productsQuery])

  const loading = branchesQuery.isLoading || productsQuery.isLoading
  const error = branchesQuery.error
    ? getErrorMessage(branchesQuery.error, 'Failed to load branches')
    : productsQuery.error
      ? getErrorMessage(productsQuery.error, 'Failed to load products')
      : null

  return { branches, loading, error, refresh }
}
