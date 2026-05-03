'use client';

import { useMemo, useState } from 'react';
import { Loader2, Search, UtensilsCrossed } from 'lucide-react';
import api from '@/lib/api';
import { useAppSelector } from '@/stores/store';
import { useRestaurantMenu } from '@/features/menu/useRestaurantMenu';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ManagerMenuPage() {
  const { user } = useAppSelector((s) => s.auth);
  const { current: branch } = useAppSelector((s) => s.branch);
  const restaurantId = user?.staffMember?.branch?.restaurantId;
  const { items, loading, patchItemLocal } = useRestaurantMenu(restaurantId);
  const [query, setQuery] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, query]);

  const toggleBranchAvailability = async (itemId: string, next: boolean) => {
    if (!branch || !restaurantId) return;
    setSavingId(itemId);
    patchItemLocal(itemId, { isAvailable: next });
    try {
      await api.post(`/restaurants/${restaurantId}/branches/${branch.id}/overrides/${itemId}`, {
        isAvailable: next,
      });
      toast.success(next ? 'Enabled for branch' : 'Disabled for branch');
    } catch {
      patchItemLocal(itemId, { isAvailable: !next });
      toast.error('Could not update item');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <motion.div
      className="mx-auto max-w-3xl space-y-5 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <UtensilsCrossed size={18} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-lg font-medium tracking-tight text-fg sm:text-xl">Branch menu</h1>
          <p className="mt-0.5 text-sm leading-relaxed text-muted">
            Toggle availability for this branch only. Master menu stays in the owner dashboard.
          </p>
        </div>
      </div>

      <Card className="border-border/80 bg-surface/50">
        <CardContent className="p-4">
          <Input
            label="Search"
            value={query}
            onValueChange={setQuery}
            placeholder="Filter by name…"
            startContent={<Search size={16} strokeWidth={1.75} className="text-muted-foreground" />}
          />
        </CardContent>
      </Card>

      {!restaurantId || !branch ? (
        <Card className="border-border/80 bg-surface/40">
          <CardContent className="p-5 text-sm text-muted">
            Branch context is not ready. Try refreshing or signing in again.
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
          <Loader2 size={18} strokeWidth={1.75} className="animate-spin" />
          Loading…
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.28 }}
            >
              <Card className="border-border/80 bg-surface/40">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-fg">{item.name}</p>
                    <p className="truncate text-xs text-muted">
                      {item.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-[11px] text-muted">
                      {item.isAvailable ? 'On' : 'Off'}
                    </span>
                    <Switch
                      checked={item.isAvailable}
                      onCheckedChange={(checked) => void toggleBranchAvailability(item.id, checked)}
                      disabled={savingId === item.id}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredItems.length === 0 ? (
            <Card className="border-border/80 bg-surface/30">
              <CardContent className="p-6 text-center text-sm text-muted">
                No matching items.
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      <Card className="border-amber-500/25 bg-amber-500/5">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-fg">Full editing</p>
            <p className="text-xs text-muted">
              Owners edit categories and items under Dashboard → Menu.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="h-9 shrink-0 text-xs font-normal">
            <a href="/dashboard/menu">Open owner menu</a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
