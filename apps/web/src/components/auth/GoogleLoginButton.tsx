'use client';

import * as React from 'react';
import { SocialAuthButton } from './SocialAuthButton';
import { markSession } from '@/lib/tokens';

export function GoogleLoginButton({ label = 'Continue with Google' }: { label?: string }) {
  const handleLogin = () => {
    // Pre-mark session so InitAuth attempts refresh right after OAuth redirect.
    // If OAuth fails/cancels, initAuth will clear the marker on refresh failure.
    markSession();

    // Navigate to the API endpoint for Google login
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <SocialAuthButton
      onClick={handleLogin}
      icon={
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.85 2.21c1.67-1.53 2.63-3.79 2.63-6.47z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.85-2.21c-.79.53-1.8.85-3.11.85-2.39 0-4.41-1.61-5.14-3.77L1.01 13.9C2.49 16.8 5.51 18 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.86 10.74c-.19-.53-.3-1.1-.3-1.74s.11-1.21.3-1.74L1.01 4.51C.37 5.86 0 7.39 0 9s.37 3.14 1.01 4.49l2.85-2.75z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15.01 2.3C13.46.86 11.42 0 9 0 5.51 0 2.49 1.2 1.01 4.1L3.86 6.84c.73-2.15 2.75-3.26 5.14-3.26z"
          />
        </svg>
      }
    >
      {label}
    </SocialAuthButton>
  );
}
