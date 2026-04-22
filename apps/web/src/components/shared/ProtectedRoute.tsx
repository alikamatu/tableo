'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/stores/store';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAppSelector((s) => s.auth);
  const router  = useRouter();
  const pathname = usePathname();

  const isStaff         = !!user?.staffMember;
  const isManagerArea   = pathname.startsWith('/manager-dashboard');
  const isOwnerArea     = !isManagerArea;

  useEffect(() => {
    if (initializing) return;

    if (!user) {
      const next = typeof window !== 'undefined' ? window.location.pathname : '';
      router.replace(`/login${next && next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`);
      return;
    }

    if (isStaff) {
      // Staff member hitting an owner-only area
      if (isOwnerArea) { router.replace('/manager-dashboard'); return; }
    } else {
      // Owner hitting manager area
      if (isManagerArea) { router.replace('/restaurants'); return; }
      // Owner hasn't completed onboarding
      if (!user.onboardComplete) { router.replace('/onboarding'); return; }
    }
  }, [initializing, user, isStaff, isManagerArea, isOwnerArea, router]);

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={22} className="text-brand animate-spin" />
          <p className="text-xs text-muted">Restoring session…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (isStaff && isOwnerArea) return null;
  if (!isStaff && isManagerArea) return null;
  if (!isStaff && !user.onboardComplete) return null;

  return <>{children}</>;
}
