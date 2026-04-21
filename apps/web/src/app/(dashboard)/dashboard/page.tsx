'use client';

import * as React from 'react';
import { useAppSelector } from '@/stores/store';
import { useRestaurant } from '@/hooks/use-restaurant';
import { 
  Users, 
  Store, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  ShoppingCart,
  GitBranch
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function DashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  const { current: restaurant, loading: restaurantsLoading } = useRestaurant();
  const containerRef = React.useRef(null);

  useGSAP(() => {
    gsap.from('.dash-reveal', {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power4.out',
    });
  }, { scope: containerRef });

  const stats = [
    {
      title: 'Total Revenue',
      value: '₵12,450.00',
      change: '+12.5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Active Orders',
      value: '24',
      change: '+4 since last hour',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Total Staff',
      value: '8',
      change: 'Active now',
      trend: 'neutral',
      icon: Users,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      title: 'Active Branches',
      value: '2/3',
      change: '1 branch offline',
      trend: 'down',
      icon: GitBranch,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  const recentOrders = [
    { id: '1024', customer: 'John Doe', amount: '₵85.00', status: 'In Preparation', time: '5m ago' },
    { id: '1023', customer: 'Sarah Smith', amount: '₵120.00', status: 'Ready', time: '12m ago' },
    { id: '1022', customer: 'Mike Johnson', amount: '₵45.50', status: 'Completed', time: '25m ago' },
  ];

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Welcome Section */}
      <div className="dash-reveal flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Here&apos;s what&apos;s happening with {restaurant?.name || 'your restaurant'} today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Clock size={16} />
            History
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20">
            View Analytics
            <ArrowUpRight size={16} />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="dash-reveal border-none shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                {stat.trend !== 'neutral' && (
                  <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                    stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                    {stat.change}
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="dash-reveal lg:col-span-2 border-none shadow-sm h-full">
          <CardHeader className="p-6 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">View All</Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {recentOrders.map((order, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      #{order.id}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{order.customer}</p>
                      <p className="text-xs text-muted-foreground font-medium">{order.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{order.amount}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      order.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-600' : 
                      order.status === 'In Preparation' ? 'bg-orange-500/10 text-orange-600' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Tips */}
        <Card className="dash-reveal border-none shadow-sm bg-primary/5 border border-primary/10">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Store className="text-primary" size={20} />
              Quick Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <p className="text-sm text-foreground/80 font-medium">
              Complete these steps to start taking orders from customers.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Create your first branch', done: true },
                { label: 'Add 5 items to your menu', done: false },
                { label: 'Setup payment methods', done: false },
                { label: 'Verify your business phone', done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    step.done ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'
                  }`}>
                    {step.done && <ArrowUpRight size={12} className="rotate-45" />}
                  </div>
                  <span className={`text-xs font-bold ${step.done ? 'text-foreground/50 line-through' : 'text-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6">
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
