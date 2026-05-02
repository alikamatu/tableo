'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { MenuItemCard, type MenuItem } from './MenuItemCard';

export interface MenuCategory {
  id: string;
  name: string;
  description?: string | null;
  coverUrl?: string | null;
  items: MenuItem[];
  subCategories?: MenuCategory[];
}

interface MenuSectionProps {
  category: MenuCategory;
  reduceMotion: boolean;
  onSelectItem: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuSection({
  category,
  reduceMotion,
  onSelectItem,
  onAddToCart,
}: MenuSectionProps) {
  return (
    <motion.section
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.22, ease: 'easeOut' }}
      className="overflow-hidden rounded-[2rem] bg-surface shadow-sm ring-1 ring-border/40"
    >
      {category.coverUrl && (
        <div className="relative h-40 w-full overflow-hidden">
          <Image src={category.coverUrl} alt={category.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h2 className="text-2xl font-black">{category.name}</h2>
            {category.description && (
              <p className="mt-1 text-xs font-medium opacity-90">{category.description}</p>
            )}
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6">
        {!category.coverUrl && (
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-foreground">{category.name}</h2>
              {category.description && (
                <p className="text-muted-foreground mt-1 text-xs font-medium">
                  {category.description}
                </p>
              )}
            </div>
            <Badge variant="muted" className="rounded-lg px-2.5 py-1">
              {category.items.length} items
            </Badge>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {category.items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onSelect={onSelectItem}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
