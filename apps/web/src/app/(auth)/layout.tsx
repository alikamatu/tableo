'use client';

import * as React from 'react';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { Check } from 'lucide-react';
import Link from 'next/link';

// ─── Sidebar data per route ───────────────────────────────────────────────────

const SIDEBAR: Record<string, { title: string; sub: string; bullets: string[] }> = {
  '/login': {
    title: 'Welcome back.',
    sub: 'Sign in to manage your restaurant operations.',
    bullets: ['Cloud-synced menu management', 'Instant QR code generation', 'Live order analytics'],
  },
  '/register': {
    title: 'Start building today.',
    sub: 'Join 200+ restaurants across Accra on Tableo.',
    bullets: ['Multi-branch management', 'Online ordering + Paystack', 'Staff roles & permissions'],
  },
  '/forgot-password': {
    title: 'Secure recovery.',
    sub: 'We\'ll get you back into your dashboard safely.',
    bullets: ['Time-limited reset tokens', 'Email verification', 'Zero data exposure'],
  },
  '/reset-password': {
    title: 'Fresh start.',
    sub: 'Set a strong new password for your account.',
    bullets: ['Enforced password strength', 'Instant session protection', 'One-time use links'],
  },
  '/verify-email': {
    title: 'One last step.',
    sub: 'Verify your email to activate your account.',
    bullets: ['Secure account activation', 'Email delivery by Resend', '24-hour link validity'],
  },
};

// ─── Auth Layout ──────────────────────────────────────────────────────────────

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cardRef = useRef<HTMLDivElement>(null);

  // Find active sidebar content — match prefix for dynamic routes
  const activeKey = Object.keys(SIDEBAR).find((k) => pathname.startsWith(k)) ?? '/login';
  const sidebar = SIDEBAR[activeKey]!;

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
    );
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 sm:p-8">
      <div
        ref={cardRef}
        className="w-full max-w-4xl bg-surface rounded-2xl overflow-hidden flex flex-col lg:flex-row ring-1 ring-border min-h-[600px]"
      >
        {/* ── Left panel ──────────────────────────────────────────────────── */}
        <LeftPanel sidebar={sidebar} />

        {/* ── Right panel (form area) ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
          {/* Logo on mobile only */}
          <Link
            href="/"
            className="flex items-center gap-2 mb-8 lg:hidden"
          >
            <span className="h-7 w-7 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-[11px] font-bold text-white leading-none">T</span>
            </span>
            <span className="text-sm font-semibold text-fg">Tableo</span>
          </Link>

          <div className="w-full max-w-sm mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Left panel component ─────────────────────────────────────────────────────

function LeftPanel({
  sidebar,
}: {
  sidebar: { title: string; sub: string; bullets: string[] };
}) {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      textRef.current?.children ?? [],
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 },
    );
  }, [sidebar.title]);

  return (
    <div className="hidden lg:flex w-[340px] flex-shrink-0 flex-col justify-between bg-fg text-bg p-10 relative overflow-hidden">
      {/* Decorative circles — brand color, no blur */}
      <div aria-hidden className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand/20" />
      <div aria-hidden className="absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-brand/10" />

      {/* Logo */}
      <Link href="/" className="relative z-10 flex items-center gap-2.5 mb-10">
        <span className="h-7 w-7 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] font-bold text-white leading-none">T</span>
        </span>
        <span className="text-sm font-semibold text-white">Tableo</span>
      </Link>

      {/* Copy */}
      <div ref={textRef} className="relative z-10 flex-1 flex flex-col justify-center gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-white leading-tight tracking-tight">
            {sidebar.title}
          </h2>
          <p className="text-sm text-white/60 mt-2 leading-relaxed">{sidebar.sub}</p>
        </div>

        <ul className="space-y-3">
          {sidebar.bullets.map((b) => (
            <li key={b} className="flex items-center gap-3">
              <span className="h-5 w-5 rounded-full bg-brand/30 flex items-center justify-center flex-shrink-0">
                <Check size={11} className="text-white" strokeWidth={3} />
              </span>
              <span className="text-xs text-white/75">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="relative z-10 pt-6 border-t border-white/10">
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Tableo · Built in Accra, Ghana
        </p>
      </div>
    </div>
  );
}
