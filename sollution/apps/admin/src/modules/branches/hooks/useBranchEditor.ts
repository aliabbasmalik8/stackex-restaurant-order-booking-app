import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import {
  useBranch,
  useUpdateBranch,
} from '@/api/OrderBooking/modules/branches'
import { emptyBranch } from '../types'
import type { Branch, BranchInput } from '../types'

type UseBranchEditorResult = {
  form: BranchInput
  setForm: Dispatch<SetStateAction<BranchInput>>
  branchId: string
  slug: string
  loading: boolean
  saving: boolean
  error: string | null
  save: () => Promise<Branch | null>
  patch: <K extends keyof BranchInput>(
    key: K,
    value: BranchInput[K],
  ) => void
}

export function useBranchEditor(idParam: string): UseBranchEditorResult {
  const [form, setForm] = useState<BranchInput>(emptyBranch())
  const [branchId, setBranchId] = useState(idParam)
  const [slug, setSlug] = useState('')
  const [hydratedFor, setHydratedFor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const branchQuery = useBranch(idParam, Boolean(idParam))
  const updateMutation = useUpdateBranch()

  const hydrated = hydratedFor === idParam

  useEffect(() => {
    if (hydratedFor === idParam) return

    if (branchQuery.isLoading) return

    if (branchQuery.error) {
      setError(
        branchQuery.error instanceof Error
          ? branchQuery.error.message
          : 'Failed to load',
      )
      setHydratedFor(idParam)
      return
    }

    if (branchQuery.data) {
      const row = branchQuery.data
      setForm({
        name: row.name,
        name_arabic: row.name_arabic,
        address: row.address,
        address_arabic: row.address_arabic,
        etaMinutes: row.etaMinutes,
        active: row.active,
        sortOrder: row.sortOrder,
      })
      setBranchId(row.id)
      setSlug(row.slug)
      setError(null)
      setHydratedFor(idParam)
      return
    }

    if (!branchQuery.isFetching) {
      setError('Branch not found')
      setHydratedFor(idParam)
    }
  }, [
    idParam,
    hydratedFor,
    branchQuery.isLoading,
    branchQuery.isFetching,
    branchQuery.data,
    branchQuery.error,
  ])

  const patch = useCallback(
    <K extends keyof BranchInput>(key: K, value: BranchInput[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const save = useCallback(async () => {
    setError(null)
    try {
      if (!form.name.trim()) {
        setError('Name is required')
        return null
      }

      const saved = await updateMutation.mutateAsync({
        id: branchId,
        data: {
          name: form.name.trim(),
          name_arabic: form.name_arabic.trim(),
          address: form.address.trim(),
          address_arabic: form.address_arabic.trim(),
          etaMinutes: Number(form.etaMinutes) || 0,
          // Active stays as loaded — deactivating branches is locked in admin for now.
          active: form.active,
          sortOrder: Number(form.sortOrder) || 0,
        },
      })

      setBranchId(saved.id)
      setSlug(saved.slug)
      return {
        id: saved.id,
        slug: saved.slug,
        name: saved.name,
        name_arabic: saved.name_arabic,
        address: saved.address,
        address_arabic: saved.address_arabic,
        etaMinutes: saved.etaMinutes,
        active: saved.active,
        sortOrder: saved.sortOrder,
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      return null
    }
  }, [branchId, form, updateMutation])

  return {
    form,
    setForm,
    branchId,
    slug,
    loading: !hydrated || branchQuery.isLoading,
    saving: updateMutation.isPending,
    error,
    save,
    patch,
  }
}
