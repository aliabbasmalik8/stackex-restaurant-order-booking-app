import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchCategories, fetchProducts } from '../api'
import type { MenuCategory, Product } from '../types'

type UseProductsResult = {
  products: Product[]
  filtered: Product[]
  categories: MenuCategory[]
  loading: boolean
  error: string | null
  search: string
  setSearch: (v: string) => void
  categoryId: string
  setCategoryId: (v: string) => void
  refresh: () => Promise<void>
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('all')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [items, cats] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
      ])
      setProducts(items)
      setCategories(cats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (categoryId !== 'all' && p.categoryId !== categoryId) return false
      if (!q) return true
      return [p.name, p.name_arabic, p.id, p.badge]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [products, search, categoryId])

  return {
    products,
    filtered,
    categories,
    loading,
    error,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    refresh,
  }
}
