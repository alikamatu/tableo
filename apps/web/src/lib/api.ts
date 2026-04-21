import axios from 'axios';
import { tokenStore, clearSession } from './tokens';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:1000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/**
 * Clean axios instance for initialization to avoid circular interceptor dependencies.
 */
export const apiNoIntercept = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ─── Request interceptor: attach access token ─────────────────────────────────

api.interceptors.request.use((config) => {
  const url = config.url || '';
  const isRefresh = url.includes('/auth/refresh');

  const accessToken = tokenStore.getAccess();
  if (accessToken && !isRefresh) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─── Response interceptor: handle 401 refresh flow ────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest.url || '';

    // List of endpoints that should NOT trigger the auto-refresh on 401
    const skipAuthEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password'];
    const isAuthEndpoint = skipAuthEndpoints.some((endpoint) => url.includes(endpoint));

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // We use withCredentials: true to send the httpOnly refresh_token cookie
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        tokenStore.setAccess(data.data.accessToken);
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        clearSession();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
