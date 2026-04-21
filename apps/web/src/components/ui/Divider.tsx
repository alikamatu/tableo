import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Divider({ className, ...props }: DividerProps) {
  return (
    <div
      role="separator"
      className={cn('h-px bg-border opacity-70', className)}
      {...props}
    />
  );
}
