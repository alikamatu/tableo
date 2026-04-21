'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/stores/store';
import { forceLogout } from '@/stores/authSlice';

/**
 * Client-side auth gate.
 * The middleware already handles the redirect for unauthenticated users,
 * but this component provides a second layer and handles the
 * initializing state (silent token refresh in progress).
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    // If we're stuck in 'initializing' for too long, force it to false (safety fallback)
    const timer = setTimeout(() => {
      if (initializing && !user) {
        console.warn('Auth initialization timed out, forcing fallback UI.');
        dispatch(forceLogout()); // This will set initializing=false (via extraReducers or manual logic)
      }
    }, 5000);

    if (!initializing && !user) {
      router.replace('/login');
    }

    return () => clearTimeout(timer);
  }, [initializing, user, router, dispatch]);

  // If we already have a user (from login/register), we don't need to wait for initAuth.
  if (user) return <>{children}</>;

  // While the silent refresh is in flight and we don't have a user, render a loader.
  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Restoring your session...
          </p>
        </div>
      </div>
    );
  }

  // initAuth finished and user is null — redirect happening in effect above
  return null;
}
