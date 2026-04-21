'use client';

import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { useAppSelector } from '@/stores/store';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const { user } = useAppSelector((s) => s.auth);

  return (
    <header className="sticky top-0 z-20 flex h-13 items-center justify-between px-5 bg-bg">
      {/* Mobile hamburger */}
      <button
        className="lg:hidden text-muted hover:text-fg transition-colors duration-100 p-1 -ml-1 rounded-lg hover:bg-subtle"
        onClick={onToggleSidebar}
        aria-label="Open navigation"
      >
        <Menu size={18} strokeWidth={1.8} />
      </button>

      <div className="flex-1" />

      {/* Right cluster */}
      <div className="flex items-center gap-1">
        {/* Theme toggle — only in topbar on mobile; sidebar shows it on desktop */}
        <div className="lg:hidden">
          <ThemeToggle />
        </div>

        <div className="w-px h-4 bg-border mx-1.5" />

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-fg leading-tight">{user?.fullName ?? '—'}</p>
            <p className="text-2xs text-muted">Owner</p>
          </div>
          <Avatar name={user?.fullName} size="sm" />
        </div>
      </div>
    </header>
  );
}
