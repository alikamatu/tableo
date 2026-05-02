'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RefreshCw,
  ChefHat,
  CheckCircle2,
  XCircle,
  Clock3,
  ShoppingCart,
  User as UserIcon,
  Loader2,
  Wallet,
  Printer,
  ExternalLink,
} from 'lucide-react';
import api from '@/lib/api';
import { formatGHS } from '@tableo/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as React from 'react';
import toast from 'react-hot-toast';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/stores/store';

function toAmount(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === 'object' && value !== null) {
    // Prisma Decimal objects often have a 'toNumber' method or can be cast to string
    if ('toNumber' in value && typeof value.toNumber === 'function') {
      return value.toNumber() as number;
    }
    if ('toString' in value && typeof value.toString === 'function') {
      const parsed = Number.parseFloat(value.toString());
      return Number.isFinite(parsed) ? parsed : 0;
    }
    // Handle raw Prisma Decimal object structure { d: [...], s: 1, e: 0 }
    if ('d' in value && 's' in value && 'e' in value) {
      const parsed = Number.parseFloat(String(value));
      return Number.isFinite(parsed) ? parsed : 0;
    }
  }
  return 0;
}

interface OrderItem {
  id: string;
  nameSnapshot: string;
  unitPrice: string;
  quantity: number;
  note: string | null;
}

interface Order {
  id: string;
  orderNumber: string | null;
  type: 'dine_in' | 'takeaway' | 'delivery';
  tableNumber: string | null;
  customerName: string | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: string;
  createdAt: string;
  orderItems: OrderItem[];
}

const STATUS_CONFIG: Record<
  string,
  {
    color: 'warning' | 'primary' | 'success' | 'danger' | 'muted';
    icon: React.ElementType;
    label: string;
  }
> = {
  pending: { color: 'warning', icon: Clock3, label: 'New' },
  confirmed: { color: 'primary', icon: ChefHat, label: 'Kitchen' },
  ready: { color: 'success', icon: CheckCircle2, label: 'Ready' },
  done: { color: 'muted', icon: CheckCircle2, label: 'Served' },
  cancelled: { color: 'danger', icon: XCircle, label: 'Cancelled' },
};

const NEXT_STATUS: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'ready',
  ready: 'done',
};

