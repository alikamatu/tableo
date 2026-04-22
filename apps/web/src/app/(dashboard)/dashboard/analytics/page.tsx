'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Calendar as CalendarIcon,
  Loader2
} from 'lucide-react';
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
  Bar 
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as React from 'react';
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

  useGSAP(() => {
    if (!loading) {
      gsap.from('.analytics-reveal', {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.4,
        ease: 'power3.out'
      });
    }
  }, [loading]);

  if ((restLoading || branchLoading) && !branch) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!branch) return <div className="text-center py-20 text-muted-foreground font-medium">Select a branch to view statistics.</div>;

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
        <div className="bg-card border border-border p-4 rounded-xl shadow-xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
          <p className="text-base font-black text-foreground">{formatGHS(payload[0].value)}</p>
          {payload[1] && <p className="text-[11px] font-bold text-primary mt-1">{payload[1].value} ORDERS</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={containerRef} className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Business Insights</h1>
          <p className="text-muted-foreground mt-1 font-medium">Performance tracking and history.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-muted border border-border">
          <Input 
            type="date" 
            className="h-8 border-none bg-transparent focus-visible:ring-0 text-xs font-bold" 
            value={dateRange.from}
            onValueChange={(v) => setDateRange(d => ({ ...d, from: v }))}
          />
          <div className="text-muted-foreground/30 px-1 font-bold">→</div>
          <Input 
            type="date" 
            className="h-8 border-none bg-transparent focus-visible:ring-0 text-xs font-bold" 
            value={dateRange.to}
            onValueChange={(v) => setDateRange(d => ({ ...d, to: v }))}
          />
        </div>
      </div>

      {/* ─── Key Metrics ────────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Daily Orders", val: live?.totalOrders ?? 0, icon: ShoppingCart, color: 'primary' },
          { label: "Daily Revenue", val: formatGHS(live?.totalRevenue ?? 0), icon: DollarSign, color: 'green' },
          { label: "Avg Ticket", val: formatGHS(live?.avgOrderValue ?? 0), icon: TrendingUp, color: 'blue' },
          { label: "In Pipeline", val: live?.statusCounts?.pending ?? 0, icon: Clock, color: 'yellow' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="analytics-reveal hover:shadow-md transition-all">
              <CardContent className="pt-6 px-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-xl bg-muted border border-border group-hover:bg-primary/10 transition-colors")}>
                    <Icon size={18} className={cn(stat.color === 'primary' ? 'text-primary' : `text-${stat.color}-600 dark:text-${stat.color}-400`)} />
                  </div>
                  <Badge variant="muted" className="text-[8px] font-black tracking-widest bg-muted/50 border-none">LIVE</Badge>
                </div>
                <p className="text-[11px] font-black tracking-tight text-muted-foreground uppercase">{stat.label}</p>
                <p className="text-2xl font-black text-foreground mt-1 tabular-nums">{stat.val}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="analytics-reveal border-border shadow-sm h-[380px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-full pb-14">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700}} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#areaColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="analytics-reveal border-border shadow-sm h-[380px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Order Volume (Hourly)</CardTitle>
          </CardHeader>
          <CardContent className="h-full pb-14">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700}} interval={2} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700}} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="analytics-reveal border-border shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Top Performing Offerings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {live?.topItems.map((item, idx) => (
                <div key={item.itemId} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border hover:bg-muted/60 transition-all group">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-muted-foreground w-4">{idx + 1}</span>
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Quantity</p>
                      <p className="text-sm font-black text-foreground tabular-nums">{item.qty}</p>
                    </div>
                    <div className="text-right w-24">
                      <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Revenue</p>
                      <p className="text-sm font-black text-primary tabular-nums">{formatGHS(item.revenue)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="analytics-reveal border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Order Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {[
              { label: 'Pending', count: live?.statusCounts?.pending, color: 'bg-yellow-500' },
              { label: 'Confirmed', count: live?.statusCounts?.confirmed, color: 'bg-primary' },
              { label: 'Ready', count: live?.statusCounts?.ready, color: 'bg-green-500' },
              { label: 'Done', count: live?.statusCounts?.done, color: 'bg-muted-foreground/30' },
            ].map((st) => (
              <div key={st.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>{st.label}</span>
                  <span className="text-foreground">{st.count ?? 0}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-700", st.color)}
                    style={{ width: `${Math.min(((st.count ?? 0) / (live?.totalOrders || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
