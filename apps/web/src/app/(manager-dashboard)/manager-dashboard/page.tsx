'use client';

import {
  ShoppingCart,
  Users,
  Clock,
  ChevronRight,
  UtensilsCrossed,
  GitBranch,
  Banknote,
  Rocket,
} from 'lucide-react';
import { useAppSelector } from '@/stores/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { formatGHS } from '@tableo/utils';

export default function ManagerDashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  const { current: branch } = useAppSelector((s) => s.branch);

  const stats = [
    { label: "Today's Orders", value: '0', icon: ShoppingCart },
    { label: 'Cash Collected', value: formatGHS(0), icon: Banknote },
    { label: 'Active Staff', value: '0', icon: Users },
    { label: 'Avg Prep Time', value: '0m', icon: Clock },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-fg">
            Welcome back, {user?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-sm font-medium text-muted">
            Manage operations for{' '}
            <span className="font-bold text-fg">{branch?.name ?? 'your branch'}</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/manager-dashboard/orders">
            <Button size="sm" variant="outline" className="h-9 font-bold">
              Orders queue
            </Button>
          </Link>
          <Link href="/manager-dashboard/menu">
            <Button size="sm" className="h-9 gap-1.5 font-bold">
              <UtensilsCrossed size={16} />
              Branch menu
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="group border-none bg-surface/50 shadow-sm transition-all">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/5 text-brand transition-transform group-hover:scale-110">
                  <stat.icon size={20} strokeWidth={2.5} />
                </div>
              </div>
              <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-muted">
                {stat.label}
              </p>
              <h3 className="text-xl font-black text-fg">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-none bg-surface/30 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between py-5">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted">
              Branch Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/manager-dashboard/orders"
              className="rounded-xl border border-border bg-bg p-4 transition hover:bg-subtle"
            >
              <p className="text-sm font-bold text-fg">Orders management</p>
              <p className="mt-1 text-xs text-muted">
                Track order progress and handle customer queue.
              </p>
            </Link>
            <Link
              href="/manager-dashboard/orders"
              className="rounded-xl border border-border bg-bg p-4 transition hover:bg-subtle"
            >
              <p className="text-sm font-bold text-fg">Cash payment control</p>
              <p className="mt-1 text-xs text-muted">
                Mark counter payments paid/unpaid from order cards.
              </p>
            </Link>
            <Link
              href="/manager-dashboard/menu"
              className="rounded-xl border border-border bg-bg p-4 transition hover:bg-subtle"
            >
              <p className="text-sm font-bold text-fg">Menu management</p>
              <p className="mt-1 text-xs text-muted">
                Enable/disable items per branch and apply overrides.
              </p>
            </Link>
            <Link
              href="/manager-dashboard/settings"
              className="rounded-xl border border-border bg-bg p-4 transition hover:bg-subtle"
            >
              <p className="text-sm font-bold text-fg">Branch setup</p>
              <p className="mt-1 text-xs text-muted">
                Update branch profile, status, and operating info.
              </p>
            </Link>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-l-4 border-none border-brand bg-brand/5">
            <CardContent className="p-5">
              <h4 className="mb-2 text-sm font-black uppercase tracking-wider text-brand">
                Current Branch
              </h4>
              <div className="flex items-center gap-2 text-xs font-bold text-fg">
                <GitBranch size={14} />
                {branch?.name ?? 'Branch not selected'}
              </div>
              <p className="mt-2 text-xs text-muted">
                Managers are scoped to one branch to keep operations focused.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none bg-surface/30">
            <CardHeader className="py-5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted">
                Staff Module
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="warning" className="mb-2">
                Launching July
              </Badge>
              <p className="text-xs text-muted">
                Staff invites, roles, and shift controls are planned for July release.
              </p>
              <Link href="/manager-dashboard/staff">
                <Button variant="outline" className="mt-4 h-9 w-full text-xs font-bold">
                  View roadmap
                  <ChevronRight size={14} className="ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none bg-surface/30">
            <CardHeader className="py-5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted">
                Product updates
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted">
              <div className="flex items-center gap-2 font-bold text-fg">
                <Rocket size={14} />
                Manager tooling expanding monthly
              </div>
              <p className="mt-2">
                Next milestone includes staff actions, branch analytics snapshots, and cashier audit
                logs.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
