'use client';

import { useState, useEffect, use, useRef } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Send,
  ChevronRight,
  Info,
  Clock,
  MapPin,
  X
} from 'lucide-react';
import Image from 'next/image';
import { formatGHS } from '@tableo/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/Modal';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as React from 'react';
import toast from 'react-hot-toast';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  sortOrder: number;
}

interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

interface MenuData {
  branch: { id: string; name: string; logoUrl: string | null; address: string | null };
  categories: MenuCategory[];
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export default function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [placing, setPlacing] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/menu/${slug}`)
      .then((r) => r.json())
      .then((data) => setMenu(data.data))
      .catch(() => toast.error('Menu unavailable'))
      .finally(() => setLoading(false));
  }, [slug]);

  useGSAP(() => {
    if (!loading && menu) {
      gsap.from('.menu-reveal', {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.4,
        ease: 'power3.out'
      });
    }
  }, [loading]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
    toast.success(`${item.name} added`, { 
      icon: '🛒', 
      duration: 1200,
      style: { background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 'bold' }
    });
  };

  const updateQty = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menuItemId === menuItemId ? { ...c, quantity: c.quantity + delta } : c,
        )
        .filter((c) => c.quantity > 0),
    );
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const placeOrder = async () => {
    if (!menu || cart.length === 0) return;
    setPlacing(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: menu.branch.id,
          tableNumber: tableNumber || undefined,
          customerName: customerName || undefined,
          paymentMethod: 'counter',
          items: cart.map((c) => ({
            menuItemId: c.menuItemId,
            quantity: c.quantity,
            note: c.note || undefined,
          })),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Order placed! 🎉', { duration: 4000 });
      setCart([]);
      setCartOpen(false);
    } catch {
      toast.error('Submission failed. Try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-pulse shadow-sm">
            <ShoppingCart size={24} />
          </div>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Opening Menu...</p>
        </div>
      </div>
    );
  }

  if (!menu) return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      <div className="text-center space-y-4">
        <Info size={40} className="mx-auto text-destructive/50" />
        <p className="font-bold">Menu not explicitly found.</p>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-32 transition-colors">
      {/* ─── Solid Header ─────────────────────────────────────── */}
      <header className="relative bg-muted/30 border-b border-border shadow-sm px-6 py-12">
        <div className="max-w-2xl mx-auto flex items-center gap-6 menu-reveal">
          <div className="h-20 w-20 rounded-[1.5rem] bg-card border border-border flex items-center justify-center text-foreground font-black text-3xl shadow-sm overflow-hidden">
            {menu.branch.logoUrl ? (
              <Image src={menu.branch.logoUrl} alt="" width={80} height={80} className="rounded-[1.5rem] object-cover" />
            ) : (
              menu.branch.name.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">{menu.branch.name}</h1>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground font-black">
              <div className="flex items-center gap-1.5"><Clock size={12} className="text-primary" /> OPEN</div>
              <div className="flex items-center gap-1.5 truncate max-w-[180px]"><MapPin size={12} className="text-primary" /> {menu.branch.address || 'LOCAL'}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Sticky Nav ────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-3 mb-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">A La Carte</div>
          <Button variant="ghost" className="h-9 px-4 gap-2.5 font-black text-[10px] uppercase group" onClick={() => setCartOpen(true)}>
             <Badge variant="primary" className="h-4.5 min-w-[20px] px-1 group-hover:bg-primary/90">{cartCount}</Badge>
             <span className="text-foreground">Checkout</span>
          </Button>
        </div>
      </div>

      {/* ─── Categories ─────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-6 space-y-12">
        {menu.categories.map((cat) => (
          <section key={cat.id} className="menu-reveal">
            <h2 className="text-lg font-black text-foreground mb-6 flex items-center gap-2">
              <div className="h-4 w-1 bg-primary rounded-full" />
              {cat.name.toUpperCase()}
            </h2>
            <div className="grid gap-3">
              {cat.items.map((item) => (
                <Card key={item.id} className="group border-border hover:border-primary/30 transition-all overflow-hidden active:scale-[0.99] shadow-none hover:shadow-md">
                  <CardContent className="p-0 flex items-center h-24">
                    {item.imageUrl && (
                      <div className="h-full w-24 shrink-0 relative overflow-hidden bg-muted">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex justify-between items-start gap-3">
                        <h3 className="font-bold text-sm text-foreground truncate">{item.name}</h3>
                        <p className="font-black text-primary text-sm shrink-0 tabular-nums">{formatGHS(item.price)}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-snug font-medium italic">
                        {item.description}
                      </p>
                    </div>
                    <div className="pr-4">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
                        onClick={() => addToCart(item)}
                      >
                        <Plus size={20} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* ─── Floating Bar ────────────────────────────────────────── */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-50 px-6 menu-reveal">
          <Button 
            className="w-full max-w-md mx-auto h-14 rounded-2xl shadow-xl shadow-primary/20 text-base font-black tracking-tight"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart size={20} className="mr-3" />
            Process My Order • {formatGHS(cartTotal)}
          </Button>
        </div>
      )}

      {/* ─── Cart Modal ──────────────────────────────────────────── */}
      <Modal open={cartOpen} onOpenChange={setCartOpen}>
        <ModalContent className="rounded-t-[2.5rem] rounded-b-none sm:rounded-[2rem] max-w-2xl bottom-0 translate-y-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 border-border p-0">
          <ModalHeader className="px-8 pt-8 pb-4">
            <ModalTitle className="text-xl font-black">Shopping Cart</ModalTitle>
          </ModalHeader>
          
          <div className="px-8 max-h-[50vh] overflow-y-auto space-y-3 pb-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <ShoppingCart size={32} className="mx-auto text-muted-foreground/20" />
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Cart is empty</p>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.menuItemId} className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">{formatGHS(item.price)} / ITEM</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => updateQty(item.menuItemId, -1)}>
                        <Minus size={14} />
                      </Button>
                      <span className="text-xs font-black text-foreground w-4 text-center tabular-nums">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => updateQty(item.menuItemId, 1)}>
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="space-y-4 pt-6">
                  <Input label="Identity (Name)" placeholder="e.g. Ama" value={customerName} onValueChange={setCustomerName} className="bg-muted/40 border-border" />
                  <Input label="Table Identification" placeholder="e.g. 5" value={tableNumber} onValueChange={setTableNumber} className="bg-muted/40 border-border" />
                </div>
              </>
            )}
          </div>

          <ModalFooter className="flex-col px-8 pb-8 pt-4 gap-4 border-t border-border">
            <div className="flex justify-between w-full mb-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Summary</span>
              <span className="text-xl font-black text-primary tabular-nums">{formatGHS(cartTotal)}</span>
            </div>
            <div className="flex w-full gap-3">
              <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setCartOpen(false)}>Back</Button>
              <Button className="flex-[2] rounded-xl h-11 font-black" loading={placing} disabled={cart.length === 0} onClick={placeOrder}>
                Place Order <Send size={16} className="ml-2" />
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
