import { useCallback, useEffect, useState } from 'react'
import {
  countProductsInCategory,
  deleteCategory,
  fetchCategories,
} from '../api'
import { PROTECTED_CATEGORY_IDS, type Category } from '../types'

export type CategoryRow = Category & {
  productCount: number
  protected: boolean
}

type UseCategoriesResult = {
  categories: CategoryRow[]
  loading: boolean
  error: string | null
  deletingId: string | null
  refresh: () => Promise<void>
  remove: (id: string) => Promise<{ ok: true } | { ok: false; reason: string }>
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchCategories()
      const rows = await Promise.all(
        list.map(async (cat) => ({
          ...cat,
          productCount: await countProductsInCategory(cat.id),
          protected: PROTECTED_CATEGORY_IDS.has(cat.id),
        })),
      )
      setCategories(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const remove = useCallback(
    async (id: string) => {
      setDeletingId(id)
      try {
        await deleteCategory(id)
        await refresh()
        return { ok: true as const }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to delete category'
        if (message === 'CATEGORY_IN_USE') {
          const count =
            typeof err === 'object' &&
            err !== null &&
            'count' in err &&
            typeof (err as { count: unknown }).count === 'number'
              ? (err as { count: number }).count
              : undefined
          return {
            ok: false as const,
            reason: count
              ? `IN_USE:${count}`
              : 'IN_USE',
          }
        }
        if (message === 'PROTECTED_CATEGORY') {
          return { ok: false as const, reason: 'PROTECTED' }
        }
        return { ok: false as const, reason: message }
      } finally {
        setDeletingId(null)
      }
    },
    [refresh],
  )

  return { categories, loading, error, deletingId, refresh, remove }
}
