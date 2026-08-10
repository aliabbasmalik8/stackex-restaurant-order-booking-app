import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import {
  fetchCategoryById,
  saveCategory,
} from '../api'
import { emptyCategory, slugifyCategoryId } from '../types'
import type { Category, CategoryInput } from '../types'

type UseCategoryEditorResult = {
  form: CategoryInput
  setForm: Dispatch<SetStateAction<CategoryInput>>
  categoryId: string
  setCategoryId: (id: string) => void
  isNew: boolean
  loading: boolean
  saving: boolean
  error: string | null
  save: () => Promise<Category | null>
  patch: <K extends keyof CategoryInput>(
    key: K,
    value: CategoryInput[K],
  ) => void
}

export function useCategoryEditor(idParam: string): UseCategoryEditorResult {
  const isNew = idParam === 'new'
  const [form, setForm] = useState<CategoryInput>(emptyCategory())
  const [categoryId, setCategoryId] = useState(isNew ? '' : idParam)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        if (isNew) {
          setForm(emptyCategory())
          setCategoryId('')
        } else {
          const cat = await fetchCategoryById(idParam)
          if (!mounted) return
          if (!cat) {
            setError('Category not found')
          } else {
            const { id: _id, ...rest } = cat
            setForm(rest)
            setCategoryId(cat.id)
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
    <K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const save = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const id = (
        isNew ? categoryId || slugifyCategoryId(form.label) : categoryId
      )
        .trim()
        .toLowerCase()
      if (!id) {
        setError('Category id is required')
        return null
      }
      if (!form.label.trim()) {
        setError('Label is required')
        return null
      }
      const saved = await saveCategory(id, form)
      setCategoryId(saved.id)
      return saved
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      return null
    } finally {
      setSaving(false)
    }
  }, [categoryId, form, isNew])

  return {
    form,
    setForm,
    categoryId,
    setCategoryId,
    isNew,
    loading,
    saving,
    error,
    save,
    patch,
  }
}
