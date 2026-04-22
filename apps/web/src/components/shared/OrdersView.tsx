'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  RefreshCw, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  XCircle, 
  Clock3,
  ShoppingCart,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { useAppSelector } from '@/stores/store';
import api from '@/lib/api';
import { formatGHS } from '@tableo/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as React from 'react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  nameSnapshot: string;
  unitPrice: string;
  quantity: number;
  note: string | null;
}

interface Order {
  id: string;
  tableNumber: string | null;
  customerName: string | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: string;
  createdAt: string;
  orderItems: OrderItem[];
}

const STATUS_CONFIG: Record<string, { color: 'warning' | 'primary' | 'success' | 'danger' | 'muted'; icon: any; label: string }> = {
  pending: { color: 'warning', icon: Clock3, label: 'NEW' },
  confirmed: { color: 'primary', icon: ChefHat, label: 'KITCHEN' },
  ready: { color: 'success', icon: CheckCircle2, label: 'READY' },
  done: { color: 'muted', icon: CheckCircle2, label: 'SERVED' },
  cancelled: { color: 'danger', icon: XCircle, label: 'CANCELLED' },
};

const NEXT_STATUS: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'ready',
  ready: 'done',
};

export function OrdersView({ title = "Active Orders" }: { title?: string }) {
  const { current: branch, loading: branchLoading } = useAppSelector((s) => s.branch);
  const { loading: restLoading } = useAppSelector((s) => s.restaurant);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const containerRef = useRef(null);

  const load = useCallback(async () => {
    if (!branch) return;
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get(`/branches/${branch.id}/orders`, { params });
      setOrders(data.data.data ?? data.data);
    } catch {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  }, [branch, statusFilter]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [load]);

  useGSAP(() => {
    if (!loading) {
      gsap.from('.order-card', {
        opacity: 0,
        y: 5,
        stagger: 0.03,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }, [loading, statusFilter]);

  const advanceStatus = async (order: Order) => {
    if (!branch) return;
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      await api.patch(`/branches/${branch.id}/orders/${order.id}/status`, { status: next });
      toast.success(`${next.toUpperCase()}`);
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const cancelOrder = async (order: Order) => {
    if (!branch) return;
    try {
      await api.patch(`/branches/${branch.id}/orders/${order.id}/status`, { status: 'cancelled' });
      toast.success('CANCELLED');
      load();
    } catch {
      toast.error('Action failed');
    }
  };

  if ((restLoading || branchLoading) && !branch) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!branch) return <div className="text-center py-20 text-muted-foreground font-medium">Select a branch to view orders.</div>;

  const filters = ['all', 'pending', 'confirmed', 'ready', 'done', 'cancelled'];

  return (
    <div ref={containerRef}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-1 font-medium">Real-time order flow for <span className="text-foreground font-bold">{branch.name}</span></p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex p-1 rounded-xl bg-muted border border-border">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest",
                  statusFilter === f 
                    ? "bg-background text-foreground shadow-sm ring-1 ring-black/5" 
                    : "text-muted-foreground/60 hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => load()}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {orders.length === 0 && !loading ? (
        <Card className="p-20 text-center order-card border-dashed">
          <CardContent className="flex flex-col items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <ShoppingCart size={32} />
            </div>
            <p className="text-xl font-bold text-foreground">Waiting for initial order...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending!;
            const Icon = cfg.icon;
            return (
              <Card key={order.id} className="order-card border-border flex flex-col group hover:shadow-md transition-all active:scale-[0.99] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-4 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", `bg-${cfg.color === 'primary' ? 'primary' : cfg.color === 'muted' ? 'muted' : cfg.color === 'success' ? 'green-500' : cfg.color === 'warning' ? 'yellow-500' : 'red-500'}/10 text-${cfg.color === 'muted' ? 'muted-foreground' : cfg.color === 'primary' ? 'primary' : cfg.color === 'success' ? 'green-600' : cfg.color === 'warning' ? 'yellow-600' : 'red-600'}`)}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">
                        {order.tableNumber ? `Table ${order.tableNumber}` : 'Online Order'}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                        <Clock size={10} />
                        {format(new Date(order.createdAt), 'HH:mm')} • {order.id.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <Badge variant={cfg.color as any}>
                    {cfg.label}
                  </Badge>
                </CardHeader>

                <CardContent className="flex-1 p-5 space-y-4">
                  {order.customerName && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-foreground bg-muted/50 p-2 rounded-lg">
                      <UserIcon size={14} className="text-primary" />
                      {order.customerName.toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-2.5 py-1">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="h-5 w-5 flex items-center justify-center rounded bg-primary text-[10px] font-black text-primary-foreground shrink-0 mt-0.5">
                            {item.quantity}
                          </span>
                          <span className="text-[11px] font-bold text-foreground leading-tight">{item.nameSnapshot}</span>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{formatGHS(parseFloat(item.unitPrice) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <p className="text-lg font-black text-foreground tabular-nums">{formatGHS(parseFloat(order.total))}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="muted" className="text-[8px] tracking-tighter">{order.paymentMethod}</Badge>
                        <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'} className="text-[8px] tracking-tighter">
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                    
                    {order.status !== 'done' && order.status !== 'cancelled' && (
                      <div className="flex gap-2">
                        {NEXT_STATUS[order.status] && (
                          <Button 
                            className="h-9 px-4 text-[10px] font-black uppercase tracking-widest"
                            onClick={() => advanceStatus(order)}
                          >
                            Proceed
                          </Button>
                        )}
                        <Button
                          variant="muted"
                          size="icon"
                          className="h-9 w-9 text-destructive group-hover:bg-destructive/10"
                          onClick={() => cancelOrder(order)}
                        >
                          <XCircle size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
