'use client';

import {
  ShoppingCart,
  Users,
  Clock,
  ChevronRight,
  UtensilsCrossed,
  GitBranch,
  Banknote,
  Sparkles,
} from 'lucide-react';
import { useAppSelector } from '@/stores/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { formatGHS } from '@tableo/utils';
import { motion } from 'framer-motion';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function ManagerDashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  const { current: branch } = useAppSelector((s) => s.branch);

  const stats = [
    { label: 'Orders today', value: '0', icon: ShoppingCart, tone: 'text-primary bg-primary/10' },
    {
      label: 'Cash collected',
      value: formatGHS(0),
      icon: Banknote,
      tone: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
    },
    {
      label: 'Active staff',
      value: '0',
      icon: Users,
      tone: 'text-sky-600 bg-sky-500/10 dark:text-sky-400',
    },
    {
      label: 'Avg prep',
      value: '0m',
      icon: Clock,
      tone: 'text-amber-600 bg-amber-500/10 dark:text-amber-400',
    },
  ];

  return (
    <motion.div
      className="mx-auto max-w-5xl space-y-6 pb-12 sm:space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Sparkles size={18} strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-lg font-medium tracking-tight text-fg sm:text-xl">
              Hi {user?.fullName?.split(' ')[0] ?? 'there'}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Branch · <span className="text-fg/90">{branch?.name ?? 'not selected'}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/manager-dashboard/orders">
            <Button size="sm" variant="outline" className="h-9 text-xs font-normal">
              Orders
            </Button>
          </Link>
          <Link href="/manager-dashboard/menu">
            <Button size="sm" className="h-9 gap-1.5 text-xs font-normal">
              <UtensilsCrossed size={15} strokeWidth={1.75} />
              Menu
            </Button>
          </Link>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat, i) => (
          <motion.div key={i} variants={fadeUp}>
            <Card className="border-border/80 bg-surface/40 transition-shadow hover:shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div
                  className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${stat.tone}`}
                >
                  <stat.icon size={17} strokeWidth={1.75} />
                </div>
                <p className="text-xs text-muted">{stat.label}</p>
                <p className="mt-1 text-lg tabular-nums text-fg sm:text-xl">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/80 bg-surface/30 lg:col-span-2">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs font-medium text-muted">Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 pb-4 sm:grid-cols-2 sm:gap-3">
            {[
              {
                href: '/manager-dashboard/orders',
                title: 'Orders',
                desc: 'Progress and queue.',
              },
              {
                href: '/manager-dashboard/orders',
                title: 'Counter payments',
                desc: 'Mark paid or unpaid.',
              },
              {
                href: '/manager-dashboard/menu',
                title: 'Branch menu',
                desc: 'Toggle items for this branch.',
              },
              {
                href: '/manager-dashboard/settings',
                title: 'Branch setup',
                desc: 'Hours and contact.',
              },
            ].map((link) => (
              <Link
                key={link.href + link.title}
                href={link.href}
                className="rounded-xl border border-border/70 bg-bg p-3 transition-colors hover:bg-subtle/80 sm:p-4"
              >
                <p className="text-sm font-medium text-fg">{link.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{link.desc}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-l-2 border-border/80 border-l-brand bg-brand/5">
            <CardContent className="p-4 sm:p-5">
              <p className="mb-2 text-xs font-medium text-brand">Current branch</p>
              <div className="flex items-center gap-2 text-sm text-fg">
                <GitBranch size={15} strokeWidth={1.75} className="shrink-0 text-muted" />
                <span className="truncate">{branch?.name ?? 'Not selected'}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Managers are scoped to one branch.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-surface/30">
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs font-medium text-muted">Staff</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <Badge variant="warning" className="mb-2 font-normal">
                Planned
              </Badge>
              <p className="text-xs leading-relaxed text-muted">
                Invites and roles are on the roadmap.
              </p>
              <Link href="/manager-dashboard/staff">
                <Button variant="outline" className="mt-3 h-9 w-full text-xs font-normal">
                  Details
                  <ChevronRight size={14} strokeWidth={1.75} className="ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
