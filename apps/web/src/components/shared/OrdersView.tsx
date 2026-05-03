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
  ClipboardList,
} from 'lucide-react';
import api from '@/lib/api';
import { formatGHS } from '@tableo/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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
    <motion.div
      ref={containerRef}
      className="mx-auto max-w-6xl space-y-6 pb-16 sm:space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02 }}
        >
          <Card className="bg-primary/5 border-border/80">
            <CardContent className="flex items-center gap-3 p-3 sm:p-4">
              <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <ShoppingCart size={18} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Today</p>
                <p className="text-lg tabular-nums text-foreground sm:text-xl">
                  {todayOrders.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
        >
          <Card className="border-border/80 bg-amber-500/5">
            <CardContent className="flex items-center gap-3 p-3 sm:p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock3 size={18} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Pending</p>
                <p className="text-lg tabular-nums text-foreground sm:text-xl">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/80 bg-emerald-500/5">
            <CardContent className="flex items-center gap-3 p-3 sm:p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Wallet size={18} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Revenue today</p>
                <p className="text-base tabular-nums text-foreground sm:text-lg">
                  {formatGHS(revenue)}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <ClipboardList size={18} strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-lg font-medium tracking-tight text-foreground sm:text-xl">
              {title}
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {branch.name}
              <span className="text-muted-foreground/60 ml-2 text-xs tabular-nums">
                · {format(lastSynced, 'HH:mm:ss')}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 rounded-lg border border-border bg-muted/50 p-0.5 sm:flex-initial">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-xs transition-all sm:px-3',
                  statusFilter === f
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => load()}>
            <RefreshCw size={16} strokeWidth={1.75} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {orders.length === 0 && !loading ? (
        <Card className="border-dashed border-border/80 bg-muted/10">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center sm:py-20">
            <div className="text-muted-foreground flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
              <ShoppingCart size={26} strokeWidth={1.75} />
            </div>
            <p className="text-muted-foreground text-sm">No orders for this filter.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="space-y-3 md:hidden">
            <AnimatePresence mode="popLayout">
              {orders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending!;
                const Icon = cfg.icon;
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    key={order.id}
                  >
                    <Card
                      className="cursor-pointer border-border/80 transition-colors active:bg-muted/30"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm tabular-nums text-foreground">
                              #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              {format(new Date(order.createdAt), 'MMM d, HH:mm')}
                            </p>
                          </div>
                          <Badge
                            variant={
                              cfg.color as 'warning' | 'primary' | 'success' | 'danger' | 'muted'
                            }
                            className="inline-flex items-center gap-1 text-[10px] font-normal"
                          >
                            <Icon size={11} strokeWidth={1.75} />
                            {cfg.label}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <UserIcon size={14} strokeWidth={1.75} />
                          <span className="truncate">
                            {order.customerName || 'Walk-in'}
                            {order.tableNumber ? ` · Table ${order.tableNumber}` : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-border/60 pt-3">
                          <span className="text-sm tabular-nums text-foreground">
                            {formatGHS(toAmount(order.total))}
                          </span>
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {order.status !== 'done' && order.status !== 'cancelled' && (
                              <Button
                                size="sm"
                                className="h-8 px-3 text-xs"
                                onClick={() => advanceStatus(order)}
                              >
                                Next
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Desktop: table */}
          <div className="bg-card hidden overflow-hidden rounded-xl border border-border/80 md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/25">
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium lg:px-6">
                      Order
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium lg:px-6">
                      Customer
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium lg:px-6">
                      Type
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-center text-xs font-medium lg:px-6">
                      Status
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-right text-xs font-medium lg:px-6">
                      Total
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-center text-xs font-medium lg:px-6">
                      Pay
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-right text-xs font-medium lg:px-6">
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
                          <td className="px-4 py-3 lg:px-6">
                            <div className="flex flex-col">
                              <span className="text-sm tabular-nums text-foreground">
                                #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                              </span>
                              <span className="text-muted-foreground mt-0.5 text-xs">
                                {format(new Date(order.createdAt), 'MMM d, HH:mm')}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 lg:px-6">
                            <div className="flex items-center gap-2">
                              <div className="text-muted-foreground flex h-8 w-8 items-center justify-center rounded-lg bg-muted/80">
                                <UserIcon size={14} strokeWidth={1.75} />
                              </div>
                              <div className="flex min-w-0 flex-col">
                                <span className="truncate text-xs text-foreground">
                                  {order.customerName || 'Walk-in'}
                                </span>
                                <span className="text-muted-foreground text-[11px]">
                                  {order.tableNumber
                                    ? `Table ${order.tableNumber}`
                                    : 'Pickup / online'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 lg:px-6">
                            <Badge variant="outline" className="text-[10px] font-normal capitalize">
                              {order.type?.replace('_', ' ') || 'dine in'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center lg:px-6">
                            <Badge
                              variant={
                                cfg.color as 'warning' | 'primary' | 'success' | 'danger' | 'muted'
                              }
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-normal"
                            >
                              <Icon size={11} strokeWidth={1.75} />
                              {cfg.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right lg:px-6">
                            <span className="text-sm tabular-nums text-foreground">
                              {formatGHS(toAmount(order.total))}
                            </span>
                          </td>
                          <td className="px-4 py-3 lg:px-6">
                            <div className="flex flex-col items-center gap-0.5">
                              <Badge
                                variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                                className="px-2 text-[10px] font-normal capitalize"
                              >
                                {order.paymentStatus}
                              </Badge>
                              <span className="text-muted-foreground text-[10px] opacity-70">
                                {order.paymentMethod}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right lg:px-6">
                            <div
                              className="flex items-center justify-end gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {order.status !== 'done' && order.status !== 'cancelled' && (
                                <Button
                                  size="sm"
                                  className="h-8 px-3 text-xs"
                                  onClick={() => advanceStatus(order)}
                                >
                                  {`→ ${NEXT_STATUS[order.status] ?? 'next'}`}
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
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <ModalContent className="max-w-md">
            <ModalHeader>
              <ModalTitle className="flex items-center justify-between gap-2">
                <span className="text-base font-medium text-foreground">
                  #{selectedOrder.orderNumber || selectedOrder.id.slice(-6).toUpperCase()}
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
                <div className="rounded-xl bg-muted/30 p-3 ring-1 ring-border/40">
                  <p className="text-muted-foreground mb-1 text-xs">Customer</p>
                  <p className="text-sm">{selectedOrder.customerName || 'Walk-in'}</p>
                </div>
                <div className="rounded-xl bg-muted/30 p-3 ring-1 ring-border/40">
                  <p className="text-muted-foreground mb-1 text-xs">Location</p>
                  <p className="text-sm">
                    {selectedOrder.tableNumber ? `Table ${selectedOrder.tableNumber}` : 'Takeaway'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-muted-foreground px-1 text-xs">Items</p>
                <div className="space-y-2">
                  {selectedOrder.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/15 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="bg-primary/15 text-primary flex h-6 w-6 items-center justify-center rounded-md text-xs tabular-nums">
                          {item.quantity}
                        </span>
                        <span className="text-sm">{item.nameSnapshot}</span>
                      </div>
                      <span className="text-sm tabular-nums">
                        {formatGHS(toAmount(item.unitPrice) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Total</p>
                    <p className="text-xl tabular-nums text-foreground sm:text-2xl">
                      {formatGHS(toAmount(selectedOrder.total))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">Payment</p>
                    <Badge
                      variant={selectedOrder.paymentStatus === 'paid' ? 'success' : 'warning'}
                      className="mt-1 font-normal capitalize"
                    >
                      {selectedOrder.paymentStatus} · {selectedOrder.paymentMethod}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    className="h-11 flex-1 rounded-lg"
                    onClick={() => printKOT(selectedOrder)}
                  >
                    <Printer size={17} strokeWidth={1.75} className="mr-2" />
                    Print KOT
                  </Button>
                  {selectedOrder.paymentMethod === 'online' &&
                    selectedOrder.paymentStatus !== 'paid' && (
                      <Button
                        variant="outline"
                        className="border-primary/25 bg-primary/5 text-primary h-11 flex-1 rounded-lg"
                        onClick={() => {
                          verifyOnlinePayment(selectedOrder);
                          setSelectedOrder(null);
                        }}
                      >
                        <ExternalLink size={17} strokeWidth={1.75} className="mr-2" />
                        Verify online
                      </Button>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      variant={selectedOrder.paymentStatus === 'paid' ? 'outline' : 'primary'}
                      className="h-11 flex-1 rounded-lg"
                      onClick={() => {
                        toggleCashPayment(selectedOrder);
                        setSelectedOrder(null);
                      }}
                    >
                      <Wallet size={17} strokeWidth={1.75} className="mr-2" />
                      {selectedOrder.paymentStatus === 'paid' ? 'Mark unpaid' : 'Mark paid'}
                    </Button>
                    {selectedOrder.status !== 'done' && selectedOrder.status !== 'cancelled' && (
                      <Button
                        className="h-11 flex-1 rounded-lg"
                        onClick={() => {
                          advanceStatus(selectedOrder);
                          setSelectedOrder(null);
                        }}
                      >
                        {`Next: ${NEXT_STATUS[selectedOrder.status] ?? 'step'}`}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}
    </motion.div>
  );
}
