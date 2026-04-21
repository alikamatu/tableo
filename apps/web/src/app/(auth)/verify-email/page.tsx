'use client';

import * as React from 'react';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAlert } from '@/components/ui/Alert';
import api from '@/lib/api';
import { AuthShell } from '@/components/auth/AuthShell';

type State = 'verifying' | 'success' | 'already_verified' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { show, node: alertNode } = useAlert();

  const [state, setState] = React.useState<State>(token ? 'verifying' : 'error');
  const [errorMsg, setErrorMsg] = React.useState('This link is invalid or has expired.');
  const hasRun = React.useRef(false);

  React.useEffect(() => {
    if (hasRun.current || !token) return;
    hasRun.current = true;

    api
      .get(`/auth/verify-email?token=${token}`)
      .then(({ data }) => {
        const msg: string = data?.data?.message ?? '';
        setState(msg.toLowerCase().includes('already') ? 'already_verified' : 'success');
        show('success', 'Email verified successfully!');
      })
      .catch((err) => {
        const msg = err?.response?.data?.message ?? 'This link is invalid or has expired.';
        setErrorMsg(msg);
        setState('error');
        show('error', msg);
      });
  }, [token, show]);

  return (
    <AuthShell heading="Email verification" subheading="">
      {state === 'verifying' && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <Loader2 size={28} className="text-brand animate-spin" />
          <p className="text-sm text-muted">Verifying your email address…</p>
        </div>
      )}

      {state === 'success' && (
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle size={22} className="text-success" />
          </div>
          <div>
            <p className="text-sm font-medium text-fg">Email verified!</p>
            <p className="text-sm text-muted mt-1">Your account is now fully active. Welcome to Tableo.</p>
          </div>
          <Button className="w-full mt-2" size="lg" onClick={() => router.push('/restaurants')}>
            Go to dashboard
          </Button>
        </div>
      )}

      {state === 'already_verified' && (
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center">
            <CheckCircle size={22} className="text-brand" />
          </div>
          <p className="text-sm text-muted">This email is already verified. You're good to go.</p>
          <Button className="w-full" size="lg" onClick={() => router.push('/restaurants')}>
            Go to dashboard
          </Button>
        </div>
      )}

      {state === 'error' && (
        <div className="flex flex-col items-center text-center gap-5 py-2">
          <div className="h-12 w-12 rounded-full bg-danger/10 flex items-center justify-center">
            <XCircle size={22} className="text-danger" />
          </div>
          <Alert variant="error" message={errorMsg} className="text-left w-full" />
          <div className="flex flex-col gap-2 w-full">
            <Button variant="secondary" className="w-full" size="lg" asChild>
              <Link href="/login">Sign in to resend verification</Link>
            </Button>
            <Link
              href="/forgot-password"
              className="text-xs text-center text-muted hover:text-fg transition-colors"
            >
              Having trouble? Contact support
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
