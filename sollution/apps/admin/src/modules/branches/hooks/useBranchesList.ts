import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useBranchesManage } from '@/api/OrderBooking/modules/branches'
import { mapBranch } from '../api'
import { getErrorMessage } from '@/lib/getErrorMessage'
import type { Branch } from '../types'

export type BranchRow = Branch

type UseBranchesResult = {
  branches: BranchRow[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useBranchesList(): UseBranchesResult {
  const { t } = useTranslation()
  const branchesQuery = useBranchesManage()

  const branches = useMemo<BranchRow[]>(() => {
    return (branchesQuery.data ?? [])
      .map(mapBranch)
      .sort(
        (a, b) =>
          a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
      )
  }, [branchesQuery.data])

  const refresh = useCallback(async () => {
    await branchesQuery.refetch()
  }, [branchesQuery])

  const loading = branchesQuery.isLoading
  const error = branchesQuery.error
    ? getErrorMessage(branchesQuery.error, t('errors.loadBranches'))
    : null

  return { branches, loading, error, refresh }
}
