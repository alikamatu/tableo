'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface MenuFormChromeProps {
  backHref: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Extra bottom padding so content clears the sticky bar */
  contentClassName?: string;
  footer: {
    cancelHref: string;
    onSave: () => void;
    saveLabel?: string;
    saving?: boolean;
    saveDisabled?: boolean;
  };
}

export function MenuFormChrome({
  backHref,
  title,
  subtitle,
  children,
  contentClassName,
  footer,
}: MenuFormChromeProps) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <header className="sticky top-0 z-10 -mx-1 border-b border-border/80 bg-bg/95 px-1 py-3 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="mt-0.5 shrink-0" asChild>
            <Link href={backHref} aria-label="Back">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-muted-foreground mt-0.5 text-sm font-medium">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </header>

      <div className={cn('mx-auto w-full max-w-3xl flex-1 pb-28 pt-6', contentClassName)}>
        {children}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-bg/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-bg/85">
        <div className="mx-auto flex max-w-3xl gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none" asChild>
            <Link href={footer.cancelHref}>Cancel</Link>
          </Button>
          <Button
            className="flex-1 sm:ml-auto sm:min-w-[140px] sm:flex-none"
            onClick={footer.onSave}
            disabled={footer.saveDisabled || footer.saving}
          >
            {footer.saving ? 'Saving…' : (footer.saveLabel ?? 'Save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
