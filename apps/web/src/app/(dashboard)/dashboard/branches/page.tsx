'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  GitBranch,
  QrCode,
  MapPin,
  Phone,
  ExternalLink,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Globe,
  Clock,
  Loader2,
  ShoppingCart,
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
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu';
import { motion } from 'framer-motion';
import * as React from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';

export default function BranchesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { branches, loading: branchesLoading } = useAppSelector((s) => s.branch);
  const {
    restaurants,
    current: restaurant,
    loading: restLoading,
  } = useAppSelector((s) => s.restaurant);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<{ slug: string; qrCode: string; menuUrl: string } | null>(
    null,
  );

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

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        (b.address?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesStatus =
        statusFilter === 'all' ? true : statusFilter === 'active' ? b.isActive : !b.isActive;
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
    router.push('/dashboard/orders');
    toast.success(`Managing ${branch.name}`);
  };

  const showQrCode = async (branchId: string) => {
    if (!restaurant) return;
    try {
      const { data } = await api.get(`/restaurants/${restaurant.id}/branches/${branchId}/qrcode`, {
        params: { baseUrl: window.location.origin },
      });
      setQrModal(data.data);
    } catch {
      toast.error('Failed to generate QR code');
    }
  };

  if (loading && !restaurant) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Globe size={32} className="text-muted-foreground/40" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold">No restaurant selected</h3>
          <p className="text-muted-foreground max-w-xs">
            Please select a restaurant to manage its locations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Locations</h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Manage branches for <span className="font-bold text-foreground">{restaurant.name}</span>
          </p>
        </div>

        <Button
          startContent={<Plus size={18} />}
          onClick={() => router.push('/dashboard/branches/new')}
          className="shadow-primary/20 shadow-md"
        >
          New Branch
        </Button>
      </div>

      {/* SEARCH & FILTERS */}
      <Card className="border-none bg-muted/30 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:ring-primary/20 h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm font-medium outline-none transition-all focus:ring-2"
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
          <Loader2 className="text-primary animate-spin" size={32} />
        </div>
      ) : filteredBranches.length === 0 ? (
        <Card className="branch-card border-dashed bg-muted/10 p-20 text-center">
          <CardContent className="flex flex-col items-center gap-6">
            <div className="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-3xl shadow-inner">
              <GitBranch size={40} />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">
                {search || statusFilter !== 'all' ? 'No results found' : 'No branches yet'}
              </p>
              <p className="text-muted-foreground mx-auto max-w-xs text-sm font-medium">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Add your restaurant locations to start generating menus and receiving orders.'}
              </p>
            </div>
            {!(search || statusFilter !== 'all') && (
              <Button onClick={() => router.push('/dashboard/branches/new')} variant="secondary">
                Add First Location
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                key={b.id}
                className="branch-card group flex h-full flex-col overflow-hidden border-border bg-surface transition-all hover:shadow-xl"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <div className="min-w-0 pr-2">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge
                        variant={b.isActive ? 'primary' : 'muted'}
                        className="h-5 px-1.5 text-[10px] font-bold uppercase tracking-wider"
                      >
                        {b.isActive ? 'Active' : 'Closed'}
                      </Badge>
                    </div>
                    <CardTitle className="truncate text-lg font-bold leading-tight">
                      {b.name}
                    </CardTitle>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted">
                        <MoreVertical size={18} className="text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/branches/${b.id}`)}>
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

                <CardContent className="flex flex-1 flex-col space-y-5">
                  <div className="space-y-2.5">
                    <div className="text-muted-foreground flex items-start gap-2 text-sm font-medium">
                      <MapPin size={16} className="text-primary/60 mt-0.5 shrink-0" />
                      <span className="line-clamp-2 leading-snug">
                        {b.address || 'Location undisclosed'}
                      </span>
                    </div>
                    {b.phone && (
                      <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                        <Phone size={16} className="text-primary/60 shrink-0" />
                        <span>{b.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto space-y-4 pt-2">
                    <div className="group-hover:bg-accent/50 flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-2.5 transition-colors">
                      <div className="text-muted-foreground flex-1 truncate text-xs font-bold tracking-tight opacity-70">
                        /{b.slug}
                      </div>
                      <button
                        className="hover:border-primary/40 hover:text-primary flex h-8 items-center rounded-lg border border-border bg-surface px-3 text-[10px] font-bold transition-all"
                        onClick={() => window.open(`/menu/${b.slug}`, '_blank')}
                      >
                        View Menu <ExternalLink size={12} className="ml-1.5" />
                      </button>
                    </div>

                    <Button
                      className="shadow-primary/10 h-10 w-full gap-2 text-xs font-bold shadow-lg"
                      onClick={() => handleManageBranch(b)}
                    >
                      <ShoppingCart size={16} /> Manage Orders
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="hover:bg-primary/5 hover:border-primary/20 h-10 flex-1 gap-2 border-border text-xs font-bold"
                        onClick={() => showQrCode(b.id)}
                      >
                        <QrCode size={16} /> QR Code
                      </Button>
                      <Button
                        variant="outline"
                        className="hover:bg-primary/5 hover:border-primary/20 h-10 flex-1 gap-2 border-border text-xs font-bold"
                        onClick={() => router.push(`/dashboard/branches/${b.id}`)}
                      >
                        <Edit2 size={16} /> Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
                <div className="rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
                  <img src={qrModal.qrCode} alt="Menu QR" className="h-56 w-56" />
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-sm font-bold text-foreground">{qrModal.menuUrl}</p>
                  <p className="text-muted-foreground px-10 text-xs font-medium leading-relaxed">
                    Print this QR and place it on your dining tables for easy menu access.
                  </p>
                </div>
              </>
            )}
          </div>
          <ModalFooter>
            <Button className="h-12 w-full rounded-xl font-bold" onClick={() => setQrModal(null)}>
              Dismiss
            </Button>
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
            <p className="text-muted-foreground text-sm font-medium">
              This action cannot be undone. All data associated with this branch will be permanently
              removed.
            </p>
          </div>
          <ModalFooter className="flex gap-3">
            <Button variant="muted" className="flex-1" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-danger hover:bg-danger/90"
              onClick={() => deletingId && handleDelete(deletingId)}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
