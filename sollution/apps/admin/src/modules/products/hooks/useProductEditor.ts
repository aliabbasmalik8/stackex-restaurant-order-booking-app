import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import {
  fetchBranches,
  fetchCategories,
  fetchProductById,
  saveProduct,
  slugifyProductId,
} from '../api'
import { emptyProduct } from '../types'
import type { Branch, MenuCategory, Product, ProductInput } from '../types'

type UseProductEditorResult = {
  form: ProductInput
  setForm: Dispatch<SetStateAction<ProductInput>>
  productId: string
  setProductId: (id: string) => void
  isNew: boolean
  categories: MenuCategory[]
  branches: Branch[]
  loading: boolean
  saving: boolean
  error: string | null
  save: () => Promise<Product | null>
  patch: <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => void
}

export function useProductEditor(idParam: string): UseProductEditorResult {
  const isNew = idParam === 'new'
  const [form, setForm] = useState<ProductInput>(emptyProduct())
  const [productId, setProductId] = useState(isNew ? '' : idParam)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const [cats, brs] = await Promise.all([
          fetchCategories(),
          fetchBranches(),
        ])
        if (!mounted) return
        setCategories(cats.filter((c) => c.id !== 'all'))
        setBranches(brs)

        if (isNew) {
          setForm({
            ...emptyProduct(),
            categoryId: cats.find((c) => c.id !== 'all')?.id ?? '',
            branchId: brs[0]?.id ?? '',
            sortOrder: 0,
          })
          setProductId('')
        } else {
          const product = await fetchProductById(idParam)
          if (!mounted) return
          if (!product) {
            setError('Product not found')
          } else {
            const { id: _id, ...rest } = product
            setForm(rest)
            setProductId(product.id)
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [idParam, isNew])

  const patch = useCallback(
    <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const save = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const id = (isNew ? productId || slugifyProductId(form.name) : productId)
        .trim()
        .toLowerCase()
      if (!id) {
        setError('Product id is required')
        return null
      }
      if (!form.name.trim()) {
        setError('Name is required')
        return null
      }
      if (!form.categoryId.trim()) {
        setError('Category is required')
        return null
      }
      const saved = await saveProduct(id, form)
      setProductId(saved.id)
      return saved
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      return null
    } finally {
      setSaving(false)
    }
  }, [form, isNew, productId])

  return {
    form,
    setForm,
    productId,
    setProductId,
    isNew,
    categories,
    branches,
    loading,
    saving,
    error,
    save,
    patch,
  }
}
