'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAlert } from '@/components/ui/Alert';
import api from '@/lib/api';
import { normalizeError } from '@/lib/api-error';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations';
import { AuthShell } from '@/components/auth/AuthShell';

export default function ForgotPasswordPage() {
  const { show, node: alertNode } = useAlert();
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
      show('success', 'Reset link sent! Check your email.');
    } catch (err) {
      const e = normalizeError(err);
      show('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell heading="Check your email" subheading="">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <Mail size={22} className="text-success" />
          </div>
          <p className="text-sm text-muted leading-relaxed">
            We sent a password reset link to{' '}
            <strong className="text-fg">{getValues('email')}</strong>.
            Check your inbox — it may take a minute.
          </p>
          <p className="text-xs text-muted">
            Didn't get it?{' '}
            <button
              onClick={() => setSent(false)}
              className="text-brand hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
        <div className="text-center mt-6">
          <Link href="/login" className="text-sm text-muted hover:text-fg transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      heading="Forgot password?"
      subheading="Enter your email and we'll send you a reset link."
    >
      {alertNode}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@restaurant.com"
          autoComplete="email"
          autoFocus
          startIcon={<Mail size={15} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
          Send reset link
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
