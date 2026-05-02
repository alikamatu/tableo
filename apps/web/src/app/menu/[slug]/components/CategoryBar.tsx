'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
}

interface CategoryBarProps {
  categories: Category[];
  activeCategory: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategorySelect: (id: string) => void;
}

export function CategoryBar({
  categories,
  activeCategory,
  searchQuery,
  onSearchChange,
  onCategorySelect,
}: CategoryBarProps) {
  return (
    <div className="space-y-4">
      <div className="group relative">
        <Search
          className="text-muted-foreground group-focus-within:text-primary absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Search for dishes, drinks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="focus:ring-primary h-12 w-full rounded-2xl border-none bg-surface px-12 text-sm font-medium shadow-sm outline-none ring-1 ring-border/50 transition-all focus:ring-2"
        />
      </div>

      {!searchQuery && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className={cn(
                'whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold shadow-sm transition-all',
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface text-foreground hover:bg-muted',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
