'use client';

import Image from 'next/image';
import { MapPin, Share2, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface MenuHeroProps {
  branch: {
    name: string;
    logoUrl: string | null;
    address: string | null;
  };
  cartCount: number;
  onOpenCart: () => void;
  onOpenInfo: () => void;
  onShare: () => void;
}

export function MenuHero({ branch, cartCount, onOpenCart, onOpenInfo, onShare }: MenuHeroProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-border shadow-sm transition-transform hover:scale-[1.03]">
            {branch.logoUrl ? (
              <Image src={branch.logoUrl} alt={branch.name} fill className="object-cover" />
            ) : (
              <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center text-lg font-black">
                {branch.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-black text-foreground sm:text-xl">
              {branch.name}
            </h1>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Open Now
              </span>
              <button
                onClick={onOpenInfo}
                className="hover:text-primary flex items-center gap-1 transition"
              >
                <MapPin size={12} className="text-primary" />
                <span className="truncate">{branch.address || 'Ghana'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={onShare}>
            <Share2 size={18} />
          </Button>
          <div>
            <Button
              className="relative h-10 rounded-full px-4 font-bold shadow-lg"
              onClick={onOpenCart}
            >
              <ShoppingCart size={16} className="mr-2" />
              <span>{cartCount}</span>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="bg-destructive absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
