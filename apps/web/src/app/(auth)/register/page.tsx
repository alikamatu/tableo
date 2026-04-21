'use client';

import * as React from 'react';
import Link from 'next/link';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAlert } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/use-auth';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordStrength } from '@/components/auth/PasswordStrength';

function RegisterForm() {
  const { register: registerUser, loading } = useAuth();
  const { show, node: alertNode } = useAlert();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const password = watch('password', '');

  const onSubmit = async (data: RegisterFormData, event?: React.BaseSyntheticEvent) => {
    event?.preventDefault();
    const err = await registerUser(data, null);
    if (!err) {
      show('success', 'Account created! Please check your email to verify your account.');
      return;
    }

    switch (err.code) {
      case 'EMAIL_IN_USE':
        setError('email', { message: 'An account with this email already exists.' });
        break;
      case 'VALIDATION_ERROR':
        if (err.fields?.['email'])    setError('email',    { message: err.fields['email'] });
        if (err.fields?.['password']) setError('password', { message: err.fields['password'] });
        if (err.fields?.['fullName']) setError('fullName', { message: err.fields['fullName'] });
        if (!err.fields) show('error', err.message);
        break;
      case 'RATE_LIMITED':
        show('error', 'Too many attempts. Please wait a moment and try again.');
        break;
      case 'NETWORK_ERROR':
        show('error', 'Unable to connect. Check your internet connection.');
        break;
      default:
        show('error', err.message);
    }
  };

  return (
    <AuthShell
      heading="Create account"
      subheading="Join 200+ restaurants on Tableo"
    >
      {alertNode}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Full name"
          type="text"
          placeholder="Kofi Mensah"
          autoComplete="name"
          autoFocus
          startIcon={<User size={15} />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@restaurant.com"
          autoComplete="email"
          startIcon={<Mail size={15} />}
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="space-y-2">
          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            startIcon={<Lock size={15} />}
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordStrength password={password} />
        </div>
        <Input
          label="Phone (optional)"
          type="tel"
          placeholder="+233 20 000 0000"
          autoComplete="tel"
          startIcon={<Phone size={15} />}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="text-xs text-center text-muted mt-4 leading-relaxed">
        By creating an account you agree to our{' '}
        <Link href="/terms" className="underline hover:text-fg transition-colors">Terms</Link>
        {' '}and{' '}
        <Link href="/privacy" className="underline hover:text-fg transition-colors">Privacy Policy</Link>.
      </p>

      <p className="text-center text-sm text-muted mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-fg font-medium hover:text-brand transition-colors">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
