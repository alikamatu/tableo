'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, GitBranch, QrCode, MapPin, Phone, 
  ExternalLink, Search, Filter, MoreVertical, 
  Edit2, Trash2, Globe, Clock, Loader2, ShoppingCart 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { fetchBranches, deleteBranch, setCurrentBranch } from '@/stores/branchSlice';
import { fetchRestaurants } from '@/stores/restaurantSlice';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/DropdownMenu';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as React from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalTitle, 
  ModalFooter 
} from '@/components/ui/Modal';

export default function BranchesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { branches, loading: branchesLoading } = useAppSelector((s) => s.branch);
  const { restaurants, current: restaurant, loading: restLoading } = useAppSelector((s) => s.restaurant);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<{ slug: string; qrCode: string; menuUrl: string } | null>(null);

  const loading = branchesLoading || restLoading;

  useEffect(() => {
    if (restaurants.length === 0 && !restLoading) {
      dispatch(fetchRestaurants());
    }
  }, [dispatch, restaurants.length, restLoading]);

  useEffect(() => {
    if (restaurant?.id) {
      dispatch(fetchBranches(restaurant.id));
    }
  }, [dispatch, restaurant?.id]);

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
  }, [loading, branches.length]);

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                           (b.address?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === 'all' ? true : 
                           statusFilter === 'active' ? b.isActive : !b.isActive;
      return matchesSearch && matchesStatus;
    });
  }, [branches, search, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!restaurant) return;
    try {
      await dispatch(deleteBranch({ restaurantId: restaurant.id, branchId: id })).unwrap();
      toast.success('Branch deleted');
      setDeletingId(null);
    } catch (err: any) {
      toast.error(err ?? 'Failed to delete branch');
    }
  };

  const handleManageBranch = (branch: any) => {
    dispatch(setCurrentBranch(branch));
    router.push('/dashboard/dashboard/orders');
    toast.success(`Managing ${branch.name}`);
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

  if (loading && !restaurant) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
          <Globe size={32} className="text-muted-foreground/40" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold">No restaurant selected</h3>
          <p className="text-muted-foreground max-w-xs">Please select a restaurant to manage its locations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Locations</h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Manage branches for <span className="text-foreground font-bold">{restaurant.name}</span>
          </p>
        </div>

        <Button 
          startContent={<Plus size={18} />} 
          onClick={() => router.push('/dashboard/dashboard/branches/new')}
          className="shadow-md shadow-primary/20"
        >
          New Branch
        </Button>
      </div>

      {/* SEARCH & FILTERS */}
      <Card className="border-none shadow-sm bg-muted/30">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search by name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface border-border border focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={statusFilter}
              onValueChange={(val: any) => setStatusFilter(val)}
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Closed', value: 'closed' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : filteredBranches.length === 0 ? (
        <Card className="p-20 text-center branch-card border-dashed bg-muted/10">
          <CardContent className="flex flex-col items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
              <GitBranch size={40} />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">
                {search || statusFilter !== 'all' ? 'No results found' : 'No branches yet'}
              </p>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto font-medium">
                {search || statusFilter !== 'all' 
                  ? 'Try adjusting your filters or search terms.' 
                  : 'Add your restaurant locations to start generating menus and receiving orders.'}
              </p>
            </div>
            {!(search || statusFilter !== 'all') && (
              <Button onClick={() => router.push('/dashboard/dashboard/branches/new')} variant="secondary">
                Add First Location
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.map((b) => (
            <Card key={b.id} className="branch-card group overflow-hidden hover:shadow-xl transition-all border-border bg-surface flex flex-col h-full">
              <CardHeader className="flex flex-row items-start justify-between pb-4 space-y-0">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={b.isActive ? 'primary' : 'muted'} className="h-5 px-1.5 text-[10px] uppercase tracking-wider font-bold">
                      {b.isActive ? 'Active' : 'Closed'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold truncate leading-tight">{b.name}</CardTitle>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                      <MoreVertical size={18} className="text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/dashboard/branches/${b.id}`)}>
                      <Edit2 size={14} className="mr-2" /> Edit Branch
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-danger focus:text-danger" 
                      onClick={() => setDeletingId(b.id)}
                    >
                      <Trash2 size={14} className="mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              
              <CardContent className="space-y-5 flex-1 flex flex-col">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2 text-muted-foreground text-sm font-medium">
                    <MapPin size={16} className="text-primary/60 mt-0.5 shrink-0" />
                    <span className="line-clamp-2 leading-snug">{b.address || 'Location undisclosed'}</span>
                  </div>
                  {b.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                      <Phone size={16} className="text-primary/60 shrink-0" />
                      <span>{b.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto space-y-4 pt-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 border border-border group-hover:bg-accent/50 transition-colors">
                    <div className="flex-1 text-xs font-bold text-muted-foreground tracking-tight truncate opacity-70">
                      /{b.slug}
                    </div>
                    <button
                      className="h-8 px-3 text-[10px] font-bold rounded-lg bg-surface border border-border hover:border-primary/40 hover:text-primary transition-all flex items-center"
                      onClick={() => window.open(`/menu/${b.slug}`, '_blank')}
                    >
                      View Menu <ExternalLink size={12} className="ml-1.5" />
                    </button>
                  </div>

                  <Button 
                    className="w-full gap-2 text-xs h-10 font-bold shadow-lg shadow-primary/10"
                    onClick={() => handleManageBranch(b)}
                  >
                    <ShoppingCart size={16} /> Manage Orders
                  </Button>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2 text-xs h-10 font-bold border-border hover:bg-primary/5 hover:border-primary/20"
                      onClick={() => showQrCode(b.id)}
                    >
                      <QrCode size={16} /> QR Code
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2 text-xs h-10 font-bold border-border hover:bg-primary/5 hover:border-primary/20"
                      onClick={() => router.push(`/dashboard/dashboard/branches/${b.id}`)}
                    >
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR MODAL (KEEPING THIS AS MODAL BECAUSE QR CODES ARE BEST VIEWED IN LIGHTBOX) */}
      <Modal open={!!qrModal} onOpenChange={() => setQrModal(null)}>
        <ModalContent className="sm:max-w-md">
          <ModalHeader>
            <ModalTitle>Branch Menu QR</ModalTitle>
          </ModalHeader>
          <div className="flex flex-col items-center gap-6 py-8">
            {qrModal && (
              <>
                <div className="p-6 rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrModal.qrCode} alt="Menu QR" className="w-56 h-56" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold text-foreground">{qrModal.menuUrl}</p>
                  <p className="text-xs text-muted-foreground px-10 font-medium leading-relaxed">
                    Print this QR and place it on your dining tables for easy menu access.
                  </p>
                </div>
              </>
            )}
          </div>
          <ModalFooter>
            <Button className="w-full h-12 rounded-xl font-bold" onClick={() => setQrModal(null)}>Dismiss</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <ModalContent className="sm:max-w-sm">
          <ModalHeader>
            <ModalTitle>Delete Branch?</ModalTitle>
          </ModalHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground font-medium">
              This action cannot be undone. All data associated with this branch will be permanently removed.
            </p>
          </div>
          <ModalFooter className="flex gap-3">
            <Button variant="muted" className="flex-1" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="primary" className="flex-1 bg-danger hover:bg-danger/90" onClick={() => deletingId && handleDelete(deletingId)}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

