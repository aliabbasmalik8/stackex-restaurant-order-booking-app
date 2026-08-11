import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/OrderBooking/modules/auth';
import type { AuthResponse, LoginUserDto } from '@/api/OrderBooking/modules/auth';
import { clearAuthSession, setAuthSession } from '@/utils/auth/session';
import { userApi } from './user';

export const USER_PROFILE_QUERY_KEY = ['user', 'profile'] as const;

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginUserDto) => authApi.login(data),
    onSuccess: (response: AuthResponse) => {
      setAuthSession({
        token: response.token,
        refreshToken: response.refreshToken,
      });
      queryClient.setQueryData(USER_PROFILE_QUERY_KEY, response.user);
    },
  });
}

export function useUserProfile(enabled = true) {
  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: () => userApi.getProfile(),
    enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      clearAuthSession();
    },
    onSuccess: () => {
      queryClient.clear();
    },
    onError: () => {
      clearAuthSession();
      queryClient.clear();
    },
  });
}
