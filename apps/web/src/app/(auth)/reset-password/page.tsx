'use client';

import * as React from 'react';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAlert } from '@/components/ui/Alert';
import api from '@/lib/api';
import { normalizeError } from '@/lib/api-error';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordStrength } from '@/components/auth/PasswordStrength';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { show, node: alertNode } = useAlert();
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) });

  const password = watch('password', '');

  // Bad/missing token
  if (!token) {
    return (
      <AuthShell heading="Invalid link" subheading="This password reset link is missing or invalid.">
        <Link
          href="/forgot-password"
          className="block text-center text-sm text-brand hover:underline"
        >
          Request a new reset link
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell heading="Password updated" subheading="">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle size={22} className="text-success" />
          </div>
          <p className="text-sm text-muted">Your password has been reset successfully.</p>
          <Button className="w-full" size="lg" onClick={() => router.push('/login')}>
            Sign in
          </Button>
        </div>
      </AuthShell>
    );
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      setDone(true);
      show('success', 'Password updated successfully. You can now sign in.');
    } catch (err) {
      const e = normalizeError(err);
      if (e.code === 'VALIDATION_ERROR' || e.code === 'NOT_FOUND') {
        show('error', 'This reset link is invalid or has expired.', 'Link expired');
      } else {
        show('error', e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      heading="Set new password"
      subheading="Choose a strong password for your account."
    >
      {alertNode}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-2">
          <Input
            label="New password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            autoFocus
            startIcon={<Lock size={15} />}
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordStrength password={password} />
        </div>
        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat your new password"
          autoComplete="new-password"
          startIcon={<Lock size={15} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
          Reset password
        </Button>
      </form>

      <div className="text-center mt-6">
        <Link href="/login" className="text-sm text-muted hover:text-fg transition-colors">
          ← Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
