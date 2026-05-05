'use client';

import { Menu, Bell } from 'lucide-react';
import { useAppSelector } from '@/stores/store';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';

export function ManagerTopbar({ onToggle }: { onToggle: () => void }) {
  const { user } = useAppSelector((s) => s.auth);

  return (
    <header className="h-13 sticky top-0 z-20 flex items-center justify-between border-b border-border/50 bg-bg px-5">
      <button
        onClick={onToggle}
        className="-ml-1 rounded-lg p-1.5 text-muted transition-colors hover:bg-subtle hover:text-fg lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={17} strokeWidth={1.8} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-fg">
          <Bell size={15} strokeWidth={1.8} />
        </button>
        <div className="mx-1 h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium leading-tight text-fg">{user?.fullName ?? '—'}</p>
            <p className="text-2xs capitalize text-muted">{user?.staffMember?.role ?? 'Manager'}</p>
          </div>
          <Avatar name={user?.fullName} size="sm" />
        </div>
      </div>
    </header>
  );
}
