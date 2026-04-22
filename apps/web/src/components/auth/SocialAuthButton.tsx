'use client';

import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SocialAuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  loading?: boolean;
}

export function SocialAuthButton({
  children,
  icon,
  loading,
  className,
  ...props
}: SocialAuthButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        'group relative flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
        'bg-surface hover:bg-surface-hover ring-1 ring-border shadow-sm hover:shadow-md hover:ring-brand/30',
        'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        className
      )}
    >
      {loading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
      ) : (
        <>
          {icon && <span className="flex-shrink-0 transition-transform group-hover:scale-110">{icon}</span>}
          <span className="text-fg">{children}</span>
        </>
      )}
    </button>
  );
}
