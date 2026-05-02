'use client';

import { Menu, GitBranch, ChevronDown } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { useAppSelector, useAppDispatch } from '@/stores/store';
import { setCurrentBranch } from '@/stores/branchSlice';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/DropdownMenu';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onToggleSidebar: () => void;
  mode?: 'owner' | 'manager';
}

export function Topbar({ onToggleSidebar, mode = 'owner' }: TopbarProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { branches, current: branch } = useAppSelector((s) => s.branch);
  const isManager = mode === 'manager';

  const branchName = isManager
    ? (user?.staffMember?.branch?.name ?? 'Branch')
    : (branch?.name ?? 'Select Branch');

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/40 bg-bg px-5">
      {/* Mobile hamburger */}
      <div className="flex items-center gap-4">
        <button
          className="-ml-1 rounded-lg p-1 text-muted transition-colors duration-100 hover:bg-subtle hover:text-fg lg:hidden"
          onClick={onToggleSidebar}
          aria-label="Open navigation"
        >
          <Menu size={18} strokeWidth={1.8} />
        </button>

        {/* Branch Switcher / Label */}
        {isManager ? (
          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-1.5">
            <div className="bg-primary/10 text-primary flex h-5 w-5 items-center justify-center rounded-lg">
              <GitBranch size={12} strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-foreground">{branchName}</span>
            <Badge
              variant="outline"
              className="border-primary/20 text-primary/80 ml-1 h-4 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider"
            >
              Manager
            </Badge>
          </div>
        ) : branches.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="group flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-1.5 transition-all hover:bg-muted">
              <div className="bg-primary/10 text-primary flex h-5 w-5 items-center justify-center rounded-lg">
                <GitBranch size={12} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-foreground">{branchName}</span>
              <ChevronDown
                size={14}
                className="text-muted-foreground transition-colors group-hover:text-foreground"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2">
              <DropdownMenuLabel>Your Locations</DropdownMenuLabel>
              {branches.map((b) => (
                <DropdownMenuItem
                  key={b.id}
                  onClick={() => dispatch(setCurrentBranch(b))}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2',
                    branch?.id === b.id
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  <span className="flex-1 truncate">{b.name}</span>
                  {branch?.id === b.id && <div className="bg-primary h-1.5 w-1.5 rounded-full" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-1">
        {/* Theme toggle — only in topbar on mobile; sidebar shows it on desktop */}
        <div className="lg:hidden">
          <ThemeToggle />
        </div>

        <div className="mx-1.5 h-4 w-px bg-border" />

        <div className="flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium leading-tight text-fg">{user?.fullName ?? '—'}</p>
            <p className="text-[10px] font-bold uppercase tracking-tighter text-muted">
              {isManager ? 'Manager Account' : 'Owner Account'}
            </p>
          </div>
          <Avatar name={user?.fullName} size="sm" />
        </div>
      </div>
    </header>
  );
}
