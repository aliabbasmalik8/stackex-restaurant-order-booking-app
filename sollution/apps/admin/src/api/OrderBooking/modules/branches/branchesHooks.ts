import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { branchesApi } from './branches';
import type { UpdateBranchDto } from './branches.types';

export const BRANCHES_QUERY_KEY = ['branches'] as const;
export const BRANCHES_MANAGE_QUERY_KEY = ['branches', 'manage'] as const;

/** Active branches (product forms / guest-shaped lists). */
export function useBranches() {
  return useQuery({
    queryKey: BRANCHES_QUERY_KEY,
    queryFn: () => branchesApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Admin list including inactive. */
export function useBranchesManage() {
  return useQuery({
    queryKey: BRANCHES_MANAGE_QUERY_KEY,
    queryFn: () => branchesApi.getManage(),
    staleTime: 60 * 1000,
  });
}

export function useBranch(id: string, enabled = true) {
  return useQuery({
    queryKey: [...BRANCHES_QUERY_KEY, id] as const,
    queryFn: () => branchesApi.getById(id),
    enabled: enabled && Boolean(id),
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchDto }) =>
      branchesApi.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: BRANCHES_MANAGE_QUERY_KEY,
      });
    },
  });
}
