'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { UserMenu } from './UserMenu';
import { NAV_LINKS } from '@/constants/landing-data';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-bg/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo variant="icon" size={28} />
            <span className="text-sm font-bold tracking-tight text-fg hidden sm:block">Tableo</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-xs font-bold text-muted hover:text-fg transition-colors tracking-wide uppercase"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  href="/login"
                  className="text-xs font-bold text-muted hover:text-fg transition-colors px-2"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center h-8 px-4 rounded-full bg-fg text-bg text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
                >
                  Join Free
                </Link>
              </div>
            )}

            <button
              className="md:hidden text-muted hover:text-fg p-1 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Menu */}
          <div className="fixed top-16 inset-x-0 z-50 bg-bg border-b border-border md:hidden animate-in slide-in-from-top-2 duration-200">
            <nav className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex flex-col gap-6">
                {NAV_LINKS.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="text-lg font-bold text-fg tracking-tight py-2"
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </a>
                ))}

                <div className="h-px w-full bg-border/50 my-2" />

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-semibold text-muted">Theme</span>
                  <ThemeToggle />
                </div>

                <div className="h-px w-full bg-border/50 my-2" />

                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-between text-lg font-bold text-brand py-2"
                    onClick={() => setOpen(false)}
                  >
                    Go to Dashboard
                    <ArrowRight size={20} />
                  </Link>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/register"
                      className="w-full text-center py-4 bg-fg text-bg rounded-2xl font-bold text-lg"
                      onClick={() => setOpen(false)}
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/login"
                      className="w-full text-center py-4 text-muted font-bold"
                      onClick={() => setOpen(false)}
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
