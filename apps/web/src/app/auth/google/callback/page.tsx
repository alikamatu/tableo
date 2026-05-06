'use client';

/**
 * Google OAuth callback page.
 *
 * After Google → API → redirect here, the httpOnly refresh_token cookie is
 * already set on the API domain.  This PUBLIC page:
 *   1. Marks the session (sets has_session + routing cookies on the Vercel domain)
 *   2. Calls initAuth() which uses the refresh_token via withCredentials CORS
 *   3. Navigates to the correct destination once auth is confirmed
 *
 * It is intentionally PUBLIC in middleware so the edge runtime never blocks it
 * before client-side code runs.
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/stores/store';
import { initAuth } from '@/stores/authSlice';
import { markSession } from '@/lib/tokens';

export default function GoogleCallbackPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      // Mark session immediately so initAuth() proceeds past the hasSessionMarker() gate
      markSession();

      const result = await dispatch(initAuth());

      if (initAuth.fulfilled.match(result) && result.payload) {
        const user = result.payload;
        if (!user.onboardComplete) {
          router.replace('/onboarding');
        } else if (user.staffMember) {
          router.replace('/manager-dashboard');
        } else {
          router.replace('/dashboard');
        }
      } else {
        // refresh or /auth/me failed — send back to login with an indicator
        router.replace('/login?error=google_auth_failed');
      }
    })();
  }, [dispatch, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-sm text-muted">Signing you in…</p>
      </div>
    </div>
  );
}
