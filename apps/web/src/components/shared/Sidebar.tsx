'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Store, GitBranch, UtensilsCrossed,
  ShoppingCart, BarChart3, Users, Settings, LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggle } from './ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { Divider } from '@/components/ui/Divider';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Restaurants', href: '/restaurants', icon: Store },
  { label: 'Branches',    href: '/branches',    icon: GitBranch },
  { label: 'Menu',        href: '/menu',        icon: UtensilsCrossed },
  { label: 'Orders',      href: '/orders',      icon: ShoppingCart },
  { label: 'Analytics',   href: '/analytics',   icon: BarChart3 },
  { label: 'Staff',       href: '/staff',       icon: Users },
  { label: 'Settings',    href: '/settings',    icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full w-[216px] flex-shrink-0 flex-col bg-bg px-3 py-5">

      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <Link
        href="/restaurants"
        className="flex items-center gap-2.5 px-2 py-1.5 mb-6 rounded-lg w-fit hover:bg-subtle transition-colors duration-100"
      >
        <span className="h-6 w-6 rounded-md bg-brand flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] font-bold text-white leading-none">T</span>
        </span>
        <span className="text-sm font-semibold text-fg tracking-tight">Tableo</span>
      </Link>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors duration-100',
                active
                  ? 'bg-brand text-white font-medium'
                  : 'text-muted hover:text-fg hover:bg-subtle',
              )}
            >
              <Icon
                size={15}
                strokeWidth={active ? 2.5 : 1.8}
                className={cn(
                  'flex-shrink-0 transition-none',
                  active ? 'text-white' : 'text-muted group-hover:text-fg',
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="mt-4 space-y-1">

        {/* Theme toggle row */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-xs text-muted">Appearance</span>
          <ThemeToggle />
        </div>

        <Divider className="my-2" />

        {/* User row */}
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
          <Avatar name={user?.fullName} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-fg truncate leading-snug">{user?.fullName ?? '—'}</p>
            <p className="text-2xs text-muted truncate">{user?.email ?? ''}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-muted hover:text-danger hover:bg-danger/8 transition-colors duration-100"
        >
          <LogOut size={15} strokeWidth={1.8} className="flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
