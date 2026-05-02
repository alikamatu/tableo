'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/stores/store';
import { initAuth } from '@/stores/authSlice';
import { hasSessionMarker } from '@/lib/tokens';

/**
 * InitAuth initializes Redux auth state on app startup.
 * Waits briefly for SessionBootstrapper to mark the session if needed,
 * then restores the user from the cookie-based session.
 */
export function InitAuth() {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // If session is already marked, dispatch immediately
    if (hasSessionMarker()) {
      dispatch(initAuth());
      return;
    }

    // Otherwise, wait up to 500ms for SessionBootstrapper to mark the session
    // (after Google OAuth callback with authenticated=true param)
    let attempts = 0;
    const maxAttempts = 5; // 5 * 100ms = 500ms

    const checkAndDispatch = () => {
      if (hasSessionMarker()) {
        dispatch(initAuth());
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkAndDispatch, 100);
      } else {
        // No session marker after timeout; dispatch anyway (will return null)
        dispatch(initAuth());
      }
    };

    checkAndDispatch();
  }, [dispatch]);

  return null;
}
