import api from '@/lib/api';
import type { MenuCategoryNested, MenuItemRow } from './types';

export async function fetchCategoriesTree(restaurantId: string) {
  const res = await api.get<{ data: MenuCategoryNested[] }>(
    `/restaurants/${restaurantId}/categories`,
  );
  return res.data.data;
}

export async function fetchCategory(restaurantId: string, categoryId: string) {
  const res = await api.get<{
    data: MenuCategoryNested & { subCategories?: MenuCategoryNested[] };
  }>(`/restaurants/${restaurantId}/categories/${categoryId}`);
  return res.data.data;
}

export async function fetchItems(restaurantId: string) {
  const res = await api.get<{ data: MenuItemRow[] }>(`/restaurants/${restaurantId}/items`);
  return res.data.data;
}

export async function createCategory(restaurantId: string, body: Record<string, unknown>) {
  const res = await api.post(`/restaurants/${restaurantId}/categories`, body);
  return res.data.data;
}

export async function updateCategory(
  restaurantId: string,
  categoryId: string,
  body: Record<string, unknown>,
) {
  const res = await api.patch(`/restaurants/${restaurantId}/categories/${categoryId}`, body);
  return res.data.data;
}

export async function deleteCategory(restaurantId: string, categoryId: string) {
  await api.delete(`/restaurants/${restaurantId}/categories/${categoryId}`);
}

export async function createItem(restaurantId: string, body: Record<string, unknown>) {
  const res = await api.post(`/restaurants/${restaurantId}/items`, body);
  return res.data.data;
}

export async function updateItem(
  restaurantId: string,
  itemId: string,
  body: Record<string, unknown>,
) {
  const res = await api.patch(`/restaurants/${restaurantId}/items/${itemId}`, body);
  return res.data.data;
}

export async function deleteItem(restaurantId: string, itemId: string) {
  await api.delete(`/restaurants/${restaurantId}/items/${itemId}`);
}
