import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError, ApiResponse } from '../types/api';
import { useAuthStore } from '../stores/auth-store';
import { AuthResponse } from '../features/auth/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Request ID and Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach authorization bearer token if logged in
    const token = useAuthStore.getState().accessToken;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Generate a lightweight correlation ID if not present
    if (!config.headers['x-request-id']) {
      const randomId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      config.headers['x-request-id'] = randomId;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Concurrency-safe Token Refresh Queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Token Refresh on 401 & Error Normalization
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Handle 401 Unauthorized with Automatic Refresh Token Rotation
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const isAuthEndpoint =
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/seed-admin');

      if (!isAuthEndpoint) {
        if (isRefreshing) {
          // If a refresh is already in progress, enqueue this request
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const currentRefreshToken = useAuthStore.getState().refreshToken;

        if (currentRefreshToken) {
          try {
            // Call refresh endpoint using raw axios to avoid interceptor recursion
            const refreshResponse = await axios.post<ApiResponse<AuthResponse>>(
              `${API_BASE_URL}/auth/refresh`,
              { refreshToken: currentRefreshToken },
              { headers: { 'Content-Type': 'application/json' } },
            );

            const authData = refreshResponse.data.data;
            const newAccessToken = authData.accessToken;
            const newRefreshToken = authData.refreshToken;

            // Update Auth Store with rotated tokens
            useAuthStore.getState().setTokens({
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            });

            processQueue(null, newAccessToken);

            // Retry original request with newly issued access token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          } catch (refreshErr) {
            // Refresh token has expired, been revoked, or is invalid
            processQueue(refreshErr, null);
            useAuthStore.getState().clearAuth();

            const isTestEnv =
              import.meta.env?.MODE === 'test' ||
              import.meta.env?.TEST === true ||
              (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test');

            if (!isTestEnv && typeof window !== 'undefined' && window.location && window.location.pathname !== '/login') {
              try {
                window.location.href = '/login';
              } catch {
                // Ignore navigation in non-browser or test environments
              }
            }
            return Promise.reject(normalizeError(error));
          } finally {
            isRefreshing = false;
          }
        } else {
          // No refresh token available, session is unrecoverable
          useAuthStore.getState().clearAuth();
          const isTestEnv =
            import.meta.env?.MODE === 'test' ||
            import.meta.env?.TEST === true ||
            (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test');

          if (!isTestEnv && typeof window !== 'undefined' && window.location && window.location.pathname !== '/login') {
            try {
              window.location.href = '/login';
            } catch {
              // Ignore navigation in non-browser or test environments
            }
          }
        }
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

function normalizeError(error: AxiosError<ApiError>): ApiError {
  if (error.response && error.response.data) {
    const serverError = error.response.data;
    return {
      statusCode: error.response.status,
      code: serverError.code || 'API_ERROR',
      message: serverError.message || 'An unexpected error occurred.',
      details: serverError.details || [],
      requestId: serverError.requestId || (error.response.headers?.['x-request-id'] as string),
      timestamp: serverError.timestamp || new Date().toISOString(),
    };
  }

  return {
    statusCode: error.status || 500,
    code: 'NETWORK_ERROR',
    message: error.message || 'Network communication error. Please check your connection.',
    details: [],
    timestamp: new Date().toISOString(),
  };
}
