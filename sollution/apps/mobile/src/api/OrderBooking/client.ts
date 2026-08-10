import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  clearAuthSession,
  getAccessToken,
} from '@/utils/auth/session';

const ORDER_BOOKING_API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000') + '/api';

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean;
}

type RetryableAxiosRequestConfig = AxiosRequestConfig & {
  skipAuth?: boolean;
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: ORDER_BOOKING_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(async (rawConfig) => {
  const config = rawConfig as RetryableAxiosRequestConfig;
  const skipAuth = config.skipAuth;
  delete config.skipAuth;

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config as never;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const status = error.response?.status ?? 500;
    const data = error.response?.data;

    if (status === 401) {
      await clearAuthSession();
    }

    const message =
      (typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        (Array.isArray((data as { message: unknown }).message)
          ? ((data as { message: string[] }).message[0] ?? error.message)
          : String((data as { message: unknown }).message))) ||
      error.message;

    throw new ApiError(String(message), status, data);
  },
);

export async function orderBookingApiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await axiosInstance.request({
    url: endpoint,
    ...options,
  });
  return response as T;
}

export const orderBookingApiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    orderBookingApiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    orderBookingApiRequest<T>(endpoint, { ...options, method: 'POST', data }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    orderBookingApiRequest<T>(endpoint, { ...options, method: 'PUT', data }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    orderBookingApiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      data,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    orderBookingApiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
