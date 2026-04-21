import * as React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'icon' | 'full';
  size?: number;
  className?: string;
}

export function Logo({ size = 28, className }: LogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-lg bg-brand flex-shrink-0',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <span
        className="font-bold text-white leading-none select-none"
        style={{ fontSize: Math.round(size * 0.4) }}
      >
        T
      </span>
    </span>
  );
}
