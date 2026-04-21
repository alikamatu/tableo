'use client';

import { useState } from 'react';
import { Plus, GitBranch, QrCode, MapPin, Phone, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { createBranch } from '@/stores/branchSlice';
import { createBranchSchema } from '@/lib/validations';
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
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function BranchesPage() {
  const dispatch = useAppDispatch();
  const { branches, loading } = useAppSelector((s) => s.branch);
  const { current: restaurant } = useAppSelector((s) => s.restaurant);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [qrModal, setQrModal] = useState<{ slug: string; qrCode: string; menuUrl: string } | null>(null);

  useGSAP(() => {
    if (!loading) {
      gsap.from('.branch-card', {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.4,
        ease: 'power3.out'
      });
    }
  }, [loading]);

  const update = (field: string) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleCreate = async () => {
    if (!restaurant) return;
    const result = createBranchSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setCreating(true);
    try {
      await dispatch(
        createBranch({
          restaurantId: restaurant.id,
          name: form.name,
          address: form.address || undefined,
          phone: form.phone || undefined,
        }),
      ).unwrap();
      toast.success('Branch added');
      setForm({ name: '', address: '', phone: '' });
      setCreateOpen(false);
    } catch (err: any) {
      toast.error(err ?? 'Failed to create branch');
    } finally {
      setCreating(false);
    }
  };

  const showQrCode = async (branchId: string) => {
    if (!restaurant) return;
    try {
      const { data } = await api.get(
        `/restaurants/${restaurant.id}/branches/${branchId}/qrcode`,
        { params: { baseUrl: window.location.origin } },
      );
      setQrModal(data.data);
    } catch {
      toast.error('Failed to generate QR code');
    }
  };

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground font-medium">Select a restaurant to manage locations.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Locations</h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Manage branches for <span className="text-foreground font-bold">{restaurant.name}</span>
          </p>
        </div>

        <Modal open={createOpen} onOpenChange={setCreateOpen}>
          <ModalTrigger asChild>
            <Button startContent={<Plus size={18} />}>New Branch</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Add Location</ModalTitle>
            </ModalHeader>
            <div className="space-y-4 py-4">
              <Input label="Branch Name" value={form.name} onValueChange={update('name')} placeholder="e.g. Downtown Mall" />
              <Input label="Address" value={form.address} onValueChange={update('address')} placeholder="123 Commercial Road" />
              <Input label="Business Phone" value={form.phone} onValueChange={update('phone')} placeholder="+233..." />
            </div>
            <ModalFooter>
              <Button variant="muted" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button loading={creating} onClick={handleCreate}>Add Branch</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      {branches.length === 0 && !loading ? (
        <Card className="p-16 text-center branch-card border-dashed">
          <CardContent className="flex flex-col items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <GitBranch size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-foreground">No branches yet</p>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Add your restaurant locations to start generating menus and receiving orders.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)} variant="secondary">Add First Location</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {branches.map((b) => (
            <Card key={b.id} className="branch-card group overflow-hidden hover:shadow-md transition-all border-border active:scale-[0.99]">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">{b.name}</CardTitle>
                  <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground text-xs font-medium">
                    <MapPin size={12} className="text-primary/60" />
                    <span className="truncate">{b.address || 'Location undisclosed'}</span>
                  </div>
                </div>
                <Badge variant={b.isActive ? 'primary' : 'muted'} className="h-5 px-1.5">
                  {b.isActive ? 'Active' : 'Closed'}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-muted border border-border group-hover:bg-accent transition-colors">
                  <div className="flex-1 text-[10px] font-bold text-muted-foreground tracking-tight truncate">
                    /{b.slug}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="h-8 px-3 text-[10px] rounded-lg"
                    onClick={() => window.open(`/menu/${b.slug}`, '_blank')}
                  >
                    Menu <ExternalLink size={10} className="ml-1.5" />
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2 text-[11px] h-9 font-bold"
                    onClick={() => showQrCode(b.id)}
                  >
                    <QrCode size={14} /> Get QR
                  </Button>
                  {b.phone && (
                    <Button variant="outline" className="h-9 w-9 p-0" asChild>
                      <a href={`tel:${b.phone}`}><Phone size={14} /></a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR MODAL */}
      <Modal open={!!qrModal} onOpenChange={() => setQrModal(null)}>
        <ModalContent className="sm:max-w-md">
          <ModalHeader>
            <ModalTitle>Branch Menu QR</ModalTitle>
          </ModalHeader>
          <div className="flex flex-col items-center gap-6 py-8">
            {qrModal && (
              <>
                <div className="p-5 rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrModal.qrCode} alt="Menu QR" className="w-52 h-52" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold text-foreground">{qrModal.menuUrl}</p>
                  <p className="text-xs text-muted-foreground px-6 font-medium">
                    Print this QR and place it on your dining tables for easy menu access.
                  </p>
                </div>
              </>
            )}
          </div>
          <ModalFooter>
            <Button className="w-full h-11" onClick={() => setQrModal(null)}>Dismiss</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
