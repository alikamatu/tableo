'use client';

import { LogOut, User, LayoutDashboard, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { Avatar } from '@/components/ui/Avatar';

export function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 px-2 py-1.5 rounded-full bg-surface hover:bg-surface-hover ring-1 ring-border transition-all group overflow-hidden">
        <Avatar name={user.fullName} size="sm" className="h-7 w-7 text-[10px]" />
        <span className="hidden sm:inline text-sm font-medium text-fg max-w-[100px] truncate">
          {user.fullName.split(' ')[0]}
        </span>
        <ChevronDown size={14} className="text-muted group-hover:text-fg transition-colors" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl ring-1 ring-border mt-3 transform transition-all animate-in fade-in zoom-in duration-200">
        <DropdownMenuLabel className="px-3 py-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-fg leading-none">{user.fullName}</p>
            <p className="text-xs text-muted truncate mt-1">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="mx-2 mb-2" />

        <div className="space-y-1">
          <DropdownMenuItem asChild className="w-full">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-fg hover:bg-brand/10 hover:text-brand transition-colors"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="w-full">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-fg hover:bg-subtle transition-colors"
            >
              <Settings size={16} />
              Account Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="mx-2 my-2" />

          <DropdownMenuItem
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}