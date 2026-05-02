'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Check,
  User,
  Mail,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { createBranch } from '@/stores/branchSlice';
import { fetchRestaurants } from '@/stores/restaurantSlice';
import { createBranchSchema } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Divider } from '@/components/ui/Divider';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as React from 'react';

export default function NewBranchPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    restaurants,
    current: currentRestaurant,
    loading: restLoading,
  } = useAppSelector((s) => s.restaurant);

  const [form, setForm] = useState({
    restaurantId: '',
    name: '',
    address: '',
    phone: '',
    managerName: '',
    managerEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [tempPass, setTempPass] = useState<string | null>(null);

  const containerRef = React.useRef(null);

  useEffect(() => {
    if (restaurants.length === 0) {
      dispatch(fetchRestaurants());
    }
  }, [dispatch, restaurants.length]);

  useEffect(() => {
    if (currentRestaurant && !form.restaurantId) {
      setForm((prev) => ({ ...prev, restaurantId: currentRestaurant.id }));
    } else if (restaurants.length > 0 && !form.restaurantId) {
      setForm((prev) => ({ ...prev, restaurantId: restaurants[0]!.id }));
    }
  }, [currentRestaurant, restaurants, form.restaurantId]);

  useGSAP(
    () => {
      gsap.from('.reveal', {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power3.out',
      });
    },
    { scope: containerRef },
  );

  const update = (field: string) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.restaurantId) {
      toast.error('Please select a restaurant');
      return;
    }

    const result = createBranchSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setLoading(true);
    try {
      const res = await dispatch(createBranch(form)).unwrap();

      if ((res as any).managerPassword) {
        setTempPass((res as any).managerPassword);
      } else {
        toast.success('Branch created successfully');
        router.push('/dashboard/branches');
      }
    } catch (err: any) {
      toast.error(err ?? 'Failed to create branch');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div ref={containerRef} className="mx-auto max-w-2xl space-y-8 pb-10">
      <div className="reveal flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="h-10 w-10 rounded-xl p-0 hover:bg-muted"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Branch</h1>
          <p className="text-muted-foreground text-sm font-medium">
            Add a new location and assign a manager
          </p>
        </div>
      </div>

      <Card className="reveal overflow-hidden border-none bg-surface shadow-xl">
        <CardHeader className="bg-primary/5 border-primary/10 border-b p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <Store size={20} />
            </div>
            <div>
              <CardTitle className="text-lg">Target Restaurant</CardTitle>
              <p className="text-muted-foreground text-xs font-medium">
                Which restaurant does this branch belong to?
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Select Restaurant</label>
            <Select
              value={form.restaurantId}
              onValueChange={update('restaurantId')}
              options={restaurants.map((r) => ({ label: r.name, value: r.id }))}
              placeholder={restLoading ? 'Loading restaurants...' : 'Choose a restaurant'}
              className="h-12"
            />
          </div>
        </CardContent>

        <Divider />

        <CardHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <MapPin size={20} />
            </div>
            <div>
              <CardTitle className="text-lg">Location Details</CardTitle>
              <p className="text-muted-foreground text-xs font-medium">
                Enter the basic info for your new branch
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <form onSubmit={handleCreate} className="space-y-8">
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

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Divider className="flex-1" />
                <span className="text-muted-foreground/60 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em]">
                  Branch Manager Setup
                </span>
                <Divider className="flex-1" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Manager Full Name"
                  placeholder="e.g. Kofi Mensah"
                  value={form.managerName}
                  onValueChange={update('managerName')}
                  startContent={<User size={18} className="text-muted-foreground" />}
                  className="h-12"
                />
                <Input
                  label="Manager Email"
                  placeholder="kofi@example.com"
                  value={form.managerEmail}
                  onValueChange={update('managerEmail')}
                  startContent={<Mail size={18} className="text-muted-foreground" />}
                  className="h-12"
                />
              </div>
              <p className="text-muted-foreground text-[10px] font-medium italic">
                * We will create a manager account with a temporary password for this branch.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button
                type="button"
                variant="muted"
                className="h-12 flex-1 rounded-xl font-bold"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="shadow-primary/20 h-12 flex-1 rounded-xl font-bold shadow-lg"
                startContent={!loading && <Check size={18} />}
              >
                Create Branch
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* SUCCESS MODAL WITH PASSWORD */}
      <Modal open={!!tempPass} onOpenChange={() => {}}>
        <ModalContent className="sm:max-w-md">
          <ModalHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <Check className="text-success" size={24} />
            </div>
            <ModalTitle className="text-center text-xl">Branch Created!</ModalTitle>
          </ModalHeader>
          <div className="space-y-6 py-4 text-center">
            <p className="text-muted-foreground px-4 text-sm font-medium">
              The branch has been setup successfully. Share these login credentials with{' '}
              <span className="font-bold text-foreground">{form.managerName}</span>.
            </p>

            <div className="space-y-3 px-4">
              <div className="group relative space-y-1 rounded-2xl border border-border bg-muted/50 p-4 text-left">
                <p className="text-muted-foreground text-[10px] font-bold uppercase">
                  Email Address
                </p>
                <p className="text-sm font-bold text-foreground">{form.managerEmail}</p>
                <button
                  onClick={() => copyToClipboard(form.managerEmail)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 transition-colors hover:bg-background"
                >
                  <Copy size={14} className="text-muted-foreground" />
                </button>
              </div>

              <div className="bg-primary/5 border-primary/10 group relative space-y-1 rounded-2xl border p-4 text-left">
                <p className="text-primary/60 text-[10px] font-bold uppercase">
                  Temporary Password
                </p>
                <p className="text-primary font-mono text-lg font-bold tracking-wider">
                  {tempPass}
                </p>
                <button
                  onClick={() => tempPass && copyToClipboard(tempPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 transition-colors hover:bg-white/50"
                >
                  <Copy size={16} className="text-primary" />
                </button>
              </div>
            </div>

            <div className="mx-4 rounded-xl border border-orange-500/10 bg-orange-500/5 p-4">
              <p className="text-[11px] font-bold leading-relaxed text-orange-600">
                IMPORTANT: This password is only shown once. Please copy it now. The manager will be
                asked to change it upon login.
              </p>
            </div>
          </div>
          <ModalFooter>
            <Button
              className="h-12 w-full rounded-xl font-bold"
              onClick={() => router.push('/dashboard/branches')}
            >
              Done, go to locations
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
