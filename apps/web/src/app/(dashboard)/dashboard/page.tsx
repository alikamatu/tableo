'use client';

import * as React from 'react';
import { useAppSelector } from '@/stores/store';
import { useRestaurant } from '@/hooks/use-restaurant';
import {
  Loader2,
  Users,
  Store,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  GitBranch,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, useReducedMotion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  const { current: restaurant, loading: restaurantsLoading } = useRestaurant();
  const reduceMotion = useReducedMotion();

  if (restaurantsLoading && !restaurant) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-primary" size={28} strokeWidth={1.75} />
      </div>
    );
  }

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
    {
      id: '1024',
      customer: 'John Doe',
      amount: '₵85.00',
      status: 'In Preparation',
      time: '5m ago',
    },
    { id: '1023', customer: 'Sarah Smith', amount: '₵120.00', status: 'Ready', time: '12m ago' },
    {
      id: '1022',
      customer: 'Mike Johnson',
      amount: '₵45.50',
      status: 'Completed',
      time: '25m ago',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col justify-between gap-4 md:flex-row md:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 font-medium text-muted-foreground">
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
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
          >
            <Card className="border-none shadow-sm transition-shadow duration-300 hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`rounded-xl p-2.5 ${stat.bg} ${stat.color}`}>
                    <stat.icon size={22} />
                  </div>
                  {stat.trend !== 'neutral' && (
                    <div
                      className={`flex items-center rounded-full px-2 py-1 text-xs font-bold ${
                        stat.trend === 'up'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-red-500/10 text-red-600'
                      }`}
                    >
                      {stat.trend === 'up' ? (
                        <ArrowUpRight size={12} className="mr-1" />
                      ) : (
                        <ArrowDownRight size={12} className="mr-1" />
                      )}
                      {stat.change}
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="mt-1 text-2xl font-bold text-foreground">{stat.value}</h3>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="h-full border-none shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-0">
            <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/5 hover:text-primary"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {recentOrders.map((order, i) => (
                <div key={i} className="group flex cursor-pointer items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-bold transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      #{order.id}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{order.customer}</p>
                      <p className="text-xs font-medium text-muted-foreground">{order.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{order.amount}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'Ready'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : order.status === 'In Preparation'
                            ? 'bg-orange-500/10 text-orange-600'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Tips */}
        <Card className="border border-none border-primary/10 bg-primary/5 shadow-sm">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Store className="text-primary" size={20} />
              Quick Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            <p className="text-sm font-medium text-foreground/80">
              Complete these steps to start taking orders from customers.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Create your first branch', done: true },
                { label: 'Add 5 items to your menu', done: false },
                { label: 'Setup payment methods', done: false },
                { label: 'Verify your business phone', done: false },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 p-3"
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      step.done
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    {step.done && <ArrowUpRight size={12} className="rotate-45" />}
                  </div>
                  <span
                    className={`text-xs font-bold ${step.done ? 'text-foreground/50 line-through' : 'text-foreground'}`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            <Button className="mt-4 w-full bg-primary py-6 font-bold text-primary-foreground hover:bg-primary/90">
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
