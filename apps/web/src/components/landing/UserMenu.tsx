'use client';

import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:flex items-center gap-2 text-sm">
        <User size={16} className="text-fg-muted" />
        <span className="font-medium text-fg">{user.fullName}</span>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-fg-muted hover:text-fg hover:bg-subtle rounded-lg transition-colors"
        title="Sign out"
      >
        <LogOut size={16} />
        <span className="hidden md:inline">Sign out</span>
      </button>

      <Link
        href="/dashboard"
        className="inline-flex items-center h-9 px-4 rounded-full bg-brand text-white text-sm font-bold hover:bg-brand/90 transition-all active:scale-95"
      >
        Dashboard
      </Link>
    </div>
  );
}