import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStore, clearSession } from './tokens';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // send httpOnly refresh_token cookie on every request
  timeout: 15_000,
});

// ─── Request: attach in-memory access token ───────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get();
  // Don't attach token to the refresh request itself — it depends on the httpOnly cookie
  const isRefresh = config.url?.includes('/auth/refresh');
  
  if (token && !isRefresh) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// ─── Response: silent token refresh on 401 ────────────────────────────────────

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Endpoints that must never trigger a refresh loop
const NO_REFRESH = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
];

let refreshing: Promise<void> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;

    const isAuthEndpoint = NO_REFRESH.some((e) => original?.url?.includes(e));
    const shouldRetry =
      error.response?.status === 401 &&
      !original?._retry &&
      !isAuthEndpoint;

    if (!shouldRetry) return Promise.reject(error);

    original!._retry = true;

    // Serialise concurrent refresh calls — only one in-flight at a time
    if (!refreshing) {
      refreshing = (async () => {
        try {
          // httpOnly cookie carries the refresh token automatically (withCredentials: true)
          const { data } = await axios.post(
            `${BASE_URL}/auth/refresh`,
            null,
            { withCredentials: true },
          );
          tokenStore.set(data.data.accessToken);
        } catch {
          // Refresh failed — clear everything and force re-login
          clearSession();
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            window.location.replace('/login');
          }
          throw error;
        } finally {
          refreshing = null;
        }
      })();
    }

    await refreshing;
    return api(original!);
  },
);

export default api;
