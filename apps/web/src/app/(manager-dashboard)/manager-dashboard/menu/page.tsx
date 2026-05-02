'use client';

import { useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import api from '@/lib/api';
import { useAppSelector } from '@/stores/store';
import { useRestaurantMenu } from '@/features/menu/useRestaurantMenu';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

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
      toast.success(`Item ${next ? 'enabled' : 'disabled'} for this branch`);
    } catch {
      patchItemLocal(itemId, { isAvailable: !next });
      toast.error('Failed to update branch item availability');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-fg">Branch Menu Controls</h1>
        <p className="text-sm text-muted">
          Toggle item availability per branch. This does not change the master menu.
        </p>
      </div>

      <Card className="border-border/50 bg-surface">
        <CardContent className="p-4">
          <Input
            label="Search menu item"
            value={query}
            onValueChange={setQuery}
            placeholder="e.g. Jollof"
            startContent={<Search size={16} className="text-muted-foreground" />}
          />
        </CardContent>
      </Card>

      {!restaurantId || !branch ? (
        <Card className="border-border/50 bg-surface">
          <CardContent className="p-6 text-sm text-muted">
            Manager branch context is not ready. Refresh or re-login to continue.
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center py-20 text-muted">
          <Loader2 size={20} className="mr-2 animate-spin" />
          Loading branch menu...
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="border-border/50 bg-surface">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-fg">{item.name}</p>
                  <p className="truncate text-xs text-muted">
                    {item.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
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
          ))}
          {filteredItems.length === 0 ? (
            <Card className="border-border/50 bg-surface">
              <CardContent className="p-6 text-sm text-muted">
                No matching menu items found.
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      <Card className="border-warning/40 bg-warning/5">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm font-bold text-fg">Need full menu editing?</p>
            <p className="text-xs text-muted">Owners manage categories/items in Dashboard Menu.</p>
          </div>
          <Button asChild size="sm" variant="outline">
            <a href="/dashboard/menu">Open owner menu</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
