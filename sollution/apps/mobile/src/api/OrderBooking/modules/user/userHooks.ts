import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from './user';
import type {
  LoginResponse,
  LoginUserDto,
  SignupResponse,
  SignupUserDto,
  UpdateProfileDto,
} from './user.types';
import { clearAuthSession, setAuthSession } from '@/utils/auth/session';

export const USER_PROFILE_QUERY_KEY = ['user', 'profile'] as const;

export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignupUserDto) => userApi.signup(data),
    onSuccess: async (response: SignupResponse) => {
      await setAuthSession({
        token: response.token,
        refreshToken: response.refreshToken,
      });
      queryClient.setQueryData(USER_PROFILE_QUERY_KEY, response.user);
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginUserDto) => userApi.login(data),
    onSuccess: async (response: LoginResponse) => {
      await setAuthSession({
        token: response.token,
        refreshToken: response.refreshToken,
      });
      queryClient.setQueryData(USER_PROFILE_QUERY_KEY, response.user);
    },
  });
}

export function useUserProfile(enabled: boolean = true) {
  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: () => userApi.getProfile(),
    enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => userApi.updateProfile(data),
    onSuccess: (profile) => {
      queryClient.setQueryData(USER_PROFILE_QUERY_KEY, profile);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await clearAuthSession();
    },
    onSuccess: () => {
      queryClient.clear();
    },
    onError: async () => {
      await clearAuthSession();
      queryClient.clear();
    },
  });
}
