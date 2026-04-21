import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { tokenStore, markSession, clearSession, hasSessionMarker } from '@/lib/tokens';
import { normalizeError, type NormalizedError } from '@/lib/api-error';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  emailVerified: boolean;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  /** true while the silent token-refresh runs on mount */
  initializing: boolean;
  loading: boolean;
  error: NormalizedError | null;
}

const initialState: AuthState = {
  user: null,
  initializing: true,
  loading: false,
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

/**
 * Called once on app mount.
 * If a session marker exists in localStorage, attempts a silent refresh
 * via the httpOnly cookie, then fetches /me.
 */
export const initAuth = createAsyncThunk(
  'auth/init',
  async (_, { rejectWithValue }) => {
    if (!hasSessionMarker()) return null;
    try {
      // Use api instance which handles 401s via interceptor
      // If interceptor fails refresh, it already calls clearSession()
      const { data: r } = await api.post('/auth/refresh', {}, { withCredentials: true });
      tokenStore.setAccess(r.data.accessToken);
      const { data: m } = await api.get('/auth/me');
      return m.data as AuthUser;
    } catch (err) {
      const error = normalizeError(err);
      // Only clear session if it's a definitive auth failure
      if (error.statusCode === 401 || error.statusCode === 403) {
        clearSession();
      }
      return rejectWithValue(error);
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', payload, { withCredentials: true });
      tokenStore.setAccess(data.data.accessToken);
      markSession();
      return data.data.user as AuthUser;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    payload: { email: string; password: string; fullName: string; phone?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post('/auth/register', payload, { withCredentials: true });
      tokenStore.setAccess(data.data.accessToken);
      markSession();
      return data.data.user as AuthUser;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  },
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout', null, { withCredentials: true });
  } finally {
    tokenStore.clearTokens();
    clearSession();
  }
});

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/resend-verification');
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    forceLogout(state) {
      state.user = null;
      state.error = null;
    },
    /** Called locally after successful email verification */
    markEmailVerified(state) {
      if (state.user) state.user.emailVerified = true;
    },
  },
  extraReducers: (builder) => {
    // initAuth
    builder
      .addCase(initAuth.pending, (s) => { s.initializing = true; })
      .addCase(initAuth.fulfilled, (s, a: PayloadAction<AuthUser | null>) => {
        s.initializing = false;
        s.user = a.payload;
      })
      .addCase(initAuth.rejected, (s) => {
        s.initializing = false;
        s.user = null;
      });

    // login
    builder
      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a: PayloadAction<AuthUser>) => {
        s.loading = false;
        s.user = a.payload;
        s.initializing = false;
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as NormalizedError;
      });

    // register
    builder
      .addCase(register.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(register.fulfilled, (s, a: PayloadAction<AuthUser>) => {
        s.loading = false;
        s.user = a.payload;
        s.initializing = false;
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as NormalizedError;
      });

    // logout
    builder.addCase(logoutThunk.fulfilled, (s) => {
      s.user = null;
      s.error = null;
    });
  },
});

export const { clearError, forceLogout, markEmailVerified } = authSlice.actions;
export default authSlice.reducer;
