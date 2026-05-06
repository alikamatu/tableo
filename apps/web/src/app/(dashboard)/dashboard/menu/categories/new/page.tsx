'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAppSelector } from '@/stores/store';
import { createCategorySchema } from '@/lib/validations';
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
import { MenuFormChrome } from '@/features/menu/components/MenuFormChrome';
import { createCategory, fetchCategoriesTree, fetchCategory } from '@/features/menu/menuApi';
import toast from 'react-hot-toast';

function NewCategoryPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentIdParam = searchParams.get('parentId') ?? '';
  const { current: restaurant } = useAppSelector((s) => s.restaurant);

  const [parentName, setParentName] = useState<string | null>(null);
  const [topLevelIds, setTopLevelIds] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    coverUrl: '',
    parentId: parentIdParam,
    sortOrder: '0',
    isActive: true,
  });

  useEffect(() => {
    setForm((f) => ({ ...f, parentId: parentIdParam }));
  }, [parentIdParam]);

  const loadParents = useCallback(async () => {
    if (!restaurant) return;
    try {
      const tree = await fetchCategoriesTree(restaurant.id);
      setTopLevelIds(tree.map((c) => ({ id: c.id, name: c.name })));
      if (parentIdParam) {
        const p = await fetchCategory(restaurant.id, parentIdParam);
        setParentName(p.name);
      } else {
        setParentName(null);
      }
    } catch {
      setTopLevelIds([]);
    }
  }, [restaurant, parentIdParam]);

  useEffect(() => {
    void loadParents();
  }, [loadParents]);

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
      await createCategory(restaurant.id, payload);
      toast.success('Category created');
      router.push('/dashboard/menu');
      router.refresh();
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg ?? 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="py-20 text-center font-medium text-muted-foreground">
        Select a restaurant first.
      </div>
    );
  }

  const isSub = Boolean(form.parentId);
  const title = isSub ? 'New subcategory' : 'New category';
  const subtitle = isSub
    ? parentName
      ? `Under “${parentName}”`
      : 'Nested under a parent category'
    : 'Top-level section on your menu';

  return (
    <MenuFormChrome
      backHref="/dashboard/menu"
      title={title}
      subtitle={subtitle}
      footer={{
        cancelHref: '/dashboard/menu',
        onSave: handleSave,
        saving,
        saveDisabled: !form.name.trim(),
      }}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
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
          placeholder="e.g. Main courses"
        />

        <Input
          label="Description (optional)"
          value={form.description}
          onValueChange={(v) => setForm((f) => ({ ...f, description: v }))}
          placeholder="Shown on your public menu"
        />

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
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
              {topLevelIds.map((c) => (
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
          hint="Lower numbers appear first."
        />

        <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Active</p>
            <p className="text-xs text-muted-foreground">Hide from the public menu when off.</p>
          </div>
          <Switch
            checked={form.isActive}
            onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
          />
        </div>
      </div>
    </MenuFormChrome>
  );
}

export default function NewCategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={28} strokeWidth={1.75} />
        </div>
      }
    >
      <NewCategoryPageInner />
    </Suspense>
  );
}
