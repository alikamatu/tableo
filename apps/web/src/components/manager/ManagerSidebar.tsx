'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Users,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useAppSelector } from '@/stores/store';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Overview', href: '/manager-dashboard', icon: LayoutDashboard },
  { label: 'Orders', href: '/manager-dashboard/orders', icon: ShoppingCart },
  { label: 'Menu', href: '/manager-dashboard/menu', icon: UtensilsCrossed },
  { label: 'Staff', href: '/manager-dashboard/staff', icon: Users },
  { label: 'Settings', href: '/manager-dashboard/settings', icon: Settings },
];

export function ManagerSidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { current: branch } = useAppSelector((s) => s.branch);

  return (
    <aside className="flex h-full w-[220px] flex-shrink-0 flex-col bg-bg px-3 py-4">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-brand">
            <span className="text-[11px] font-bold leading-none text-white">T</span>
          </span>
          <div>
            <p className="text-xs font-semibold leading-tight text-fg">Tableo</p>
            <p className="text-2xs leading-tight text-muted">Manager</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted transition-colors hover:bg-subtle hover:text-fg lg:hidden"
        >
          <X size={15} />
        </button>
      </div>

      {/* Branch pill */}
      {branch && (
        <div className="bg-brand/8 mx-2 mb-4 flex items-center gap-2 rounded-lg px-3 py-2">
          <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-brand" />
          <p className="truncate text-xs font-medium text-brand">{branch.name}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active =
            href === '/manager-dashboard' ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-100',
                active
                  ? 'bg-brand/8 font-medium text-brand'
                  : 'text-muted hover:bg-subtle hover:text-fg',
              )}
            >
              <Icon
                size={15}
                strokeWidth={active ? 2.2 : 1.8}
                className={cn(
                  'flex-shrink-0',
                  active ? 'text-brand' : 'text-muted group-hover:text-fg',
                )}
              />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-3 space-y-1 border-t border-border pt-3">
        <div className="flex items-center justify-between px-2.5 py-1.5">
          <span className="text-2xs text-muted">Appearance</span>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
          <Avatar name={user?.fullName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-fg">{user?.fullName ?? '—'}</p>
            <p className="truncate text-2xs capitalize text-muted">
              {user?.staffMember?.role ?? 'Staff'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="hover:bg-danger/8 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted transition-colors duration-100 hover:text-danger"
        >
          <LogOut size={14} strokeWidth={1.8} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
