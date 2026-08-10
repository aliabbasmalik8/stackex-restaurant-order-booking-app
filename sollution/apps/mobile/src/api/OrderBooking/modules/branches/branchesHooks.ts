import { useQuery } from '@tanstack/react-query';
import { branchesApi } from './branches';

export const BRANCHES_QUERY_KEY = ['branches'] as const;

export function useBranches() {
  return useQuery({
    queryKey: BRANCHES_QUERY_KEY,
    queryFn: () => branchesApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}
