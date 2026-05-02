'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAppSelector } from '@/stores/store';
import { createCategorySchema } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Switch } from '@/components/ui/Switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MenuFormChrome } from '@/features/menu/components/MenuFormChrome';
import {
  deleteCategory,
  fetchCategoriesTree,
  fetchCategory,
  updateCategory,
} from '@/features/menu/menuApi';
import type { MenuCategoryNested } from '@/features/menu/types';
import toast from 'react-hot-toast';

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;
  const { current: restaurant } = useAppSelector((s) => s.restaurant);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<
    (MenuCategoryNested & { parentId?: string | null }) | null
  >(null);
  const [topLevelOptions, setTopLevelOptions] = useState<{ id: string; name: string }[]>([]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    coverUrl: '',
    parentId: '',
    sortOrder: '0',
    isActive: true,
  });

  const [deleteAck, setDeleteAck] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!restaurant || !categoryId) return;
    setLoading(true);
    try {
      const [cat, tree] = await Promise.all([
        fetchCategory(restaurant.id, categoryId),
        fetchCategoriesTree(restaurant.id),
      ]);
      setCategory(cat as MenuCategoryNested & { parentId?: string | null });
      setForm({
        name: cat.name,
        description: (cat.description as string) ?? '',
        coverUrl: (cat.coverUrl as string) ?? '',
        parentId: (cat.parentId as string) ?? '',
        sortOrder: String(cat.sortOrder ?? 0),
        isActive: cat.isActive !== false,
      });
      setTopLevelOptions(
        tree.map((c) => ({ id: c.id, name: c.name })).filter((c) => c.id !== categoryId),
      );
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg ?? 'Failed to load category');
      router.push('/dashboard/menu');
    } finally {
      setLoading(false);
    }
  }, [restaurant, categoryId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!restaurant) return;
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      coverUrl: form.coverUrl.trim() || undefined,
      parentId: form.parentId || undefined,
      sortOrder: form.sortOrder ? Number(form.sortOrder) : undefined,
      isActive: form.isActive,
    };
    const parsed = createCategorySchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Invalid');
      return;
    }
    setSaving(true);
    try {
      await updateCategory(restaurant.id, categoryId, payload);
      toast.success('Category updated');
      router.push('/dashboard/menu');
      router.refresh();
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg ?? 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!restaurant || !deleteAck) return;
    setDeleting(true);
    try {
      await deleteCategory(restaurant.id, categoryId);
      toast.success('Category deleted');
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
      <div className="text-muted-foreground py-20 text-center font-medium">
        Select a restaurant first.
      </div>
    );
  }

  if (loading || !category) {
    return (
      <div className="text-muted-foreground py-20 text-center text-sm font-medium">
        Loading category…
      </div>
    );
  }

  const subs = category.subCategories ?? [];

  return (
    <MenuFormChrome
      backHref="/dashboard/menu"
      title="Edit category"
      subtitle={category.name}
      footer={{
        cancelHref: '/dashboard/menu',
        onSave: handleSave,
        saving,
        saveDisabled: !form.name.trim(),
      }}
    >
      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-muted-foreground text-xs font-black uppercase tracking-widest">
            Cover image
          </label>
          <ImageUpload
            value={form.coverUrl}
            onChange={(url) => setForm((f) => ({ ...f, coverUrl: url }))}
            onRemove={() => setForm((f) => ({ ...f, coverUrl: '' }))}
            folder="tableo/menu/categories"
          />
        </div>

        <Input
          label="Name"
          value={form.name}
          onValueChange={(v) => setForm((f) => ({ ...f, name: v }))}
        />

        <Input
          label="Description (optional)"
          value={form.description}
          onValueChange={(v) => setForm((f) => ({ ...f, description: v }))}
        />

        <div className="space-y-2">
          <label className="text-muted-foreground text-xs font-black uppercase tracking-widest">
            Parent
          </label>
          <Select
            value={form.parentId || 'none'}
            onValueChange={(v) => setForm((f) => ({ ...f, parentId: v === 'none' ? '' : v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Top-level category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Top-level (no parent)</SelectItem>
              {topLevelOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Input
          label="Sort order"
          type="number"
          value={form.sortOrder}
          onValueChange={(v) => setForm((f) => ({ ...f, sortOrder: v }))}
        />

        <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Active</p>
            <p className="text-muted-foreground text-xs">Hide from the public menu when off.</p>
          </div>
          <Switch
            checked={form.isActive}
            onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
          />
        </div>

        {!form.parentId ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Subcategories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subs.length === 0 ? (
                <p className="text-muted-foreground text-sm">No subcategories yet.</p>
              ) : (
                <ul className="space-y-2">
                  {subs.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/dashboard/menu/categories/${s.id}`}
                        className="text-primary text-sm font-semibold underline-offset-4 hover:underline"
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/menu/categories/new?parentId=${categoryId}`}>
                  Add subcategory
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-destructive/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-destructive text-base">Danger zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Deleting removes this category and related data per your backend rules. Items in this
              category may be deleted or blocked—confirm before proceeding.
            </p>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={deleteAck}
                onChange={(e) => setDeleteAck(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border"
              />
              <span>I understand this category will be permanently deleted.</span>
            </label>
            <Button
              variant="outline"
              className="border-destructive text-destructive"
              disabled={!deleteAck || deleting}
              onClick={handleDelete}
            >
              {deleting ? 'Deleting…' : 'Delete category'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MenuFormChrome>
  );
}
