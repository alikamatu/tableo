'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
  className,
}: CollapsibleSectionProps) {
  return (
    <details
      open={defaultOpen}
      className={cn('bg-card/30 group rounded-xl border border-border', className)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-semibold text-foreground [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDown className="text-muted-foreground h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-border px-4 py-4">{children}</div>
    </details>
  );
}
