'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AppLoaderProps {
  /** Optional message displayed below the logo */
  message?: string;
  /** Whether to take up the full screen (default: true) */
  fullScreen?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Branded loader used across the entire platform for consistency.
 * Displays the animated Tableo logo with a rotating ring.
 * - Supports light/dark themes automatically
 * - 100% opaque background
 * - Center-aligned
 */
export function AppLoader({ message = 'Loading...', fullScreen = true, className }: AppLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-bg z-50',
        fullScreen ? 'fixed inset-0 min-h-screen' : 'w-full py-20',
        className,
      )}
    >
      {/* Logo container with animations */}
      <div className="relative flex items-center justify-center">
        {/* Outer rotating ring */}
        <div className="absolute h-24 w-24 rounded-full border-[3px] border-transparent border-t-brand border-r-brand/30 animate-[spin_1.4s_linear_infinite]" />

        {/* Middle pulsing glow */}
        <div className="absolute h-20 w-20 rounded-full bg-brand/5 dark:bg-brand/10 animate-[pulse_2s_ease-in-out_infinite]" />

        {/* Logo — light mode uses dark logo, dark mode uses white logo */}
        <div className="relative h-14 w-14 flex items-center justify-center animate-[pulse_2.5s_ease-in-out_infinite]">
          <Image
            src="/logos/logo-icon.png"
            alt="Tableo"
            width={56}
            height={56}
            className="block dark:hidden object-contain"
            priority
          />
          <Image
            src="/logos/logo-white.png"
            alt="Tableo"
            width={56}
            height={56}
            className="hidden dark:block object-contain"
            priority
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mt-6 flex flex-col items-center gap-1.5">
          <p className="text-sm font-medium text-fg/80 animate-[pulse_2s_ease-in-out_infinite]">
            {message}
          </p>
          {/* Shimmer dots */}
          <div className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-brand/60 animate-[bounce_1.4s_infinite_0ms]" />
            <span className="h-1 w-1 rounded-full bg-brand/60 animate-[bounce_1.4s_infinite_200ms]" />
            <span className="h-1 w-1 rounded-full bg-brand/60 animate-[bounce_1.4s_infinite_400ms]" />
          </div>
        </div>
      )}
    </div>
  );
}
