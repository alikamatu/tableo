import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'muted';
}

function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  const variants = {
    primary: 'bg-primary text-primary-foreground border-transparent',
    secondary: 'bg-secondary text-secondary-foreground border-transparent',
    muted: 'bg-muted text-muted-foreground border-transparent',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-transparent',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-transparent',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-transparent',
    outline: 'bg-transparent text-foreground border-border',
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
