'use client';

import * as React from 'react';
import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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
    sub: "We'll get you back into your dashboard safely.",
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4 sm:p-8">
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex min-h-[600px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-border lg:flex-row"
      >
        {/* ── Left panel ──────────────────────────────────────────────────── */}
        <LeftPanel sidebar={sidebar} />

        {/* ── Right panel (form area) ─────────────────────────────────────── */}
        <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
          {/* Logo on mobile only */}
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand">
              <span className="text-[11px] font-bold leading-none text-white">T</span>
            </span>
            <span className="text-sm font-semibold text-fg">Tableo</span>
          </Link>

          <div className="mx-auto w-full max-w-sm">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Left panel component ─────────────────────────────────────────────────────

function LeftPanel({ sidebar }: { sidebar: { title: string; sub: string; bullets: string[] } }) {
  const textRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative hidden w-[340px] flex-shrink-0 flex-col justify-between overflow-hidden bg-fg p-10 text-bg lg:flex">
      {/* Decorative circles — brand color, no blur */}
      <div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20" />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-brand/10"
      />

      {/* Logo */}
      <Link href="/" className="relative z-10 mb-10 flex items-center gap-2.5">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand">
          <span className="text-[11px] font-bold leading-none text-white">T</span>
        </span>
        <span className="text-sm font-semibold text-white">Tableo</span>
      </Link>

      {/* Copy */}
      <motion.div
        ref={textRef}
        key={sidebar.title}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 flex flex-1 flex-col justify-center gap-6"
      >
        <div>
          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-white">
            {sidebar.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{sidebar.sub}</p>
        </div>

        <ul className="space-y-3">
          {sidebar.bullets.map((b) => (
            <li key={b} className="flex items-center gap-3">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand/30">
                <Check size={11} className="text-white" strokeWidth={3} />
              </span>
              <span className="text-xs text-white/75">{b}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/10 pt-6">
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Tableo · Built in Accra, Ghana
        </p>
      </div>
    </div>
  );
}
