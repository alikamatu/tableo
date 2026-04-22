'use client';

import { 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAppSelector } from '@/stores/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import Link from 'next/link';

export default function ManagerDashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  const { current: branch } = useAppSelector((s) => s.branch);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.stat-card', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
    });
  }, { scope: containerRef });

  const stats = [
    { label: "Today's Orders", value: "42", icon: ShoppingCart, trend: "+12%", trendUp: true },
    { label: "Today's Revenue", value: "GHS 1,240", icon: TrendingUp, trend: "+8%", trendUp: true },
    { label: "Active Staff", value: "5", icon: Users, trend: "Stable", trendUp: null },
    { label: "Avg. Prep Time", value: "18m", icon: Clock, trend: "-2m", trendUp: true },
  ];

  return (
    <div ref={containerRef} className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-fg">
            Welcome back, {user?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-muted text-sm font-medium">
            Here's what's happening at <span className="text-fg font-bold">{branch?.name ?? 'your branch'}</span> today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/manager-dashboard/orders">
            <Button size="sm" variant="outline" className="h-9 font-bold">
              View Orders
            </Button>
          </Link>
          <Link href="/manager-dashboard/orders/new">
            <Button size="sm" className="h-9 font-bold gap-1.5">
              <Plus size={16} strokeWidth={2.5} />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="stat-card border-none bg-surface/50 shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-brand/5 text-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon size={20} strokeWidth={2.5} />
                </div>
                {stat.trendUp !== null && (
                  <Badge variant="secondary" className={cn(
                    "font-bold text-[10px] h-5",
                    stat.trendUp ? "text-success bg-success/5" : "text-danger bg-danger/5"
                  )}>
                    {stat.trendUp ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-0.5">{stat.label}</p>
              <h3 className="text-xl font-black text-fg">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main Content Area ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders */}
        <Card className="lg:col-span-2 border-none bg-surface/30">
          <CardHeader className="flex flex-row items-center justify-between py-5">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs font-bold hover:bg-subtle gap-1">
              View All <ChevronRight size={14} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-subtle flex items-center justify-center mb-3">
                <ShoppingCart className="text-muted" size={20} />
              </div>
              <p className="text-sm font-bold text-fg">No orders yet</p>
              <p className="text-xs text-muted">Orders will appear here once customers start ordering.</p>
            </div>
          </CardContent>
        </Card>

        {/* Branch Info / Actions */}
        <div className="space-y-6">
          <Card className="border-none bg-brand/5 border-l-4 border-brand">
            <CardContent className="p-5">
              <h4 className="text-sm font-black text-brand uppercase tracking-wider mb-2">Manager Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start h-9 text-xs font-bold hover:bg-brand/10 text-brand gap-2">
                  <div className="h-2 w-2 rounded-full bg-brand" />
                  Toggle Branch Status
                </Button>
                <Button variant="ghost" className="w-full justify-start h-9 text-xs font-bold hover:bg-brand/10 text-brand gap-2">
                  <div className="h-2 w-2 rounded-full bg-brand" />
                  Print QR Codes
                </Button>
                <Button variant="ghost" className="w-full justify-start h-9 text-xs font-bold hover:bg-brand/10 text-brand gap-2">
                  <div className="h-2 w-2 rounded-full bg-brand" />
                  Manage Staff
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-surface/30">
            <CardHeader className="py-5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted font-medium">Printer Connection</span>
                <Badge variant="outline" className="text-success border-success/20 bg-success/5 font-bold">Online</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted font-medium">Menu Availability</span>
                <span className="font-bold">98% Available</span>
              </div>
              <Divider />
              <p className="text-[10px] text-muted leading-relaxed">
                Need help? Contact your restaurant administrator or our support team.
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

function Divider() {
  return <div className="h-px w-full bg-border/40" />;
}
