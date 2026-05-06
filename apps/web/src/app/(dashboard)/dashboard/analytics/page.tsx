'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingCart, DollarSign, TrendingUp, Clock, Loader2, BarChart3 } from 'lucide-react';
import { useAppSelector } from '@/stores/store';
import api from '@/lib/api';
import { formatGHS } from '@tableo/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface LiveSummary {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  ordersByHour: Record<string, number>;
  topItems: Array<{ itemId: string; name: string; qty: number; revenue: number }>;
  statusCounts: { pending: number; confirmed: number; ready: number; done: number };
}

interface Snapshot {
  id: string;
  date: string;
  totalOrders: number;
  totalRevenue: string;
  avgOrderValue: string;
}

const listParent = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function AnalyticsPage() {
  const { current: branch, loading: branchLoading } = useAppSelector((s) => s.branch);
  const { loading: restLoading } = useAppSelector((s) => s.restaurant);
  const [live, setLive] = useState<LiveSummary | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const load = useCallback(async () => {
    if (!branch) return;
    try {
      const [liveRes, snapRes] = await Promise.all([
        api.get(`/branches/${branch.id}/analytics/live`),
        api.get(`/branches/${branch.id}/analytics`, { params: dateRange }),
      ]);
      setLive(liveRes.data.data);
      setSnapshots(snapRes.data.data);
    } catch {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  }, [branch, dateRange]);

  useEffect(() => {
    load();
  }, [load]);

  if ((restLoading || branchLoading) && !branch) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-primary" size={28} strokeWidth={1.75} />
      </div>
    );
  }

  if (!branch)
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Select a branch to view statistics.
      </div>
    );

  if (loading && !live) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-primary" size={28} strokeWidth={1.75} />
      </div>
    );
  }

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    orders: live?.ordersByHour?.[i] ?? 0,
  }));

  const trendData = snapshots.map((s) => ({
    date: new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    revenue: Number(s.totalRevenue),
    orders: s.totalOrders,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur-sm">
          <p className="mb-1 text-xs text-muted-foreground">{label}</p>
          <p className="text-sm tabular-nums text-foreground">{formatGHS(payload[0].value)}</p>
          {payload[1] && (
            <p className="mt-1 text-xs tabular-nums text-primary">{payload[1].value} orders</p>
          )}
        </div>
      );
    }
    return null;
  };

  const statCards = [
    {
      label: 'Daily orders',
      val: live?.totalOrders ?? 0,
      icon: ShoppingCart,
      iconClass: 'text-primary bg-primary/10',
    },
    {
      label: 'Daily revenue',
      val: formatGHS(live?.totalRevenue ?? 0),
      icon: DollarSign,
      iconClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    },
    {
      label: 'Avg ticket',
      val: formatGHS(live?.avgOrderValue ?? 0),
      icon: TrendingUp,
      iconClass: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
    },
    {
      label: 'In pipeline',
      val: live?.statusCounts?.pending ?? 0,
      icon: Clock,
      iconClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    },
  ];

  return (
    <motion.div
      ref={containerRef}
      className="mx-auto max-w-6xl space-y-6 pb-20 sm:space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 size={18} strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-lg font-medium tracking-tight text-foreground sm:text-xl">
              Insights
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Live branch performance and history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-1.5">
          <Input
            type="date"
            className="h-8 border-none bg-transparent text-xs focus-visible:ring-0"
            value={dateRange.from}
            onValueChange={(v) => setDateRange((d) => ({ ...d, from: v }))}
          />
          <span className="text-xs text-muted-foreground/50">→</span>
          <Input
            type="date"
            className="h-8 border-none bg-transparent text-xs focus-visible:ring-0"
            value={dateRange.to}
            onValueChange={(v) => setDateRange((d) => ({ ...d, to: v }))}
          />
        </div>
      </div>

      <motion.div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        variants={listParent}
        initial="hidden"
        animate="show"
      >
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} variants={listItem}>
              <Card className="border-border/80 bg-card/50 transition-shadow hover:shadow-md">
                <CardContent className="px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg',
                        stat.iconClass,
                      )}
                    >
                      <Icon size={17} strokeWidth={1.75} />
                    </div>
                    <Badge variant="muted" className="text-[10px] font-normal">
                      live
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-lg tabular-nums text-foreground sm:text-xl">{stat.val}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <Card className="h-[300px] border-border/80 sm:h-[340px] lg:h-[380px]">
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Revenue over time
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-3rem)] pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    width={36}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#areaColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          <Card className="h-[300px] border-border/80 sm:h-[340px] lg:h-[380px]">
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Orders by hour
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-3rem)] pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                    interval={2}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    width={28}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="orders"
                    fill="hsl(var(--primary))"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={14}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/80 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Top items</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div className="space-y-2" variants={listParent} initial="hidden" animate="show">
              {live?.topItems?.length ? (
                live.topItems.map((item, idx) => (
                  <motion.div
                    key={item.itemId}
                    variants={listItem}
                    className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-3 transition-colors hover:bg-muted/40 sm:px-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="w-5 shrink-0 text-center text-xs tabular-nums text-muted-foreground">
                        {idx + 1}
                      </span>
                      <span className="truncate text-sm text-foreground">{item.name}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-6 text-right">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Qty</p>
                        <p className="text-sm tabular-nums text-foreground">{item.qty}</p>
                      </div>
                      <div className="w-20">
                        <p className="text-[10px] text-muted-foreground">Revenue</p>
                        <p className="text-sm tabular-nums text-primary">
                          {formatGHS(item.revenue)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {loading ? 'Loading…' : 'No item data yet.'}
                </p>
              )}
            </motion.div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Order status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            {[
              { label: 'Pending', count: live?.statusCounts?.pending, bar: 'bg-amber-500' },
              { label: 'Confirmed', count: live?.statusCounts?.confirmed, bar: 'bg-primary' },
              { label: 'Ready', count: live?.statusCounts?.ready, bar: 'bg-emerald-500' },
              { label: 'Done', count: live?.statusCounts?.done, bar: 'bg-muted-foreground/40' },
            ].map((st) => (
              <div key={st.label} className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{st.label}</span>
                  <span className="tabular-nums text-foreground">{st.count ?? 0}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={cn('h-full rounded-full', st.bar)}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(((st.count ?? 0) / (live?.totalOrders || 1)) * 100, 100)}%`,
                    }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
