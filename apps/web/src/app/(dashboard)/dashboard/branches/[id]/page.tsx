'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Store, MapPin, Phone, Check, Loader2, Save, Trash2, Power } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { fetchBranch, updateBranch, deleteBranch } from '@/stores/branchSlice';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import toast from 'react-hot-toast';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as React from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';

export default function EditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const branchId = params.id as string;
  const dispatch = useAppDispatch();
  
  const { current: restaurant } = useAppSelector((s) => s.restaurant);
  const { current: branch, loading, error } = useAppSelector((s) => s.branch);
  
  const [form, setForm] = useState({ name: '', address: '', phone: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const containerRef = React.useRef(null);

  useEffect(() => {
    if (restaurant?.id && branchId) {
      dispatch(fetchBranch({ restaurantId: restaurant.id, branchId }));
    }
  }, [dispatch, restaurant?.id, branchId]);

  useEffect(() => {
    if (branch) {
      setForm({
        name: branch.name,
        address: branch.address || '',
        phone: branch.phone || '',
        isActive: branch.isActive
      });
    }
  }, [branch]);

  useGSAP(() => {
    if (!loading && branch) {
      gsap.from('.reveal', {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power3.out'
      });
    }
  }, [loading, !!branch]);

  const update = (field: string) => (value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !branch) return;
    
    if (!form.name.trim()) {
      toast.error('Branch name is required');
      return;
    }

    setSaving(true);
    try {
      await dispatch(
        updateBranch({
          restaurantId: restaurant.id,
          branchId: branch.id,
          ...form
        }),
      ).unwrap();
      toast.success('Branch updated successfully');
      router.push('/dashboard/dashboard/branches');
    } catch (err: any) {
      toast.error(err ?? 'Failed to update branch');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!restaurant || !branch) return;
    try {
      await dispatch(deleteBranch({ restaurantId: restaurant.id, branchId: branch.id })).unwrap();
      toast.success('Branch deleted');
      router.push('/dashboard/dashboard/branches');
    } catch (err: any) {
      toast.error(err ?? 'Failed to delete branch');
    }
  };

  if (loading && !branch) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!branch && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
        <p className="text-muted-foreground font-medium">Branch not found.</p>
        <Button onClick={() => router.push('/dashboard/dashboard/branches')}>Go Back</Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-2xl mx-auto space-y-8 pb-10">
      <div className="reveal flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="h-10 w-10 p-0 rounded-xl hover:bg-muted"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Branch</h1>
            <p className="text-muted-foreground text-sm font-medium">Update branch details or status</p>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="text-danger hover:bg-danger/5 border-danger/20"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 size={18} className="mr-2" /> Delete
        </Button>
      </div>

      <Card className="reveal border-none shadow-xl bg-surface overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Store size={20} />
              </div>
              <div>
                <CardTitle className="text-lg">{branch?.name}</CardTitle>
                <p className="text-xs text-muted-foreground font-medium">Manage this location</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-surface px-3 py-1.5 rounded-full border border-border">
              <Power size={14} className={form.isActive ? 'text-success' : 'text-muted-foreground'} />
              <span className="text-xs font-bold uppercase tracking-wider">{form.isActive ? 'Active' : 'Closed'}</span>
              <Switch checked={form.isActive} onCheckedChange={(val) => update('isActive')(val)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-4">
              <Input 
                label="Branch Name" 
                placeholder="e.g. Osu Branch" 
                value={form.name}
                onValueChange={update('name')}
                startContent={<Store size={18} className="text-muted-foreground" />}
                className="h-12"
              />
              
              <Input 
                label="Address" 
                placeholder="123 Oxford Street, Accra" 
                value={form.address}
                onValueChange={update('address')}
                startContent={<MapPin size={18} className="text-muted-foreground" />}
                className="h-12"
              />
              
              <Input 
                label="Phone Number" 
                placeholder="+233 24 000 0000" 
                value={form.phone}
                onValueChange={update('phone')}
                startContent={<Phone size={18} className="text-muted-foreground" />}
                className="h-12"
              />
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Button 
                type="button" 
                variant="muted" 
                className="flex-1 h-12 rounded-xl font-bold"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={saving}
                className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
                startContent={!saving && <Save size={18} />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <ModalContent className="sm:max-w-sm">
          <ModalHeader>
            <ModalTitle>Delete Branch?</ModalTitle>
          </ModalHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground font-medium">
              Are you sure you want to delete <span className="text-foreground font-bold">{branch?.name}</span>? 
              This action cannot be undone.
            </p>
          </div>
          <ModalFooter className="flex gap-3">
            <Button variant="muted" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1 bg-danger hover:bg-danger/90" onClick={handleDelete}>Delete Permanently</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
