'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ChevronRight,
  FolderTree,
  Image as ImageIcon,
  Plus,
  Search,
  UtensilsCrossed,
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
      <div className="text-muted-foreground py-20 text-center font-medium">
        Select a restaurant first.
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl pb-28">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Menu</h1>
        <p className="text-muted-foreground text-sm font-medium sm:text-base">
          Categories, optional subcategories, then dishes — all editable on dedicated pages.
        </p>
      </div>

      {error ? (
        <Card className="border-destructive/40 mb-6">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-destructive text-sm font-medium">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="mb-6">
        <CardContent className="space-y-4 py-4">
          <p className="text-sm font-semibold text-foreground">Get started</p>
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
        <p className="text-muted-foreground py-16 text-center text-sm font-medium">Loading menu…</p>
      ) : topLevelCategories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-6 py-16 text-center">
            <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm">
              <UtensilsCrossed size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-foreground">No categories yet</p>
              <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                Create a top-level section (e.g. Mains, Drinks), then add subcategories if you need
                finer groupings.
              </p>
            </div>
            <Button asChild startContent={<Plus size={18} />}>
              <Link href="/dashboard/menu/categories/new">New category</Link>
            </Button>
          </CardContent>
        </Card>
      ) : visibleTopLevel.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          No matches for your search.
        </p>
      ) : (
        <div className="space-y-8">
          {visibleTopLevel.map((cat) => (
            <section key={cat.id} className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                    {cat.coverUrl ? (
                      <img src={cat.coverUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="text-muted-foreground h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-foreground">{cat.name}</h2>
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
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs font-medium">
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
                        <FolderTree className="text-muted-foreground h-4 w-4 shrink-0" />
                        <h3 className="text-base font-bold text-foreground">{sub.name}</h3>
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
            </section>
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-bg/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-bg/85">
        <div className="mx-auto flex max-w-4xl gap-3">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/dashboard/menu/categories/new">New category</Link>
          </Button>
          <Button className="flex-1" asChild>
            <Link href="/dashboard/menu/items/new">New item</Link>
          </Button>
        </div>
      </div>
    </div>
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
        <CardContent className="text-muted-foreground py-8 text-center text-sm italic">
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
                  <ImageIcon className="text-muted-foreground h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{item.name}</p>
                {item.description ? (
                  <p className="text-muted-foreground line-clamp-1 text-xs font-medium">
                    {item.description}
                  </p>
                ) : null}
                <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs font-semibold">
                  Edit details
                  <ChevronRight className="h-3 w-3" />
                </p>
              </div>
            </Link>
            <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
              <p className="text-sm font-bold text-foreground">
                {item.discountedPrice ? (
                  <span className="flex flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                    <span className="text-muted-foreground text-xs line-through">
                      {formatGHS(toAmount(item.basePrice))}
                    </span>
                    <span>{formatGHS(toAmount(item.discountedPrice))}</span>
                  </span>
                ) : (
                  formatGHS(toAmount(item.basePrice))
                )}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground hidden text-[10px] font-bold uppercase tracking-wider sm:inline">
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
