'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  UtensilsCrossed, 
  FolderPlus, 
  MoreVertical,
  Image as ImageIcon
} from 'lucide-react';
import { useAppSelector } from '@/stores/store';
import api from '@/lib/api';
import { createCategorySchema, createMenuItemSchema } from '@/lib/validations';
import { formatGHS } from '@tableo/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalTrigger,
} from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as React from 'react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  basePrice: string;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
}

export default function MenuPage() {
  const { current: restaurant } = useAppSelector((s) => s.restaurant);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [catOpen, setCatOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [itemForm, setItemForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    basePrice: '',
    isAvailable: true,
  });

  const load = useCallback(async () => {
    if (!restaurant) return;
    setLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([
        api.get(`/restaurants/${restaurant.id}/categories`),
        api.get(`/restaurants/${restaurant.id}/items`),
      ]);
      setCategories(catRes.data.data);
      setItems(itemRes.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [restaurant]);

  useEffect(() => {
    load();
  }, [load]);

  useGSAP(() => {
    if (!loading) {
      gsap.from('.menu-cat-reveal', {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.4,
        ease: 'power3.out'
      });
    }
  }, [loading]);

  const handleCreateCategory = async () => {
    if (!restaurant) return;
    const result = createCategorySchema.safeParse({ name: catName });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Invalid');
      return;
    }
    try {
      await api.post(`/restaurants/${restaurant.id}/categories`, { name: catName });
      toast.success('Category saved');
      setCatName('');
      setCatOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to create category');
    }
  };

  const handleCreateItem = async () => {
    if (!restaurant) return;
    const price = parseFloat(itemForm.basePrice);
    const parsed = createMenuItemSchema.safeParse({
      ...itemForm,
      basePrice: price,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    try {
      await api.post(`/restaurants/${restaurant.id}/items`, {
        ...itemForm,
        basePrice: price,
      });
      toast.success('Item added');
      setItemForm({ categoryId: '', name: '', description: '', basePrice: '', isAvailable: true });
      setItemOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to create item');
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    if (!restaurant) return;
    try {
      await api.patch(`/restaurants/${restaurant.id}/items/${item.id}`, {
        isAvailable: !item.isAvailable,
      });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i));
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to update');
    }
  };

  if (!restaurant) return <div className="text-center py-20 text-muted-foreground font-medium">Select a restaurant first.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Menu Designer</h1>
          <p className="text-muted-foreground mt-1 font-medium">Craft your restaurant&apos;s digital experience.</p>
        </div>
        
        <div className="flex gap-3">
          <Modal open={catOpen} onOpenChange={setCatOpen}>
            <ModalTrigger asChild>
              <Button variant="outline" startContent={<FolderPlus size={18} />}>Category</Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>New Category</ModalTitle>
              </ModalHeader>
              <div className="py-4">
                <Input label="Category Name" value={catName} onValueChange={setCatName} placeholder="e.g. Main Courses" autoFocus />
              </div>
              <ModalFooter>
                <Button variant="muted" onClick={() => setCatOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateCategory}>Save</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          <Modal open={itemOpen} onOpenChange={setItemOpen}>
            <ModalTrigger asChild>
              <Button startContent={<Plus size={18} />}>Add Item</Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>New Item</ModalTitle>
              </ModalHeader>
              <div className="space-y-4 py-4">
                <Select 
                  value={itemForm.categoryId} 
                  onValueChange={(v) => setItemForm(f => ({ ...f, categoryId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input label="Item Name" value={itemForm.name} onValueChange={(v) => setItemForm(f => ({ ...f, name: v }))} placeholder="Flame-Grilled Burger" />
                <Input label="Description" value={itemForm.description} onValueChange={(v) => setItemForm(f => ({ ...f, description: v }))} placeholder="Brief ingredient summary..." />
                <Input 
                  label="Price (₵)" 
                  type="number" 
                  value={itemForm.basePrice} 
                  onValueChange={(v) => setItemForm(f => ({ ...f, basePrice: v }))} 
                  placeholder="0.00"
                />
              </div>
              <ModalFooter>
                <Button variant="muted" onClick={() => setItemOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateItem}>Add Item</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>
      </div>

      {categories.length === 0 && !loading ? (
        <Card className="p-16 text-center menu-cat-reveal border-dashed">
          <CardContent className="flex flex-col items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <UtensilsCrossed size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-foreground">Menu is empty</p>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">Create your first category to start populating your digital menu.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-10">
          {categories.map((cat) => {
            const catItems = items.filter((i) => i.categoryId === cat.id);
            return (
              <div key={cat.id} className="menu-cat-reveal space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-foreground">{cat.name}</h3>
                    <Badge variant="muted" className="h-5 px-1.5">{catItems.length} items</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreVertical size={16} /></Button>
                </div>

                <Card className="overflow-hidden shadow-sm border-border">
                  <CardContent className="p-0">
                    {catItems.length === 0 ? (
                      <div className="p-10 text-center text-muted-foreground text-sm font-medium italic">
                        No items in this category yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {catItems.map((item) => (
                          <div
                            key={item.id}
                            className="group flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="h-10 w-10 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all overflow-hidden">
                                {item.imageUrl ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <ImageIcon size={18} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors text-sm">
                                  {item.name}
                                </p>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5 max-w-md truncate font-medium">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6 shrink-0">
                              <p className="font-bold text-foreground text-sm">
                                {formatGHS(parseFloat(item.basePrice))}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className={cn("text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60 transition-colors", item.isAvailable && "text-green-600/60")}>
                                  {item.isAvailable ? 'Available' : 'Sold Out'}
                                </span>
                                <Switch
                                  checked={item.isAvailable}
                                  onCheckedChange={() => toggleAvailability(item)}
                                  className="scale-90"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