export function OrdersView({ title = 'Active Orders' }: { title?: string }) {
  const { current: branch, loading: branchLoading } = useAppSelector((s) => s.branch);
  const { loading: restLoading } = useAppSelector((s) => s.restaurant);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const containerRef = useRef(null);

  const parseOrdersResponse = (payload: unknown): Order[] => {
    // Supports both wrapped interceptor shape and direct array shape.
    const root = (payload as { data?: any })?.data ?? payload;
    if (Array.isArray(root)) return root as Order[];
    if (typeof root === 'object' && root !== null && Array.isArray((root as any).data)) {
      return (root as any).data as Order[];
    }
    return [];
  };

  const load = useCallback(async () => {
    if (!branch) return;
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get(`/branches/${branch.id}/orders`, { params });
      setOrders(parseOrdersResponse(data));
    } catch {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
      setLastSynced(new Date());
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
        ease: 'power2.out',
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

  const toggleCashPayment = async (order: Order) => {
    if (!branch || order.paymentMethod !== 'counter') return;
    const nextStatus = order.paymentStatus === 'paid' ? 'unpaid' : 'paid';
    try {
      await api.patch(`/branches/${branch.id}/orders/${order.id}/payment`, {
        paymentStatus: nextStatus,
      });
      toast.success(nextStatus === 'paid' ? 'Marked as paid' : 'Marked as unpaid');
      load();
    } catch {
      toast.error('Payment update failed');
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

  const verifyOnlinePayment = async (order: Order) => {
    try {
      await api.post(`/orders/${order.id}/verify-paystack`, {});
      toast.success('Payment verified');
      load();
    } catch {
      toast.error('Verification failed');
    }
  };

  const printKOT = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.orderItems
      .map(
        (item) => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>${item.quantity}x ${item.nameSnapshot}</span>
      </div>
    `,
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>KOT #${order.orderNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; width: 300px; }
            .header { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .footer { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin: 0;">KOT #${order.orderNumber}</h2>
            <p style="margin: 5px 0;">${order.tableNumber ? 'Table: ' + order.tableNumber : 'Takeaway'}</p>
            <p style="margin: 5px 0;">${format(new Date(order.createdAt), 'HH:mm')}</p>
          </div>
          <div class="items">
            ${itemsHtml}
          </div>
          <div class="footer">
            <p>Tableo Order Management</p>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if ((restLoading || branchLoading) && !branch) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  if (!branch)
    return (
      <div className="text-muted-foreground py-20 text-center font-medium italic">
        Please select a branch to manage orders.
      </div>
    );

  const filters = ['all', 'pending', 'confirmed', 'ready', 'done', 'cancelled'];

  // Calculate metrics
  const todayOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  });
  const revenue = todayOrders.reduce((sum, o) => sum + toAmount(o.total), 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Metrics Bar */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/10 shadow-none">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <ShoppingCart size={20} />
            </div>
            <div>
              <p className="text-primary/60 text-[10px] font-black uppercase tracking-widest">
                Total Today
              </p>
              <p className="text-xl font-black text-foreground">{todayOrders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-500/10 bg-orange-500/5 shadow-none">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
              <Clock3 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-600/60">
                Pending
              </p>
              <p className="text-xl font-black text-foreground">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/10 bg-green-500/5 shadow-none">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-600">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-green-600/60">
                Revenue Today
              </p>
              <p className="text-xl font-black text-foreground">{formatGHS(revenue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">{title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-muted-foreground text-sm font-medium">
              Flow for <span className="text-primary font-bold">{branch.name}</span>
            </p>
            <span className="text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">
              • Updated {format(lastSynced, 'HH:mm:ss')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex rounded-xl border border-border bg-muted p-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  'rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
                  statusFilter === f
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5'
                    : 'text-muted-foreground/60 hover:text-foreground',
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
        <Card className="border-dashed p-20 text-center">
          <CardContent className="flex flex-col items-center gap-6">
            <div className="text-muted-foreground flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <ShoppingCart size={32} />
            </div>
            <p className="text-muted-foreground text-xl font-bold">
              No orders matching your filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-muted-foreground px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                    Order
                  </th>
                  <th className="text-muted-foreground px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                    Customer / Table
                  </th>
                  <th className="text-muted-foreground px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                    Type
                  </th>
                  <th className="text-muted-foreground px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">
                    Status
                  </th>
                  <th className="text-muted-foreground px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest">
                    Total
                  </th>
                  <th className="text-muted-foreground px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">
                    Payment
                  </th>
                  <th className="text-muted-foreground px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence mode="popLayout">
                  {orders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending!;
                    const Icon = cfg.icon;
                    return (
                      <motion.tr
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key={order.id}
                        className="group cursor-pointer transition-colors hover:bg-muted/20"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-foreground">
                              #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                            </span>
                            <span className="text-muted-foreground mt-0.5 text-[10px] font-bold uppercase tracking-tighter">
                              {format(new Date(order.createdAt), 'MMM d, HH:mm')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="text-muted-foreground flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                              <UserIcon size={14} />
                            </div>
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate text-xs font-black text-foreground">
                                {order.customerName || 'Walk-in Customer'}
                              </span>
                              <span className="text-muted-foreground text-[10px] font-bold">
                                {order.tableNumber
                                  ? `Table ${order.tableNumber}`
                                  : 'Online / Pickup'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className="rounded-md text-[9px] font-black uppercase tracking-tighter"
                          >
                            {order.type?.replace('_', ' ') || 'dine in'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge
                            variant={
                              cfg.color as 'warning' | 'primary' | 'success' | 'danger' | 'muted'
                            }
                            className="inline-flex items-center gap-1.5 px-2 py-0.5"
                          >
                            <Icon size={10} />
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-black tabular-nums text-foreground">
                            {formatGHS(toAmount(order.total))}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center gap-1">
                            <Badge
                              variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                              className="px-2 text-[9px] uppercase tracking-tighter"
                            >
                              {order.paymentStatus}
                            </Badge>
                            <span className="text-muted-foreground text-[8px] font-black uppercase opacity-50">
                              {order.paymentMethod}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div
                            className="flex items-center justify-end gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {order.status !== 'done' && order.status !== 'cancelled' && (
                              <Button
                                size="sm"
                                className="h-8 px-3 text-[10px] font-black uppercase tracking-widest"
                                onClick={() => advanceStatus(order)}
                              >
                                {`Move to ${NEXT_STATUS[order.status] ?? 'next'}`}
                              </Button>
                            )}
                            {order.status !== 'done' && order.status !== 'cancelled' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 rounded-lg"
                                onClick={() => cancelOrder(order)}
                              >
                                <XCircle size={16} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <ModalContent className="max-w-md">
            <ModalHeader>
              <ModalTitle className="flex items-center justify-between">
                <span className="text-xl font-black">
                  Order #{selectedOrder.orderNumber || selectedOrder.id.slice(-6).toUpperCase()}
                </span>
                <Badge
                  variant={
                    (STATUS_CONFIG[selectedOrder.status]?.color ?? 'muted') as
                      | 'warning'
                      | 'primary'
                      | 'success'
                      | 'danger'
                      | 'muted'
                  }
                >
                  {STATUS_CONFIG[selectedOrder.status]?.label}
                </Badge>
              </ModalTitle>
            </ModalHeader>
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-muted/30 p-3 ring-1 ring-border/50">
                  <p className="text-muted-foreground mb-1 text-[9px] font-black uppercase">
                    Customer
                  </p>
                  <p className="text-xs font-bold">{selectedOrder.customerName || 'Walk-in'}</p>
                </div>
                <div className="rounded-2xl bg-muted/30 p-3 ring-1 ring-border/50">
                  <p className="text-muted-foreground mb-1 text-[9px] font-black uppercase">
                    Location
                  </p>
                  <p className="text-xs font-bold">
                    {selectedOrder.tableNumber ? `Table ${selectedOrder.tableNumber}` : 'Takeaway'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-muted-foreground px-1 text-[10px] font-black uppercase tracking-[0.2em]">
                  Order Items
                </p>
                <div className="space-y-2">
                  {selectedOrder.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black">
                          {item.quantity}
                        </span>
                        <span className="text-xs font-bold">{item.nameSnapshot}</span>
                      </div>
                      <span className="text-xs font-bold tabular-nums">
                        {formatGHS(toAmount(item.unitPrice) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-muted-foreground text-[10px] font-black uppercase">
                      Total Amount
                    </p>
                    <p className="text-2xl font-black tabular-nums">
                      {formatGHS(toAmount(selectedOrder.total))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-[10px] font-black uppercase">
                      Payment Status
                    </p>
                    <Badge
                      variant={selectedOrder.paymentStatus === 'paid' ? 'success' : 'warning'}
                      className="mt-1"
                    >
                      {selectedOrder.paymentStatus.toUpperCase()} ({selectedOrder.paymentMethod})
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="h-12 flex-1 rounded-xl font-bold"
                    onClick={() => printKOT(selectedOrder)}
                  >
                    <Printer size={18} className="mr-2" />
                    Print KOT
                  </Button>
                  {selectedOrder.paymentMethod === 'online' &&
                    selectedOrder.paymentStatus !== 'paid' && (
                      <Button
                        variant="outline"
                        className="text-primary border-primary/20 bg-primary/5 h-12 flex-1 rounded-xl font-bold"
                        onClick={() => {
                          verifyOnlinePayment(selectedOrder);
                          setSelectedOrder(null);
                        }}
                      >
                        <ExternalLink size={18} className="mr-2" />
                        Verify Online
                      </Button>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant={selectedOrder.paymentStatus === 'paid' ? 'outline' : 'primary'}
                      className="h-12 flex-1 rounded-xl font-bold"
                      onClick={() => {
                        toggleCashPayment(selectedOrder);
                        setSelectedOrder(null);
                      }}
                    >
                      <Wallet size={18} className="mr-2" />
                      {selectedOrder.paymentStatus === 'paid' ? 'Mark as Unpaid' : 'Mark as Paid'}
                    </Button>
                    {selectedOrder.status !== 'done' && selectedOrder.status !== 'cancelled' && (
                      <Button
                        className="h-12 flex-1 rounded-xl font-bold"
                        onClick={() => {
                          advanceStatus(selectedOrder);
                          setSelectedOrder(null);
                        }}
                      >
                        {`Move to ${NEXT_STATUS[selectedOrder.status] ?? 'next'}`}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
