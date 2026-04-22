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
  onboardComplete: boolean;
  createdAt: string;
  staffMember?: {
    branchId: string;
    role: 'manager' | 'cashier' | 'kitchen';
    branch: {
      name: string;
      restaurantId: string;
    };
  } | null;
}

interface AuthState {
  user: AuthUser | null;
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

export const initAuth = createAsyncThunk(
  'auth/init',
  async (_, { rejectWithValue }) => {
    // If no marker, we definitely don't have a session
    if (!hasSessionMarker()) return null;

    try {
      const existingToken = tokenStore.get();
      
      // 1. If we have a token, try to fetch the user immediately
      if (existingToken) {
        try {
          const { data } = await api.get('/auth/me');
          return data.data as AuthUser;
        } catch (err) {
          // Token might be expired, proceed to refresh
          console.warn('Existing token invalid, attempting refresh');
        }
      }

      // 2. Refresh the token
      const { data: r } = await api.post('/auth/refresh', null, { withCredentials: true });
      tokenStore.set(r.data.accessToken);
      
      // 3. Fetch the user with the new token
      const { data: m } = await api.get('/auth/me');
      return m.data as AuthUser;
    } catch (err) {
      // Both existing token and refresh failed → wipe session
      clearSession();
      return rejectWithValue(normalizeError(err));
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', payload, { withCredentials: true });
      tokenStore.set(data.data.accessToken);
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
      tokenStore.set(data.data.accessToken);
      markSession();
      return data.data.user as AuthUser;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  },
);

/**
 * Full logout:
 * 1. Tells the API to clear the httpOnly cookie server-side.
 * 2. Clears in-memory token + localStorage session marker.
 * 3. Reducer sets user to null.
 *
 * The API call is fire-and-forget — we always clear locally even if it fails.
 */
export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout', null, { withCredentials: true });
  } catch {
    // Ignore — always clear locally
  } finally {
    // This is the authoritative clear — wipes token + marker
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
    /** Hard client-side wipe — used as a fallback safety net */
    forceLogout(state) {
      state.user = null;
      state.error = null;
      state.initializing = false;
      clearSession();
    },
    markEmailVerified(state) {
      if (state.user) state.user.emailVerified = true;
    },
    markOnboardComplete(state) {
      if (state.user) state.user.onboardComplete = true;
    },
  },
  extraReducers: (builder) => {
    // initAuth
    builder
      .addCase(initAuth.pending,    (s) => { s.initializing = true; })
      .addCase(initAuth.fulfilled,  (s, a: PayloadAction<AuthUser | null>) => {
        s.initializing = false;
        s.user = a.payload;
      })
      .addCase(initAuth.rejected,   (s) => {
        s.initializing = false;
        s.user = null;
      });

    // login
    builder
      .addCase(login.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a: PayloadAction<AuthUser>) => {
        s.loading = false;
        s.user = a.payload;
        s.initializing = false;
      })
      .addCase(login.rejected,  (s, a) => {
        s.loading = false;
        s.error = a.payload as NormalizedError;
      });

    // register
    builder
      .addCase(register.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(register.fulfilled, (s, a: PayloadAction<AuthUser>) => {
        s.loading = false;
        s.user = a.payload;
        s.initializing = false;
      })
      .addCase(register.rejected,  (s, a) => {
        s.loading = false;
        s.error = a.payload as NormalizedError;
      });

    // logout — always clears user regardless of API success/failure
    builder
      .addCase(logoutThunk.pending,   (s) => { s.loading = true; })
      .addCase(logoutThunk.fulfilled, (s) => {
        s.user = null;
        s.error = null;
        s.loading = false;
        s.initializing = false;
      })
      .addCase(logoutThunk.rejected,  (s) => {
        // Shouldn't fire (we catch in thunk), but guard anyway
        s.user = null;
        s.error = null;
        s.loading = false;
        s.initializing = false;
      });
  },
});

export const { clearError, forceLogout, markEmailVerified, markOnboardComplete } =
  authSlice.actions;
export default authSlice.reducer;
