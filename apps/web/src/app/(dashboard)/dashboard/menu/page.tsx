'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  FolderTree,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  UtensilsCrossed,
  LayoutList,
} from 'lucide-react';
import { formatGHS } from '@tableo/utils';
import { useAppSelector } from '@/stores/store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { useRestaurantMenu } from '@/features/menu/useRestaurantMenu';
import { updateItem } from '@/features/menu/menuApi';
import type { MenuCategoryRow, MenuItemRow } from '@/features/menu/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

function toAmount(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === 'object' && value !== null) {
    if ('toNumber' in value && typeof value.toNumber === 'function') {
      return value.toNumber() as number;
    }
    if ('toString' in value && typeof value.toString === 'function') {
      const parsed = Number.parseFloat(value.toString());
      return Number.isFinite(parsed) ? parsed : 0;
    }
    if ('d' in value && 's' in value && 'e' in value) {
      const parsed = Number.parseFloat(String(value));
      return Number.isFinite(parsed) ? parsed : 0;
    }
  }
  return 0;
}

function itemMatchesQuery(item: MenuItemRow, q: string) {
  if (!q) return true;
  const s = q.toLowerCase();
  return (
    item.name.toLowerCase().includes(s) || Boolean(item.description?.toLowerCase().includes(s))
  );
}

function categorySectionVisible(
  cat: MenuCategoryRow,
  q: string,
  childrenOf: (id: string) => MenuCategoryRow[],
  itemsByCategoryId: Map<string, MenuItemRow[]>,
) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  if (cat.name.toLowerCase().includes(s)) return true;
  for (const sub of childrenOf(cat.id)) {
    if (sub.name.toLowerCase().includes(s)) return true;
  }
  const ids = [cat.id, ...childrenOf(cat.id).map((c) => c.id)];
  for (const id of ids) {
    const list = itemsByCategoryId.get(id) ?? [];
    if (list.some((i) => itemMatchesQuery(i, q))) return true;
  }
  return false;
}

function subcategoryVisible(
  sub: MenuCategoryRow,
  q: string,
  itemsByCategoryId: Map<string, MenuItemRow[]>,
) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  if (sub.name.toLowerCase().includes(s)) return true;
  return (itemsByCategoryId.get(sub.id) ?? []).some((i) => itemMatchesQuery(i, q));
}

