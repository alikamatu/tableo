'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { useAppSelector } from '@/stores/store';
import { createMenuItemSchema } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Switch } from '@/components/ui/Switch';
import { MenuFormChrome } from '@/features/menu/components/MenuFormChrome';
import { CollapsibleSection } from '@/features/menu/components/CollapsibleSection';
import { createItem, fetchCategoriesTree } from '@/features/menu/menuApi';
import type { MenuCategoryNested } from '@/features/menu/types';
import {
  ITEM_LABEL_OPTIONS,
  buildMenuItemApiBody,
  emptyMenuItemForm,
  type MenuItemFormState,
} from '@/features/menu/menuItemForm';
import toast from 'react-hot-toast';

function NewMenuItemPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get('categoryId') ?? '';
  const { current: restaurant } = useAppSelector((s) => s.restaurant);

  const [tree, setTree] = useState<MenuCategoryNested[]>([]);
  const [form, setForm] = useState<MenuItemFormState>(() => emptyMenuItemForm(categoryIdParam));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (categoryIdParam) {
      setForm((f) => ({ ...f, categoryId: categoryIdParam }));
    }
  }, [categoryIdParam]);

  const loadTree = useCallback(async () => {
    if (!restaurant) return;
    try {
      const t = await fetchCategoriesTree(restaurant.id);
      setTree(t);
    } catch {
      setTree([]);
    }
  }, [restaurant]);

  useEffect(() => {
    void loadTree();
  }, [loadTree]);

  const handleSave = async () => {
    if (!restaurant) return;
    const body = buildMenuItemApiBody(form);
    const parsed = createMenuItemSchema.safeParse(body);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Invalid');
      return;
    }
    setSaving(true);
    try {
      await createItem(restaurant.id, body);
      toast.success('Item created');
      router.push('/dashboard/menu');
      router.refresh();
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg ?? 'Failed to create item');
    } finally {
      setSaving(false);
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
    <MenuFormChrome
      backHref="/dashboard/menu"
      title="New menu item"
      subtitle="Full details for any restaurant type"
      footer={{
        cancelHref: '/dashboard/menu',
        onSave: handleSave,
        saving,
        saveDisabled: !form.name.trim() || !form.categoryId,
      }}
    >
      <div className="space-y-4">
        <CollapsibleSection title="Basics" defaultOpen>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-muted-foreground text-xs font-black uppercase tracking-widest">
                Category
              </label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {tree.map((parent) => (
                    <SelectGroup key={parent.id}>
                      <SelectItem value={parent.id}>{parent.name}</SelectItem>
                      {(parent.subCategories ?? []).map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {parent.name} › {sub.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              label="Name"
              value={form.name}
              onValueChange={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="House jollof"
            />

            <Input
              label="Description"
              value={form.description}
              onValueChange={(v) => setForm((f) => ({ ...f, description: v }))}
              placeholder="Ingredients, story, pairings…"
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Pricing">
          <div className="space-y-4">
            <Input
              label="Base price (₵)"
              type="number"
              value={form.basePrice}
              onValueChange={(v) => setForm((f) => ({ ...f, basePrice: v }))}
              placeholder="0.00"
            />
            <Input
              label="Discount / promo price (optional)"
              type="number"
              value={form.discountedPrice}
              onValueChange={(v) => setForm((f) => ({ ...f, discountedPrice: v }))}
              placeholder="Strike-through price"
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-muted-foreground text-xs font-black uppercase tracking-widest">
                  Size / price variants
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  startContent={<Plus size={14} />}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      priceVariants: [...f.priceVariants, { label: '', price: '' }],
                    }))
                  }
                >
                  Add variant
                </Button>
              </div>
              {form.priceVariants.length === 0 ? (
                <p className="text-muted-foreground text-xs">Optional. e.g. Small / Large.</p>
              ) : (
                <div className="space-y-3">
                  {form.priceVariants.map((row, i) => (
                    <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <div className="min-w-0 flex-1">
                        <Input
                          label="Label"
                          value={row.label}
                          onValueChange={(v) =>
                            setForm((f) => {
                              const next = [...f.priceVariants];
                              next[i] = { ...next[i]!, label: v };
                              return { ...f, priceVariants: next };
                            })
                          }
                          placeholder="Large"
                        />
                      </div>
                      <div className="w-full sm:w-32">
                        <Input
                          label="Price"
                          type="number"
                          value={row.price}
                          onValueChange={(v) =>
                            setForm((f) => {
                              const next = [...f.priceVariants];
                              next[i] = { ...next[i]!, price: v };
                              return { ...f, priceVariants: next };
                            })
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive shrink-0"
                        aria-label="Remove variant"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            priceVariants: f.priceVariants.filter((_, j) => j !== i),
                          }))
                        }
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Dietary & labels">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-muted-foreground text-xs font-black uppercase tracking-widest">
                Badge
              </label>
              <Select
                value={form.label}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, label: v as MenuItemFormState['label'] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_LABEL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              label="Tags (comma separated)"
              value={form.tags}
              onValueChange={(v) => setForm((f) => ({ ...f, tags: v }))}
              placeholder="local, seasonal"
            />
            <Input
              label="Allergens (comma separated)"
              value={form.allergens}
              onValueChange={(v) => setForm((f) => ({ ...f, allergens: v }))}
              placeholder="nuts, dairy"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Calories (optional)"
                type="number"
                value={form.calories}
                onValueChange={(v) => setForm((f) => ({ ...f, calories: v }))}
              />
              <Input
                label="Prep time (minutes)"
                type="number"
                value={form.prepTime}
                onValueChange={(v) => setForm((f) => ({ ...f, prepTime: v }))}
              />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Media">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-muted-foreground text-xs font-black uppercase tracking-widest">
                Hero image
              </label>
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                onRemove={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                folder="tableo/menu/items"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-muted-foreground text-xs font-black uppercase tracking-widest">
                  Gallery
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm((f) => ({ ...f, galleryUrls: [...f.galleryUrls, ''] }))}
                >
                  Add image
                </Button>
              </div>
              {form.galleryUrls.length === 0 ? (
                <p className="text-muted-foreground text-xs">Optional extra photos.</p>
              ) : (
                <div className="space-y-4">
                  {form.galleryUrls.map((url, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="min-w-0 flex-1">
                        <ImageUpload
                          value={url}
                          onChange={(u) =>
                            setForm((f) => {
                              const g = [...f.galleryUrls];
                              g[i] = u;
                              return { ...f, galleryUrls: g };
                            })
                          }
                          onRemove={() =>
                            setForm((f) => ({
                              ...f,
                              galleryUrls: f.galleryUrls.filter((_, j) => j !== i),
                            }))
                          }
                          folder="tableo/menu/items"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Availability & merchandising">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Available from (HH:MM)"
                value={form.availableFrom}
                onValueChange={(v) => setForm((f) => ({ ...f, availableFrom: v }))}
                placeholder="08:00"
              />
              <Input
                label="Available to (HH:MM)"
                value={form.availableTo}
                onValueChange={(v) => setForm((f) => ({ ...f, availableTo: v }))}
                placeholder="22:00"
              />
            </div>
            <Input
              label="Sort order (optional)"
              type="number"
              value={form.sortOrder}
              onValueChange={(v) => setForm((f) => ({ ...f, sortOrder: v }))}
              hint="Lower appears first within the category."
            />
            <div className="flex flex-col gap-3 rounded-xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Available</p>
                <p className="text-muted-foreground text-xs">
                  Turn off for sold-out without deleting.
                </p>
              </div>
              <Switch
                checked={form.isAvailable}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isAvailable: v }))}
              />
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Featured</p>
                <p className="text-muted-foreground text-xs">Highlight on marketing surfaces.</p>
              </div>
              <Switch
                checked={form.isFeatured}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))}
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </MenuFormChrome>
  );
}

export default function NewMenuItemPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground py-20 text-center text-sm font-medium">Loading…</div>
      }
    >
      <NewMenuItemPageInner />
    </Suspense>
  );
}
