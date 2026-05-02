import type { MenuItemRow } from './types';

export const ITEM_LABEL_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'new_item', label: 'New' },
  { value: 'bestseller', label: 'Bestseller' },
  { value: 'spicy', label: 'Spicy' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten_free', label: 'Gluten free' },
  { value: 'chef_special', label: 'Chef special' },
  { value: 'limited', label: 'Limited' },
] as const;

export type ItemLabelValue = (typeof ITEM_LABEL_OPTIONS)[number]['value'];

export interface MenuItemFormState {
  categoryId: string;
  name: string;
  description: string;
  basePrice: string;
  discountedPrice: string;
  priceVariants: { label: string; price: string }[];
  imageUrl: string;
  galleryUrls: string[];
  label: ItemLabelValue;
  tags: string;
  allergens: string;
  prepTime: string;
  calories: string;
  availableFrom: string;
  availableTo: string;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: string;
}

export function emptyMenuItemForm(defaultCategoryId = ''): MenuItemFormState {
  return {
    categoryId: defaultCategoryId,
    name: '',
    description: '',
    basePrice: '',
    discountedPrice: '',
    priceVariants: [],
    imageUrl: '',
    galleryUrls: [],
    label: 'none',
    tags: '',
    allergens: '',
    prepTime: '',
    calories: '',
    availableFrom: '',
    availableTo: '',
    isAvailable: true,
    isFeatured: false,
    sortOrder: '',
  };
}

function normalizePriceVariants(raw: unknown): { label: string; price: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const o = row as { label?: string; price?: number };
      if (!o.label) return null;
      return { label: o.label, price: o.price != null ? String(o.price) : '' };
    })
    .filter(Boolean) as { label: string; price: string }[];
}

export function itemRowToForm(item: MenuItemRow): MenuItemFormState {
  const label = (item.label ?? 'none') as ItemLabelValue;
  return {
    categoryId: item.categoryId,
    name: item.name,
    description: item.description ?? '',
    basePrice: item.basePrice,
    discountedPrice: item.discountedPrice ?? '',
    priceVariants: normalizePriceVariants(item.priceVariants),
    imageUrl: item.imageUrl ?? '',
    galleryUrls: [...(item.galleryUrls ?? [])],
    label: ITEM_LABEL_OPTIONS.some((o) => o.value === label) ? label : 'none',
    tags: (item.tags ?? []).join(', '),
    allergens: (item.allergens ?? []).join(', '),
    prepTime: item.prepTime != null ? String(item.prepTime) : '',
    calories: item.calories != null ? String(item.calories) : '',
    availableFrom: item.availableFrom ?? '',
    availableTo: item.availableTo ?? '',
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured ?? false,
    sortOrder: item.sortOrder != null ? String(item.sortOrder) : '',
  };
}

export function buildMenuItemApiBody(form: MenuItemFormState) {
  const basePrice = parseFloat(form.basePrice);
  const discountedPrice = form.discountedPrice.trim()
    ? parseFloat(form.discountedPrice)
    : undefined;

  const tags = form.tags
    ? form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const allergens = form.allergens
    ? form.allergens
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const priceVariants = form.priceVariants
    .filter((v) => v.label.trim() && v.price.trim() !== '')
    .map((v) => ({
      label: v.label.trim(),
      price: parseFloat(v.price),
    }));

  const galleryUrls = form.galleryUrls.map((u) => u.trim()).filter(Boolean);

  const prepTime = form.prepTime.trim() ? parseInt(form.prepTime, 10) : undefined;
  const calories = form.calories.trim() ? parseInt(form.calories, 10) : undefined;
  const sortOrder = form.sortOrder.trim() ? Number(form.sortOrder) : undefined;

  const body: Record<string, unknown> = {
    categoryId: form.categoryId,
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    basePrice,
    discountedPrice,
    imageUrl: form.imageUrl.trim() || undefined,
    galleryUrls: galleryUrls.length ? galleryUrls : undefined,
    priceVariants: priceVariants.length ? priceVariants : undefined,
    tags: tags.length ? tags : undefined,
    allergens: allergens.length ? allergens : undefined,
    prepTime,
    calories,
    availableFrom: form.availableFrom.trim() || undefined,
    availableTo: form.availableTo.trim() || undefined,
    isAvailable: form.isAvailable,
    isFeatured: form.isFeatured,
    sortOrder,
  };

  if (form.label && form.label !== 'none') {
    body.label = form.label;
  }

  return body;
}
