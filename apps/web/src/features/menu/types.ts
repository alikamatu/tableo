/** API category as returned on GET categories (top-level with nested subs). */
export interface MenuCategoryNested {
  id: string;
  name: string;
  description?: string | null;
  coverUrl?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive?: boolean;
  subCategories?: MenuCategoryNested[];
  _count?: { menuItems?: number; subCategories?: number };
}

/** Flattened category row used in admin UI. */
export interface MenuCategoryRow {
  id: string;
  name: string;
  description?: string | null;
  coverUrl?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive?: boolean;
  subCategories?: MenuCategoryNested[];
  _count?: { menuItems?: number; subCategories?: number };
}

export interface MenuItemRow {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  basePrice: string;
  discountedPrice?: string | null;
  priceVariants?: { label: string; price: number }[] | null;
  imageUrl: string | null;
  galleryUrls?: string[];
  isAvailable: boolean;
  isFeatured?: boolean;
  label?: string;
  tags?: string[];
  allergens?: string[];
  prepTime?: number | null;
  calories?: number | null;
  availableFrom?: string | null;
  availableTo?: string | null;
  sortOrder: number;
}

export function flattenCategoriesFromApi(top: MenuCategoryNested[]): MenuCategoryRow[] {
  return top.flatMap((cat) => [
    cat as MenuCategoryRow,
    ...((cat.subCategories ?? []) as MenuCategoryRow[]),
  ]);
}
