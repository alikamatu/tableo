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
  DropdownMenuLabel
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
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between px-5 bg-bg border-b border-border/40">
      {/* Mobile hamburger */}
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-muted hover:text-fg transition-colors duration-100 p-1 -ml-1 rounded-lg hover:bg-subtle"
          onClick={onToggleSidebar}
          aria-label="Open navigation"
        >
          <Menu size={18} strokeWidth={1.8} />
        </button>

        {/* Branch Switcher / Label */}
        {isManager ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GitBranch size={12} strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-foreground">
              {branchName}
            </span>
            <Badge variant="outline" className="ml-1 text-[9px] uppercase tracking-wider py-0 px-1.5 h-4 font-bold border-primary/20 text-primary/80">
              Manager
            </Badge>
          </div>
        ) : branches.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-all group">
              <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GitBranch size={12} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-foreground">
                {branchName}
              </span>
              <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2">
              <DropdownMenuLabel>Your Locations</DropdownMenuLabel>
              {branches.map((b) => (
                <DropdownMenuItem 
                  key={b.id} 
                  onClick={() => dispatch(setCurrentBranch(b))}
                  className={cn(
                    "flex items-center justify-between gap-2 px-2 py-2 rounded-lg cursor-pointer",
                    branch?.id === b.id ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <span className="flex-1 truncate">{b.name}</span>
                  {branch?.id === b.id && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
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

        <div className="w-px h-4 bg-border mx-1.5" />

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-fg leading-tight">{user?.fullName ?? '—'}</p>
            <p className="text-[10px] text-muted font-bold uppercase tracking-tighter">Owner Account</p>
          </div>
          <Avatar name={user?.fullName} size="sm" />
        </div>
      </div>
    </header>
  );
}