export default function MenuHubPage() {
  const { current: restaurant } = useAppSelector((s) => s.restaurant);
  const {
    topLevelCategories,
    childrenOf,
    items,
    itemsByCategoryId,
    loading,
    error,
    refetch,
    patchItemLocal,
  } = useRestaurantMenu(restaurant?.id);

  const [search, setSearch] = useState('');

  const visibleTopLevel = useMemo(
    () =>
      topLevelCategories.filter((c) =>
        categorySectionVisible(c, search, childrenOf, itemsByCategoryId),
      ),
    [topLevelCategories, search, childrenOf, itemsByCategoryId],
  );

  const toggleAvailability = async (item: MenuItemRow) => {
    if (!restaurant) return;
    const next = !item.isAvailable;
    patchItemLocal(item.id, { isAvailable: next });
    try {
      await updateItem(restaurant.id, item.id, { isAvailable: next });
    } catch (e: unknown) {
      patchItemLocal(item.id, { isAvailable: item.isAvailable });
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg ?? 'Failed to update availability');
    }
  };

  if (!restaurant) {
    return (
      <div className="py-20 text-center font-medium text-muted-foreground">
        Select a restaurant first.
      </div>
    );
  }

  return (
    <motion.div
      className="relative mx-auto w-full max-w-4xl pb-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LayoutList size={18} strokeWidth={1.75} />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-medium tracking-tight text-foreground sm:text-xl">Menu</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Categories, subcategories, and dishes — each opens on its own page to edit.
          </p>
        </div>
      </div>

      {error ? (
        <Card className="mb-6 border-destructive/40">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="mb-6 border-border/80 bg-card/50">
        <CardContent className="space-y-4 py-4">
          <p className="text-sm font-medium text-foreground">Get started</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  topLevelCategories.length ? 'bg-green-500' : 'bg-muted-foreground/40',
                )}
              />
              <span
                className={topLevelCategories.length ? 'text-foreground' : 'text-muted-foreground'}
              >
                Add at least one category
              </span>
              {!topLevelCategories.length ? (
                <Button size="sm" variant="outline" className="ml-auto shrink-0" asChild>
                  <Link href="/dashboard/menu/categories/new">Add category</Link>
                </Button>
              ) : null}
            </li>
            <li className="flex items-center gap-2">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  items.length ? 'bg-green-500' : 'bg-muted-foreground/40',
                )}
              />
              <span className={items.length ? 'text-foreground' : 'text-muted-foreground'}>
                Add menu items to your categories
              </span>
              {!items.length && topLevelCategories.length ? (
                <Button size="sm" variant="outline" className="ml-auto shrink-0" asChild>
                  <Link href="/dashboard/menu/items/new">Add item</Link>
                </Button>
              ) : null}
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="mb-4">
        <Input
          label="Search menu"
          value={search}
          onValueChange={setSearch}
          placeholder="Filter by dish or category name…"
          startContent={<Search size={18} className="text-muted-foreground" />}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={28} strokeWidth={1.75} />
        </div>
      ) : topLevelCategories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card className="border-dashed border-border/80 bg-muted/20">
            <CardContent className="flex flex-col items-center gap-5 py-14 text-center sm:py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UtensilsCrossed size={26} strokeWidth={1.75} />
              </div>
              <div className="space-y-1.5">
                <p className="text-base font-medium text-foreground">No categories yet</p>
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Add a section (e.g. Mains, Drinks), then optional subcategories and items.
                </p>
              </div>
              <Button asChild startContent={<Plus size={17} strokeWidth={1.75} />}>
                <Link href="/dashboard/menu/categories/new">New category</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : visibleTopLevel.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No matches for your search.
        </p>
      ) : (
        <div className="space-y-8">
          {visibleTopLevel.map((cat, si) => (
            <motion.section
              key={cat.id}
              className="space-y-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                    {cat.coverUrl ? (
                      <img src={cat.coverUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-medium text-foreground sm:text-lg">
                        {cat.name}
                      </h2>
                      <Badge variant="muted" className="h-5">
                        {
                          (itemsByCategoryId.get(cat.id) ?? []).filter((i) =>
                            itemMatchesQuery(i, search),
                          ).length
                        }{' '}
                        items
                      </Badge>
                    </div>
                    {cat.description ? (
                      <p className="mt-1 line-clamp-2 text-xs font-medium text-muted-foreground">
                        {cat.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/menu/categories/${cat.id}`}>Edit category</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/menu/categories/new?parentId=${cat.id}`}>
                      Add subcategory
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/menu/items/new?categoryId=${cat.id}`}>Add item</Link>
                  </Button>
                </div>
              </div>

              <ItemListBlock
                categoryId={cat.id}
                search={search}
                itemsByCategoryId={itemsByCategoryId}
                onToggle={toggleAvailability}
              />

              {childrenOf(cat.id)
                .filter((sub) => subcategoryVisible(sub, search, itemsByCategoryId))
                .map((sub) => (
                  <div
                    key={sub.id}
                    className="ml-0 border-l-2 border-dashed border-border pl-4 sm:ml-2 sm:pl-5"
                  >
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <FolderTree className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-foreground sm:text-base">
                          {sub.name}
                        </h3>
                        <Badge variant="outline" className="h-5 text-[10px]">
                          Subcategory
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" size="sm" className="h-8" asChild>
                          <Link href={`/dashboard/menu/categories/${sub.id}`}>Edit</Link>
                        </Button>
                        <Button size="sm" className="h-8" asChild>
                          <Link href={`/dashboard/menu/items/new?categoryId=${sub.id}`}>
                            Add item
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <ItemListBlock
                      categoryId={sub.id}
                      search={search}
                      itemsByCategoryId={itemsByCategoryId}
                      onToggle={toggleAvailability}
                    />
                  </div>
                ))}
            </motion.section>
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-4xl gap-3">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/dashboard/menu/categories/new">New category</Link>
          </Button>
          <Button className="flex-1" asChild>
            <Link href="/dashboard/menu/items/new">New item</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ItemListBlock({
  categoryId,
  search,
  itemsByCategoryId,
  onToggle,
}: {
  categoryId: string;
  search: string;
  itemsByCategoryId: Map<string, MenuItemRow[]>;
  onToggle: (item: MenuItemRow) => void;
}) {
  const list = (itemsByCategoryId.get(categoryId) ?? []).filter((i) => itemMatchesQuery(i, search));
  if (list.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm italic text-muted-foreground">
          No items{search.trim() ? ' match this filter' : ' yet'}.
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden">
      <CardContent className="divide-y divide-border p-0">
        {list.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <Link
              href={`/dashboard/menu/items/${item.id}`}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                {item.description ? (
                  <p className="line-clamp-1 text-xs font-medium text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  Edit details
                  <ChevronRight className="h-3 w-3" />
                </p>
              </div>
            </Link>
            <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
              <p className="text-sm font-medium tabular-nums text-foreground">
                {item.discountedPrice ? (
                  <span className="flex flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                    <span className="text-xs text-muted-foreground line-through">
                      {formatGHS(toAmount(item.basePrice))}
                    </span>
                    <span>{formatGHS(toAmount(item.discountedPrice))}</span>
                  </span>
                ) : (
                  formatGHS(toAmount(item.basePrice))
                )}
              </p>
              <div className="flex items-center gap-2">
                <span className="hidden text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:inline">
                  {item.isAvailable ? 'On' : 'Off'}
                </span>
                <Switch
                  checked={item.isAvailable}
                  onCheckedChange={() => onToggle(item)}
                  className="scale-90"
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
