'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCategoriesTree, fetchItems } from './menuApi';
import type { MenuCategoryNested, MenuCategoryRow, MenuItemRow } from './types';
import { flattenCategoriesFromApi } from './types';

export function useRestaurantMenu(restaurantId: string | undefined) {
  const [categoriesTree, setCategoriesTree] = useState<MenuCategoryNested[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!restaurantId) {
      setCategoriesTree([]);
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [cats, its] = await Promise.all([
        fetchCategoriesTree(restaurantId),
        fetchItems(restaurantId),
      ]);
      setCategoriesTree(cats);
      setItems(its);
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg ?? 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const flattenedCategories = useMemo(
    () => flattenCategoriesFromApi(categoriesTree),
    [categoriesTree],
  );

  const topLevelCategories = useMemo(
    () => flattenedCategories.filter((c) => !c.parentId),
    [flattenedCategories],
  );

  const childrenOf = useCallback(
    (parentId: string) => flattenedCategories.filter((c) => c.parentId === parentId),
    [flattenedCategories],
  );

  const categoriesById = useMemo(() => {
    const m = new Map<string, MenuCategoryRow>();
    for (const c of flattenedCategories) m.set(c.id, c);
    return m;
  }, [flattenedCategories]);

  const itemsByCategoryId = useMemo(() => {
    const m = new Map<string, MenuItemRow[]>();
    for (const item of items) {
      const list = m.get(item.categoryId) ?? [];
      list.push(item);
      m.set(item.categoryId, list);
    }
    for (const [, list] of m) {
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return m;
  }, [items]);

  const patchItemLocal = useCallback((itemId: string, patch: Partial<MenuItemRow>) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...patch } : i)));
  }, []);

  return {
    categoriesTree,
    flattenedCategories,
    topLevelCategories,
    childrenOf,
    categoriesById,
    items,
    itemsByCategoryId,
    loading,
    error,
    refetch,
    patchItemLocal,
  };
}
