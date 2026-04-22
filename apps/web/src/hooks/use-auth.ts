'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { login, register, logoutThunk, clearError } from '@/stores/authSlice';
import { clearAllState } from '@/lib/tokens';
import type { NormalizedError } from '@/lib/api-error';

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, loading, error, initializing } = useAppSelector((s) => s.auth);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      const result = await dispatch(login({ email, password }));
      if (!login.fulfilled.match(result)) {
        return result.payload as NormalizedError;
      }

      const u = result.payload;
      // Route based on role and onboarding completion
      if (!u.onboardComplete) {
        router.replace('/onboarding');
      } else if (u.staffMember) {
        router.replace('/manager-dashboard');
      } else {
        router.replace('/dashboard');
      }
      return null;
    },
    [dispatch, router],
  );

  const handleRegister = useCallback(
    async (data: { email: string; password: string; fullName: string; phone?: string }) => {
      const result = await dispatch(register(data));
      if (!register.fulfilled.match(result)) {
        return result.payload as NormalizedError;
      }
      // New users always onboard first
      router.replace('/onboarding');
      return null;
    },
    [dispatch, router],
  );

  /**
   * Full logout — clears server cookie, in-memory token, localStorage marker,
   * Redux state, then hard-navigates to /login.
   *
   * We use window.location.replace (not router.replace) so the Next.js
   * client-side cache is fully discarded and no stale authenticated state leaks.
   */
  const handleLogout = useCallback(async () => {
    await dispatch(logoutThunk());
    // Aggressive clear
    clearAllState();
    // Hard navigation — wipes the React tree and all in-memory state
    window.location.replace('/login');
  }, [dispatch]);

  return {
    user,
    loading,
    initializing,
    error,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError: () => dispatch(clearError()),
  };
}
