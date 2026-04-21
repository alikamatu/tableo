'use client';

import * as React from 'react';
import { Mail, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { resendVerification } from '@/stores/authSlice';

export function VerificationBanner() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [dismissed, setDismissed] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  if (!user || user.emailVerified || dismissed) return null;

  const handleResend = async () => {
    setLoading(true);
    await dispatch(resendVerification());
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-warning/8 text-warning text-sm border-b border-warning/20">
      <Mail size={15} className="flex-shrink-0" />
      <span className="flex-1 text-xs">
        {sent ? (
          'Verification email sent — check your inbox.'
        ) : (
          <>
            Please verify your email address.{' '}
            <button
              onClick={handleResend}
              disabled={loading}
              className="underline hover:no-underline font-medium disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Sending…' : 'Resend email'}
            </button>
          </>
        )}
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
