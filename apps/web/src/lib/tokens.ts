const ACCESS_TOKEN_KEY = 'tableo_access_token';
const REFRESH_TOKEN_KEY = 'tableo_refresh_token';
const SESSION_MARKER_KEY = 'tableo_session_marker';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export const tokenStore = {
  setAccess(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },
  getAccess(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY); // Cleanup old leftover if any
      localStorage.removeItem(SESSION_MARKER_KEY);
    }
  },
};

export function markSession() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_MARKER_KEY, '1');
  }
}

export function clearSession() {
  tokenStore.clearTokens();
}

export function hasSessionMarker(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SESSION_MARKER_KEY) === '1';
}
