'use client';

import Image from 'next/image';
import { Info, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatGHS } from '@tableo/utils';

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  label?: string;
}

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onSelect, onAddToCart }: MenuItemCardProps) {
  return (
    <div
      className="group relative flex cursor-pointer items-center gap-4 rounded-2xl border border-border/50 bg-bg p-3 transition-colors hover:bg-surface"
      onClick={() => onSelect(item)}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted shadow-inner">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center">
            <Info size={20} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="group-hover:text-primary truncate text-sm font-black text-foreground transition-colors">
            {item.name}
          </p>
          {item.label && item.label !== 'none' && (
            <Badge className="h-4 text-[9px] uppercase tracking-tighter">
              {item.label.replace('_', ' ')}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
          {item.description ?? 'Chef recommended'}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-primary text-sm font-black">{formatGHS(item.price)}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(item);
            }}
            className="hover:bg-primary hover:text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full bg-surface shadow-sm ring-1 ring-border/50 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
