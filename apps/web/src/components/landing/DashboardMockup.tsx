'use client';

import { BarChart3, Clock, ShoppingCart, TrendingUp } from 'lucide-react';

export function DashboardMockup() {
  return (
    <div className="p-8 md:p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-fg mb-1">Dashboard</h3>
          <p className="text-sm text-muted">Real-time order & analytics overview</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand/10" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-subtle/50 border border-subtle">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Today's Orders</p>
            <ShoppingCart size={16} className="text-brand" />
          </div>
          <p className="text-2xl font-bold text-fg">24</p>
          <p className="text-xs text-muted mt-2">+12% from yesterday</p>
        </div>

        <div className="p-4 rounded-xl bg-subtle/50 border border-subtle">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Revenue</p>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-fg">₵1,240</p>
          <p className="text-xs text-muted mt-2">+8% from last week</p>
        </div>

        <div className="p-4 rounded-xl bg-subtle/50 border border-subtle">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Avg Time</p>
            <Clock size={16} className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-fg">12m</p>
          <p className="text-xs text-muted mt-2">Order to delivery</p>
        </div>

        <div className="p-4 rounded-xl bg-subtle/50 border border-subtle">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Branches</p>
            <BarChart3 size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-fg">3</p>
          <p className="text-xs text-muted mt-2">Active locations</p>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="p-6 rounded-xl bg-subtle/50 border border-subtle">
        <h4 className="text-sm font-semibold text-fg mb-4">Orders This Week</h4>
        <div className="flex items-end justify-around h-40 gap-2">
          {[40, 65, 45, 70, 55, 80, 60].map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-lg bg-brand/40 hover:bg-brand/60 transition-all"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="flex justify-around mt-4 text-xs text-muted">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8 p-6 rounded-xl bg-subtle/50 border border-subtle">
        <h4 className="text-sm font-semibold text-fg mb-4">Recent Orders</h4>
        <div className="space-y-3">
          {['Jollof Rice Combo', 'Mixed Grill Platter', 'Fufu & Light Soup'].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-bg rounded-lg">
              <div>
                <p className="text-sm font-medium text-fg">{item}</p>
                <p className="text-xs text-muted">Just now</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-medium">
                Completed
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
