'use client';

import { use, useEffect, useMemo, useState, useRef } from 'react';
import { Info, ShoppingCart, Search, ChevronUp, ChevronRight, X } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import toast from 'react-hot-toast';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

import { MenuHero } from './components/MenuHero';
import { CategoryBar } from './components/CategoryBar';
import { MenuSection } from './components/MenuSection';
import { CartContent, type CartItem } from './components/CartContent';
import { ItemDetailsModal, RestaurantInfoModal } from './components/Modals';
import { MenuSkeleton } from './components/MenuSkeleton';
import { type MenuItem } from './components/MenuItemCard';
import { type MenuCategory } from './components/MenuSection';

interface MenuData {
  branch: {
    id: string;
    name: string;
    logoUrl: string | null;
    address: string | null;
    currency?: string;
    paystackPublicKey: string | null;
    paystackSubaccountCode: string | null;
    restaurant?: { name: string; slug: string; branches?: { name: string; slug: string }[] };
  };
  recommendations?: MenuItem[];
  categories: MenuCategory[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload)
    return (payload as { data: T }).data;
  return payload as T;
}

function formatCurrency(amount: number, currency = 'GHS') {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency }).format(
    Number.isFinite(amount) ? amount : 0,
  );
}

/** Generate a unique Paystack reference per payment attempt */
function makeRef() {
  return `tbl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function PublicMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [orderConfirmation, setOrderConfirmation] = useState<{
    id: string;
    orderNumber: string;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'counter' | 'online'>('counter');
  const [placing, setPlacing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const reduceMotion = useReducedMotion();

  // Keep a fresh reference for each payment attempt
  const paystackRefRef = useRef<string>(makeRef());

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const fallbackKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY ?? '';

  const initializePayment = usePaystackPayment({
    reference: paystackRefRef.current,
    email: customerEmail || 'customer@tableo.app',
    amount: Math.round(cartTotal * 100),
    publicKey: menu?.branch.paystackPublicKey || fallbackKey,
    subaccount: menu?.branch.paystackSubaccountCode || undefined,
    currency: menu?.branch.currency || 'GHS',
  });

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/menu/${slug}`)
      .then((r) => r.json())
      .then((payload) => {
        const data = unwrapData<MenuData>(payload);
        setMenu(data);
        if (data?.categories?.[0]?.id) setActiveCategory(data.categories[0].id);
      })
      .catch(() => toast.error('Menu unavailable'))
      .finally(() => setLoading(false));
  }, [slug]);

  const addToCart = (item: MenuItem, note?: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing)
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1, note: note ?? c.note } : c,
        );
      return [
        ...prev,
        { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, note },
      ];
    });
    toast.success(`${item.name} added`, { icon: '🛒', duration: 1400 });
  };

  const updateQty = (menuItemId: string, delta: number) =>
    setCart((prev) =>
      prev
        .map((c) => (c.menuItemId === menuItemId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0),
    );

  /**
   * Step 1 — Create the order (always without a reference so it starts as `unpaid`).
   * Step 2 — If payment was online, immediately call verify-payment with the Paystack reference.
   *          This marks it `paid` synchronously.
   */
  const placeOrder = async (paystackReference?: string) => {
    if (!menu || !cart.length || placing) return;
    setPlacing(true);

    try {
      // ── Step 1: create order ──────────────────────────────────────────────
      const createRes = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: menu.branch.id,
          tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
          customerName: customerName || undefined,
          paymentMethod,
          // Pass the reference so it's stored on the order row
          paystackRef: paystackReference ?? undefined,
          items: cart.map((c) => ({
            menuItemId: c.menuItemId,
            quantity: c.quantity,
            note: c.note || undefined,
          })),
        }),
      });

      if (!createRes.ok) {
        const errBody = await createRes.json().catch(() => ({}));
        throw new Error((errBody as { message?: string }).message ?? 'Order failed');
      }

      const created = unwrapData<{
        id: string;
        orderNumber?: string;
        data?: { id: string; orderNumber?: string };
      }>(await createRes.json());
      const orderId = (created as { id: string }).id;
      const orderNumber =
        (created as { orderNumber?: string }).orderNumber ?? orderId.slice(-6).toUpperCase();

      // ── Step 2: verify payment if online ─────────────────────────────────
      if (paymentMethod === 'online' && paystackReference) {
        try {
          const verifyRes = await fetch(`${API_URL}/orders/${orderId}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: paystackReference }),
          });

          if (!verifyRes.ok) {
            // Payment verify failed — order is created but stays `unpaid`
            // Staff can manually mark it paid from the dashboard
            console.warn('Payment verification failed — order created as unpaid');
            toast('Order placed. Payment verification pending.', { icon: '⚠️', duration: 4000 });
          } else {
            toast.success('Payment confirmed! Order placed.');
          }
        } catch {
          toast('Order placed. Payment verification pending.', { icon: '⚠️', duration: 4000 });
        }
      } else {
        toast.success('Order placed!');
      }

      setCart([]);
      // Rotate the reference for the next payment
      paystackRefRef.current = makeRef();
      setOrderConfirmation({ id: orderId, orderNumber });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed. Please try again.';
      toast.error(message);
    } finally {
      setPlacing(false);
    }
  };

  const handleCheckout = () => {
    if (orderType === 'dine_in' && !tableNumber.trim()) {
      toast.error('Please enter a table number for Dine-in orders.');
      return;
    }
    if (orderType === 'takeaway' && !customerName.trim()) {
      toast.error('Please enter your name for Takeaway orders.');
      return;
    }

    if (paymentMethod === 'online') {
      if (!menu?.branch.paystackPublicKey && !fallbackKey) {
        toast.error('Online payment is unavailable for this restaurant.');
        return;
      }
      if (!customerEmail.trim()) {
        toast.error('Your email is required for online payment.');
        return;
      }
      // Generate a fresh reference for this attempt
      paystackRefRef.current = makeRef();

      initializePayment({
        onSuccess: (response: { reference?: string }) => {
          void placeOrder(response.reference ?? paystackRefRef.current);
        },
        onClose: () => {
          // Rotate ref so a re-open gets a fresh one
          paystackRefRef.current = makeRef();
          toast.error('Payment cancelled.');
        },
      });
      return;
    }

    void placeOrder();
  };

  const handleShare = () => {
    if (navigator.share) {
      void navigator.share({ title: menu?.branch.name, url: window.location.href });
    } else {
      void navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied');
    }
  };

  const categories = useMemo(() => {
    if (!menu) return [];
    return menu.categories.flatMap((cat) => [
      cat,
      ...((cat as MenuCategory & { subCategories?: MenuCategory[] }).subCategories ?? []),
    ]);
  }, [menu]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim())
      return categories.filter((cat) => !activeCategory || cat.id === activeCategory);
    const q = searchQuery.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, activeCategory, searchQuery]);

  const recommendations = useMemo(() => {
    if (!menu) return [];
    if (menu.recommendations?.length) return menu.recommendations.slice(0, 8);
    return categories.flatMap((c) => c.items).slice(0, 8);
  }, [menu, categories]);

  if (loading) return <MenuSkeleton />;

  if (!menu) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-center"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-danger/10 text-danger">
            <Info size={40} />
          </div>
          <h2 className="text-2xl font-bold text-fg">Menu not found</h2>
          <p className="text-sm text-muted">We couldn't find the menu you're looking for.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </motion.div>
      </div>
    );
  }

  const cartProps = {
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
    onSubmit: handleCheckout,
  };

  return (
    <div className="min-h-screen bg-bg pb-28">
      <MenuHero
        branch={menu.branch}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenInfo={() => setShowInfo(true)}
        onShare={handleShare}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-6 sm:px-6 lg:grid lg:grid-cols-[1fr_360px] lg:items-start">
        <section className="space-y-6">
          <CategoryBar
            categories={menu.categories}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCategorySelect={setActiveCategory}
          />

          {recommendations.length > 0 && !searchQuery && (
            <section className="rounded-[2rem] border border-border/40 bg-surface p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-black text-fg">Recommended</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Top picks
                </span>
              </div>
              <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
                {recommendations.map((item) => (
                  <button
                    key={`rec-${item.id}`}
                    onClick={() => setSelectedItem(item)}
                    className="min-w-[200px] rounded-2xl border border-border bg-bg p-3 text-left transition hover:bg-subtle"
                  >
                    <p className="truncate text-sm font-bold text-fg">{item.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted">
                      {item.description || 'House recommendation'}
                    </p>
                    <p className="mt-2 text-sm font-black text-brand">
                      {formatCurrency(item.price, menu.branch.currency || 'GHS')}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          <AnimatePresence>
            {filteredCategories.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-subtle">
                  <Search size={24} className="text-muted" />
                </div>
                <p className="font-bold text-fg">No items found</p>
                <p className="text-sm text-muted">Try a different search</p>
              </motion.div>
            ) : (
              filteredCategories.map((cat) => (
                <MenuSection
                  key={cat.id}
                  category={cat}
                  reduceMotion={!!reduceMotion}
                  onSelectItem={setSelectedItem}
                  onAddToCart={addToCart}
                />
              ))
            )}
          </AnimatePresence>
        </section>

        {/* Desktop sidebar cart */}
        <aside className="hidden rounded-[2rem] border border-border/40 bg-surface p-6 lg:sticky lg:top-24 lg:block">
          <h3 className="mb-4 text-lg font-black text-fg">Checkout</h3>
          <CartContent {...cartProps} />
        </aside>
      </div>

      {/* Mobile floating cart button */}
      <AnimatePresence>
        {cartCount > 0 && !cartOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 200 }}
            className="fixed bottom-6 left-4 right-4 z-50 lg:hidden"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="flex h-14 w-full items-center justify-between rounded-2xl bg-brand px-5 text-white shadow-2xl shadow-brand/40"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <ShoppingCart size={17} />
                </span>
                <span className="font-bold">
                  {cartCount} item{cartCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{formatCurrency(cartTotal, menu.branch.currency)}</span>
                <ChevronRight size={17} />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile cart drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
            />
            <motion.section
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-[61] flex max-h-[90vh] flex-col rounded-t-[2.5rem] bg-surface lg:hidden"
            >
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-border" />
              <div className="flex items-center justify-between p-6">
                <h2 className="text-xl font-black text-fg">Your Order</h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-subtle text-muted transition-colors hover:text-fg"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 pb-10">
                <CartContent {...cartProps} />
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      <ItemDetailsModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={addToCart}
      />
      <RestaurantInfoModal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        branch={menu.branch}
        currentSlug={slug}
      />

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-brand shadow-lg ring-1 ring-border transition-all hover:bg-brand hover:text-white lg:bottom-10"
          >
            <ChevronUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
