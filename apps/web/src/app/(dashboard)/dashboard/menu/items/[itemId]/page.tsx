'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Copy, Loader2, Plus, Trash2 } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MenuFormChrome } from '@/features/menu/components/MenuFormChrome';
import { CollapsibleSection } from '@/features/menu/components/CollapsibleSection';
import {
  createItem,
  deleteItem,
  fetchCategoriesTree,
  fetchItems,
  updateItem,
} from '@/features/menu/menuApi';
import type { MenuCategoryNested } from '@/features/menu/types';
import type { MenuItemRow } from '@/features/menu/types';
import {
  ITEM_LABEL_OPTIONS,
  buildMenuItemApiBody,
  emptyMenuItemForm,
  itemRowToForm,
  type MenuItemFormState,
} from '@/features/menu/menuItemForm';
import toast from 'react-hot-toast';

export default function EditMenuItemPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.itemId as string;
  const { current: restaurant } = useAppSelector((s) => s.restaurant);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [tree, setTree] = useState<MenuCategoryNested[]>([]);
  const [form, setForm] = useState<MenuItemFormState>(emptyMenuItemForm());
  const [deleteAck, setDeleteAck] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!restaurant || !itemId) return;
    setLoading(true);
    try {
      const [items, cats] = await Promise.all([
        fetchItems(restaurant.id),
        fetchCategoriesTree(restaurant.id),
      ]);
      const row = items.find((i) => i.id === itemId);
      if (!row) {
        toast.error('Item not found');
        router.replace('/dashboard/menu');
        return;
      }
      setTree(cats);
      setForm(itemRowToForm(row as MenuItemRow));
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg ?? 'Failed to load item');
      router.replace('/dashboard/menu');
    } finally {
      setLoading(false);
    }
  }, [restaurant, itemId, router]);

  useEffect(() => {
    void load();
  }, [load]);

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
      await updateItem(restaurant.id, itemId, body);
      toast.success('Item updated');
      router.push('/dashboard/menu');
      router.refresh();
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!restaurant) return;
    const body = buildMenuItemApiBody({
      ...form,
      name: `Copy of ${form.name}`.slice(0, 120),
    });
    const parsed = createMenuItemSchema.safeParse(body);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Invalid');
      return;
    }
    setDuplicating(true);
    try {
      const created = (await createItem(restaurant.id, body)) as { id: string };
      toast.success('Duplicate created');
      router.push(`/dashboard/menu/items/${created.id}`);
      router.refresh();
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg ?? 'Failed to duplicate');
    } finally {
      setDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (!restaurant || !deleteAck) return;
    setDeleting(true);
    try {
      await deleteItem(restaurant.id, itemId);
      toast.success('Item deleted');
      router.push('/dashboard/menu');
      router.refresh();
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg ?? 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="py-20 text-center font-medium text-muted-foreground">
        Select a restaurant first.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={28} strokeWidth={1.75} />
      </div>
    );
  }

  return (
    <MenuFormChrome
      backHref="/dashboard/menu"
      title="Edit menu item"
      subtitle={form.name || 'Menu item'}
      footer={{
        cancelHref: '/dashboard/menu',
        onSave: handleSave,
        saving,
        saveDisabled: !form.name.trim() || !form.categoryId,
      }}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          startContent={!duplicating && <Copy size={16} />}
          loading={duplicating}
          onClick={handleDuplicate}
        >
          Duplicate item
        </Button>
      </div>

      <div className="space-y-4">
        <CollapsibleSection title="Basics" defaultOpen>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
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
            />
            <Input
              label="Description"
              value={form.description}
              onValueChange={(v) => setForm((f) => ({ ...f, description: v }))}
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
            />
            <Input
              label="Discount / promo price (optional)"
              type="number"
              value={form.discountedPrice}
              onValueChange={(v) => setForm((f) => ({ ...f, discountedPrice: v }))}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
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
              {form.priceVariants.length > 0 ? (
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
                        className="shrink-0 text-destructive"
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
              ) : (
                <p className="text-xs text-muted-foreground">No variants.</p>
              )}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Dietary & labels">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
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
              label="Tags"
              value={form.tags}
              onValueChange={(v) => setForm((f) => ({ ...f, tags: v }))}
            />
            <Input
              label="Allergens"
              value={form.allergens}
              onValueChange={(v) => setForm((f) => ({ ...f, allergens: v }))}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Calories"
                type="number"
                value={form.calories}
                onValueChange={(v) => setForm((f) => ({ ...f, calories: v }))}
              />
              <Input
                label="Prep time (min)"
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
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
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
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
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
              <div className="space-y-4">
                {form.galleryUrls.map((url, i) => (
                  <ImageUpload
                    key={i}
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
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Availability & merchandising">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Available from"
                value={form.availableFrom}
                onValueChange={(v) => setForm((f) => ({ ...f, availableFrom: v }))}
              />
              <Input
                label="Available to"
                value={form.availableTo}
                onValueChange={(v) => setForm((f) => ({ ...f, availableTo: v }))}
              />
            </div>
            <Input
              label="Sort order"
              type="number"
              value={form.sortOrder}
              onValueChange={(v) => setForm((f) => ({ ...f, sortOrder: v }))}
            />
            <div className="flex flex-col gap-3 rounded-xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-foreground">Available</p>
              <Switch
                checked={form.isAvailable}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isAvailable: v }))}
              />
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-foreground">Featured</p>
              <Switch
                checked={form.isFeatured}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))}
              />
            </div>
          </div>
        </CollapsibleSection>

        <Card className="border-destructive/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Permanently remove this dish from your menu.
            </p>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={deleteAck}
                onChange={(e) => setDeleteAck(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border"
              />
              <span>I understand this item will be permanently deleted.</span>
            </label>
            <Button
              variant="outline"
              className="border-destructive text-destructive"
              disabled={!deleteAck}
              loading={deleting}
              onClick={handleDelete}
            >
              Delete item
            </Button>
          </CardContent>
        </Card>
      </div>
    </MenuFormChrome>
  );
}
