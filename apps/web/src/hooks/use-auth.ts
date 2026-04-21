'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import {
  login,
  register,
  logoutThunk,
  initAuth,
  clearError,
} from '@/stores/authSlice';
import type { NormalizedError } from '@/lib/api-error';

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, loading, error, initializing } = useAppSelector((s) => s.auth);

  // Auth initialization is handled globally by the AuthInit component in Providers
  // This hook now just provides access to the auth state and actions.

  const handleLogin = useCallback(
    async (email: string, password: string, redirectTo: string | null = '/dashboard') => {
      const result = await dispatch(login({ email, password }));
      if (login.fulfilled.match(result)) {
        if (redirectTo) router.replace(redirectTo);
        return null;
      }
      return result.payload as NormalizedError;
    },
    [dispatch, router],
  );

  const handleRegister = useCallback(
    async (
      data: { email: string; password: string; fullName: string; phone?: string },
      redirectTo: string | null = '/dashboard',
    ) => {
      const result = await dispatch(register(data));
      if (register.fulfilled.match(result)) {
        if (redirectTo) router.replace(redirectTo);
        return null;
      }
      return result.payload as NormalizedError;
    },
    [dispatch, router],
  );

  const handleLogout = useCallback(async () => {
    await dispatch(logoutThunk());
    router.replace('/login');
  }, [dispatch, router]);

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
