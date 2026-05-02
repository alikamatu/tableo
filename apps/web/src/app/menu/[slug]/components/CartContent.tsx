'use client';

import {
  ShoppingCart,
  Minus,
  Plus,
  Wallet,
  CreditCard,
  Utensils,
  ShoppingBag,
  Check,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatGHS } from '@tableo/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

interface CartContentProps {
  cart: CartItem[];
  cartTotal: number;
  paymentMethod: 'counter' | 'online';
  orderType: 'dine_in' | 'takeaway';
  orderConfirmation: { id: string; orderNumber: string } | null;
  placing: boolean;
  customerName: string;
  customerEmail: string;
  tableNumber: string;
  setCustomerName: (value: string) => void;
  setCustomerEmail: (value: string) => void;
  setTableNumber: (value: string) => void;
  setOrderType: (value: 'dine_in' | 'takeaway') => void;
  setOrderConfirmation: (value: null) => void;
  setPaymentMethod: (value: 'counter' | 'online') => void;
  updateQty: (menuItemId: string, delta: number) => void;
  onSubmit: () => void;
}

export function CartContent({
  cart,
  cartTotal,
  paymentMethod,
  orderType,
  orderConfirmation,
  placing,
  customerName,
  customerEmail,
  tableNumber,
  setCustomerName,
  setCustomerEmail,
  setTableNumber,
  setOrderType,
  setOrderConfirmation,
  setPaymentMethod,
  updateQty,
  onSubmit,
}: CartContentProps) {
  if (orderConfirmation) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center space-y-6 py-12 text-center"
      >
        <div className="bg-primary/10 text-primary flex h-24 w-24 items-center justify-center rounded-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
          >
            <Check size={48} />
          </motion.div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-foreground">Order Placed!</h2>
          <p className="text-muted-foreground text-sm">Your order is being prepared.</p>
        </div>
        <div className="rounded-3xl bg-muted/30 p-6 ring-1 ring-border/50">
          <p className="text-muted-foreground mb-1 text-[10px] font-bold uppercase tracking-widest">
            Order Number
          </p>
          <p className="text-primary text-4xl font-black tracking-tighter">
            #{orderConfirmation.orderNumber}
          </p>
        </div>
        <div className="text-muted-foreground text-sm font-medium">
          {paymentMethod === 'counter' ? (
            <p>Please present this number at the counter to complete your payment.</p>
          ) : (
            <p>You will be notified when your order is ready.</p>
          )}
        </div>
        <Button
          className="h-12 w-full rounded-xl font-bold"
          onClick={() => setOrderConfirmation(null)}
        >
          Back to Menu
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      {cart.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <ShoppingCart size={32} />
          </div>
          <div className="space-y-1">
            <p className="font-black text-foreground">Your cart is empty</p>
            <p className="text-sm">Add some delicious items to start your order.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.menuItemId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between rounded-2xl border border-border/50 bg-muted/20 p-3"
              >
                <div className="min-w-0 pr-2">
                  <p className="truncate text-sm font-black text-foreground">{item.name}</p>
                  <p className="text-primary text-xs font-bold">{formatGHS(item.price)} each</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-surface p-1 shadow-sm ring-1 ring-border/50">
                  <button
                    onClick={() => updateQty(item.menuItemId, -1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-muted"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="min-w-[20px] text-center text-xs font-black">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.menuItemId, 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-muted"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {cart.length > 0 && (
        <>
          <div className="space-y-4 border-t border-border/50 pt-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                Order Type
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={orderType === 'dine_in' ? 'primary' : 'outline'}
                  className={cn(
                    'h-11 rounded-xl font-bold transition-all',
                    orderType === 'dine_in' && 'shadow-primary/20 shadow-lg',
                  )}
                  onClick={() => setOrderType('dine_in')}
                >
                  <Utensils size={16} className="mr-2" />
                  Dine-in
                </Button>
                <Button
                  type="button"
                  variant={orderType === 'takeaway' ? 'primary' : 'outline'}
                  className={cn(
                    'h-11 rounded-xl font-bold transition-all',
                    orderType === 'takeaway' && 'shadow-primary/20 shadow-lg',
                  )}
                  onClick={() => setOrderType('takeaway')}
                >
                  <ShoppingBag size={16} className="mr-2" />
                  Takeaway
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                Payment Method
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === 'counter' ? 'primary' : 'outline'}
                  className={cn(
                    'h-11 rounded-xl font-bold transition-all',
                    paymentMethod === 'counter' && 'shadow-primary/20 shadow-lg',
                  )}
                  onClick={() => setPaymentMethod('counter')}
                >
                  <Wallet size={16} className="mr-2" />
                  Cash
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'online' ? 'primary' : 'outline'}
                  className={cn(
                    'h-11 rounded-xl font-bold transition-all',
                    paymentMethod === 'online' && 'shadow-primary/20 shadow-lg',
                  )}
                  onClick={() => setPaymentMethod('online')}
                >
                  <CreditCard size={16} className="mr-2" />
                  Online
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={customerName}
                onValueChange={setCustomerName}
                className="h-11 rounded-xl border-none bg-muted/30 ring-1 ring-border/50 focus:ring-2"
              />
              {paymentMethod === 'online' && (
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={customerEmail}
                  onValueChange={setCustomerEmail}
                  className="h-11 rounded-xl border-none bg-muted/30 ring-1 ring-border/50 focus:ring-2"
                />
              )}
              {orderType === 'dine_in' && (
                <Input
                  label="Table Number"
                  placeholder="e.g. Table 5"
                  value={tableNumber}
                  onValueChange={setTableNumber}
                  className="h-11 rounded-xl border-none bg-muted/30 ring-1 ring-border/50 focus:ring-2"
                />
              )}
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-muted-foreground text-sm font-bold">Order Total</span>
              <span className="text-primary text-2xl font-black">{formatGHS(cartTotal)}</span>
            </div>

            <Button
              className="shadow-primary/20 h-14 w-full rounded-2xl text-base font-black shadow-xl"
              loading={placing}
              disabled={cart.length === 0}
              onClick={onSubmit}
            >
              <span className="mr-2">
                {paymentMethod === 'online' ? 'Pay & Place Order' : 'Complete Order'}
              </span>
              <ChevronRight size={18} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
