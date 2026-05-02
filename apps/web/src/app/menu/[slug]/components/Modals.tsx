'use client';

import Image from 'next/image';
import { Info, Plus, MapPin, Store, ChevronRight, Clock, CreditCard } from 'lucide-react';
import { formatGHS } from '@tableo/utils';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { type MenuItem } from './MenuItemCard';

interface ItemDetailsModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem) => void;
}

export function ItemDetailsModal({ item, onClose, onAddToCart }: ItemDetailsModalProps) {
  return (
    <Modal open={!!item} onOpenChange={(open) => !open && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{item?.name}</ModalTitle>
        </ModalHeader>
        {item && (
          <div className="space-y-6">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-muted">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <Info size={48} className="text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-foreground">{item.name}</h3>
                <p className="text-primary text-xl font-black">{formatGHS(item.price)}</p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {item.description ||
                  'Our chef specially prepared this dish with high quality ingredients. Please ask our staff for any allergy information.'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                className="h-12 flex-1 rounded-2xl text-base font-black shadow-xl"
                onClick={() => {
                  onAddToCart(item);
                  onClose();
                }}
              >
                Add to Order
                <Plus size={18} className="ml-2" />
              </Button>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}

interface RestaurantInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: {
    name: string;
    logoUrl: string | null;
    address: string | null;
    restaurant?: {
      name: string;
      slug: string;
      branches?: Array<{ name: string; slug: string }>;
    };
  };
  currentSlug: string;
}

export function RestaurantInfoModal({
  isOpen,
  onClose,
  branch,
  currentSlug,
}: RestaurantInfoModalProps) {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Restaurant Information</ModalTitle>
        </ModalHeader>
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="border-primary/20 relative h-24 w-24 overflow-hidden rounded-[2rem] border-2">
              {branch.logoUrl ? (
                <Image src={branch.logoUrl} alt={branch.name} fill className="object-cover" />
              ) : (
                <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center text-3xl font-black">
                  {branch.name.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="text-xl font-black text-foreground">{branch.name}</h3>
            <Badge variant="outline">Verified Partner</Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-2xl bg-muted/40 p-4">
              <div className="text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface shadow-sm">
                <MapPin size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  Address
                </p>
                <p className="truncate text-sm font-semibold">{branch.address || 'Ghana'}</p>
              </div>
            </div>

            {branch.restaurant?.branches && branch.restaurant.branches.length > 1 && (
              <div className="space-y-2">
                <p className="text-muted-foreground px-1 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Other Locations
                </p>
                <div className="grid gap-2">
                  {branch.restaurant.branches
                    .filter((b) => b.slug !== currentSlug)
                    .map((b) => (
                      <button
                        key={b.slug}
                        onClick={() => (window.location.href = `/menu/${b.slug}`)}
                        className="hover:bg-primary/5 hover:ring-primary/20 group flex items-center justify-between gap-3 rounded-2xl bg-muted/40 p-4 text-left transition-all hover:ring-1"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-primary flex h-8 w-8 items-center justify-center rounded-lg bg-surface shadow-sm">
                            <Store size={16} />
                          </div>
                          <span className="text-sm font-bold">{b.name}</span>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5"
                        />
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 rounded-2xl bg-muted/40 p-4">
              <div className="text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface shadow-sm">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  Hours
                </p>
                <p className="text-sm font-semibold">Today: 08:00 AM - 10:00 PM</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-muted/40 p-4">
              <div className="text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface shadow-sm">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  Payments
                </p>
                <p className="text-sm font-semibold">Cash, Momo, Cards accepted</p>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-4 h-12 w-full rounded-2xl font-bold"
          onClick={onClose}
        >
          Close
        </Button>
      </ModalContent>
    </Modal>
  );
}
