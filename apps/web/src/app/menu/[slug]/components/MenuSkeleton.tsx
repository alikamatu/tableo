'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';

export function MenuSkeleton() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-bg px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:grid lg:grid-cols-[1fr_360px] lg:gap-6">
        <div className="space-y-6">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
          <Card className="overflow-hidden rounded-[2rem] border-none shadow-sm ring-1 ring-border/40">
            <Skeleton className="h-40 w-full" />
            <div className="space-y-4 p-6">
              <Skeleton className="h-10 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          </Card>
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-[500px] w-full rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}
