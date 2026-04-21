'use client';

import { useState } from 'react';
import { Plus, Store, ChevronRight, LayoutGrid } from 'lucide-react';
import { useRestaurant } from '@/hooks/use-restaurant';
import { useAppDispatch } from '@/stores/store';
import { createRestaurant, setCurrent } from '@/stores/restaurantSlice';
import { createRestaurantSchema } from '@/lib/validations';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalTrigger,
} from '@/components/ui/Modal';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as React from 'react';
import toast from 'react-hot-toast';

export default function RestaurantsPage() {
  const { restaurants, loading } = useRestaurant();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef(null);

  useGSAP(() => {
    if (!loading) {
      gsap.from('.restaurant-card', {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.4,
        ease: 'power3.out'
      });
    }
  }, [loading]);

  const handleCreate = async () => {
    const result = createRestaurantSchema.safeParse({ name });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setCreating(true);
    try {
      await dispatch(createRestaurant({ name })).unwrap();
      toast.success('Restaurant created!');
      setName('');
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err ?? 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const selectAndNavigate = (restaurant: any) => {
    dispatch(setCurrent(restaurant));
    router.push('/branches');
  };

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Restaurants</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage your dining establishments.</p>
        </div>
        
        <Modal open={isOpen} onOpenChange={setIsOpen}>
          <ModalTrigger asChild>
            <Button startContent={<Plus size={18} />}>
              Add Restaurant
            </Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>New Restaurant</ModalTitle>
            </ModalHeader>
            <div className="py-4">
              <Input
                label="Restaurant Name"
                placeholder="e.g. The Coastal Kitchen"
                value={name}
                onValueChange={setName}
                autoFocus
              />
            </div>
            <ModalFooter>
              <Button variant="muted" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                loading={creating}
                onClick={handleCreate}
              >
                Create
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      {restaurants.length === 0 && !loading ? (
        <Card className="p-16 text-center restaurant-card border-dashed">
          <CardContent className="flex flex-col items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Store size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-foreground">No restaurants found</p>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Start your journey by adding your first restaurant branch.
              </p>
            </div>
            <Button onClick={() => setIsOpen(true)} variant="secondary">
              Initialize First Restaurant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <Card
              key={r.id}
              onClick={() => selectAndNavigate(r)}
              className="restaurant-card group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.99]"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black shadow-sm text-lg">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="leading-none">{r.name}</CardTitle>
                    <Badge variant={r.subStatus === 'active' ? 'success' : 'warning'} className="mt-2">
                      {r.plan}
                    </Badge>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <LayoutGrid size={14} className="text-primary/60" />
                    <span>{r._count?.branches ?? 0} Locations</span>
                  </div>
                  <span className="text-[10px] tracking-tighter">Joined {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
