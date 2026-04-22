'use client';

import * as React from 'react';
import Link from 'next/link';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAlert } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/use-auth';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { AuthShell } from '@/components/auth/AuthShell';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';

function LoginForm() {
  const { login, loading } = useAuth();
  const { show, node: alertNode } = useAlert();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData, event?: React.BaseSyntheticEvent) => {
    event?.preventDefault();
    const err = await login(data.email, data.password);
    if (!err) return;

    switch (err.code) {
      case 'INVALID_CREDENTIALS':
        setError('password', { message: 'Incorrect email or password.' });
        // Global alert will now show "Incorrect email or password." via default case
        break;
      case 'RATE_LIMITED':
        // Global alert will now show "Too many attempts..." via default case
        break;
      case 'NETWORK_ERROR':
        // Global alert will now show "Unable to connect..." via default case
        break;
    }
    
    // If not handled above or if it's a general error, show the normalized message
    if (err.code !== 'VALIDATION_ERROR') {
      show('error', err.message);
    }
  };

  return (
    <AuthShell
      heading="Welcome back"
      subheading="Sign in to manage your restaurant"
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
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-fg">Password</label>
            <Link href="/forgot-password" className="text-xs text-muted hover:text-brand transition-colors">
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            startIcon={<Lock size={15} />}
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface px-2 text-muted font-medium">Or continue with</span>
        </div>
      </div>

      <GoogleLoginButton label="Sign in with Google" />

      <p className="text-center text-sm text-muted mt-6">
        No account?{' '}
        <Link href="/register" className="text-fg font-medium hover:text-brand transition-colors">
          Create one free
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
