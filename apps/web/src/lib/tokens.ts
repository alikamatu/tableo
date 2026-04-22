/**
 * Token strategy — industry standard:
 *
 *   accessToken  → in-memory only (lost on page refresh — intentional, silent refresh restores it)
 *   refreshToken → httpOnly cookie set by the API (JS can never read it)
 *   sessionMarker → single localStorage key "1" — only tells us a session *might* exist,
 *                   never contains a token value. Used to decide whether to attempt silent refresh.
 *
 * On logout: clear memory + localStorage marker. The API clears the httpOnly cookie server-side.
 * On page reload: memory is empty → check marker → attempt silent refresh → restore access token.
 */

const SESSION_KEY = 'tableo_session';
const TOKEN_KEY = 'tableo_access_token';

export const tokenStore = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },
};

// ─── Session marker (localStorage — no token value stored) ───────────────────

export function markSession(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(SESSION_KEY, '1'); } catch {}
}

export function clearSession(): void {
  tokenStore.clear();
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SESSION_KEY);
      // Legacy cleanup
      localStorage.removeItem('tableo_refresh_token');
      localStorage.removeItem('tableo_session_marker');
    } catch {}
  }
}

export function hasSessionMarker(): boolean {
  if (typeof window === 'undefined') return false;
  try { return localStorage.getItem(SESSION_KEY) === '1'; } catch { return false; }
}

/**
 * Aggressive clear-all — used on logout to ensure no state persists.
 */
export function clearAllState(): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Clear tokens and markers
    clearSession();
    
    // 2. Clear all other session data
    sessionStorage.clear();

    // 3. Clear all non-httpOnly cookies via JS
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (!name) continue;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      // Also try clearing with current domain just in case
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    }
  } catch (err) {
    console.error('Error clearing storage:', err);
  }
}
