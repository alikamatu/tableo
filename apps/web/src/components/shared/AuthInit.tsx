'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/stores/store';
import { initAuth } from '@/stores/authSlice';

/**
 * Placed inside Providers (app-wide).
 * Runs initAuth exactly once — silently refreshes the access token from the
 * httpOnly cookie and rehydrates the Redux auth state.
 *
 * This is intentionally a silent background process:
 *   - No loading UI here (ProtectedRoute handles the initializing spinner)
 *   - No routing here (use-auth.ts and ProtectedRoute handle routing)
 */
export function AuthInit() {
  const dispatch = useAppDispatch();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    dispatch(initAuth());
  }, [dispatch]);

  return null;
}
