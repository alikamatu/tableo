'use client';

import * as React from 'react';
import { useEffect, useRef, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import {
  Store,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  MapPin,
  Phone,
  Mail,
  Clock,
  CreditCard,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  AlertCircle,
  Loader2,
  Building2,
  Banknote,
  Upload,
  User,
  ShieldCheck,
  Settings2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

import { useAppDispatch, useAppSelector } from '@/stores/store';
import {
  fetchRestaurants,
  updateRestaurant,
  type Restaurant,
  type RestaurantUpdatePayload,
} from '@/stores/restaurantSlice';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, useAlert } from '@/components/ui/Alert';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const CUISINE_OPTIONS = [
  'Ghanaian',
  'West African',
  'Continental',
  'Chinese',
  'Indian',
  'Italian',
  'American',
  'Fast Food',
  'Seafood',
  'Vegan',
  'BBQ',
  'Bakery',
];

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

const planBadge: Record<string, 'muted' | 'primary' | 'success'> = {
  starter: 'muted',
  pro: 'primary',
  business: 'success',
};

// ─── Zod schema (full restaurant update) ─────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(120),
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only.'),
  tagline: z.string().max(160).optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  coverUrl: z.string().url().optional().or(z.literal('')),
  // Contact
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Enter a valid email.').optional().or(z.literal('')),
  website: z.string().url('Enter a full URL (https://…)').optional().or(z.literal('')),
  // Social
  instagramHandle: z.string().max(60).optional().or(z.literal('')),
  twitterHandle: z.string().max(60).optional().or(z.literal('')),
  facebookHandle: z.string().max(100).optional().or(z.literal('')),
  tiktokHandle: z.string().max(60).optional().or(z.literal('')),
  // Location
  address: z.string().max(300).optional().or(z.literal('')),
  city: z.string().max(80).optional().or(z.literal('')),
  country: z.string().max(80).optional().or(z.literal('')),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter code (e.g. GHS)')
    .optional()
    .or(z.literal('')),
  // Paystack
  paystackPublicKey: z
    .string()
    .startsWith('pk_', 'Must start with pk_')
    .optional()
    .or(z.literal('')),
  paystackSecretKey: z
    .string()
    .startsWith('sk_', 'Must start with sk_')
    .optional()
    .or(z.literal('')),
  // Settlement
  settlementType: z.enum(['bank', 'momo']).optional(),
  settlementBank: z.string().max(120).optional().or(z.literal('')),
  settlementAccountNumber: z.string().max(20).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

// ─── Tabs Configuration ───────────────────────────────────────────────────────

const TABS = [
  { id: 'identity', label: 'Identity', icon: Store, desc: 'Brand name, logo and tagline' },
  { id: 'contact', label: 'Contact', icon: Globe, desc: 'Phone, email and website' },
  { id: 'social', label: 'Social', icon: Instagram, desc: 'Social media handles' },
  { id: 'location', label: 'Location', icon: MapPin, desc: 'Physical address and hours' },
  { id: 'payment', label: 'Payments', icon: CreditCard, desc: 'Paystack and banking' },
  { id: 'subscription', label: 'Subscription', icon: ShieldCheck, desc: 'Plan and features' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RestaurantsPage() {
  const dispatch = useAppDispatch();
  const { restaurants, loading, saving } = useAppSelector((s) => s.restaurant);
  const restaurant = restaurants[0] ?? null;
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  useEffect(() => {
    if (!restaurant) return;
    gsap.fromTo(
      pageRef.current,
      { opacity: 0, scale: 0.98, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'expo.out' },
    );
  }, [!!restaurant]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-brand" />
          <p className="text-sm font-medium text-muted">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/20 text-muted">
          <Store size={32} />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-bold text-fg">No restaurant found</p>
          <p className="max-w-xs text-sm text-muted">
            Complete onboarding to set up your restaurant profile and start taking orders.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Restaurant Settings"
          description="Refine your brand, manage operations, and configure payments."
        />
        <div className="hidden gap-2 sm:flex">
          <Badge
            variant="outline"
            className="h-8 px-3 text-[10px] font-black uppercase tracking-wider"
          >
            Status: {restaurant.subStatus}
          </Badge>
          <Badge
            variant="primary"
            className="h-8 px-3 text-[10px] font-black uppercase tracking-wider"
          >
            {restaurant.plan} Plan
          </Badge>
        </div>
      </div>

      <RestaurantEditor restaurant={restaurant} saving={saving} />
    </div>
  );
}

// ─── Main editor ──────────────────────────────────────────────────────────────

function RestaurantEditor({ restaurant, saving }: { restaurant: Restaurant; saving: boolean }) {
  const dispatch = useAppDispatch();
  const { show, node: alertNode } = useAlert();
  const [activeTab, setActiveTab] = useState('identity');
  const [showSecretKey, setShowSecretKey] = React.useState(false);
  const [logoUploading, setLogoUploading] = React.useState(false);
  const [coverUploading, setCoverUploading] = React.useState(false);
  const [cuisineList, setCuisineList] = React.useState<string[]>(restaurant.cuisine ?? []);
  const [hours, setHours] = React.useState(
    restaurant.openingHours ?? {
      mon: { open: '08:00', close: '22:00', closed: false },
      tue: { open: '08:00', close: '22:00', closed: false },
      wed: { open: '08:00', close: '22:00', closed: false },
      thu: { open: '08:00', close: '22:00', closed: false },
      fri: { open: '08:00', close: '22:00', closed: false },
      sat: { open: '09:00', close: '23:00', closed: false },
      sun: { open: '10:00', close: '21:00', closed: false },
    },
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: restaurant.name,
      slug: restaurant.slug,
      tagline: restaurant.tagline ?? '',
      description: restaurant.description ?? '',
      logoUrl: restaurant.logoUrl ?? '',
      coverUrl: restaurant.coverUrl ?? '',
      phone: restaurant.phone ?? '',
      email: restaurant.email ?? '',
      website: restaurant.website ?? '',
      instagramHandle: restaurant.instagramHandle ?? '',
      twitterHandle: restaurant.twitterHandle ?? '',
      facebookHandle: restaurant.facebookHandle ?? '',
      tiktokHandle: restaurant.tiktokHandle ?? '',
      address: restaurant.address ?? '',
      city: restaurant.city ?? '',
      country: restaurant.country ?? 'Ghana',
      currency: restaurant.currency ?? 'GHS',
      paystackPublicKey: restaurant.paystackPublicKey ?? '',
      paystackSecretKey: '',
      settlementType: (restaurant.settlementType as 'bank' | 'momo') ?? undefined,
      settlementBank: restaurant.settlementBank ?? '',
      settlementAccountNumber: restaurant.settlementAccountNumber ?? '',
    },
  });

  const onSubmit = useCallback(
    async (values: FormValues) => {
      const payload: RestaurantUpdatePayload & { id: string } = {
        id: restaurant.id,
        ...values,
        cuisine: cuisineList,
        openingHours: hours,
      };
      if (!payload.paystackSecretKey) delete payload.paystackSecretKey;

      const nullableFields: (keyof typeof payload)[] = [
        'tagline',
        'description',
        'logoUrl',
        'coverUrl',
        'phone',
        'email',
        'website',
        'instagramHandle',
        'twitterHandle',
        'facebookHandle',
        'tiktokHandle',
        'address',
        'city',
        'paystackPublicKey',
        'settlementType',
        'settlementBank',
        'settlementAccountNumber',
      ];
      for (const key of nullableFields) {
        if ((payload as Record<string, unknown>)[key] === '') {
          (payload as Record<string, unknown>)[key] = null;
        }
      }

      if (payload.currency === '') payload.currency = 'GHS';
      if (payload.country === '') payload.country = 'Ghana';

      const result = await dispatch(updateRestaurant(payload));
      if (updateRestaurant.fulfilled.match(result)) {
        toast.success('Restaurant updated successfully.');
        reset(values);
      } else {
        const err = result.payload as { message: string } | undefined;
        toast.error(err?.message ?? 'Failed to save changes.');
      }
    },
    [dispatch, restaurant.id, cuisineList, hours, reset],
  );

  const toggleCuisine = (c: string) =>
    setCuisineList((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const updateHours = (day: string, field: string, value: string | boolean) =>
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day]!, [field]: value },
    }));

  const menuUrl = `https://tableo.app/menu/${restaurant.slug}`;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Sidebar Navigation */}
      <aside className="lg:col-span-3">
        <div className="sticky top-24 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'group flex w-full flex-col items-start gap-0.5 rounded-xl px-4 py-3 text-left transition-all duration-200',
                  isActive
                    ? 'bg-brand text-white shadow-lg shadow-brand/20'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={cn(
                      isActive ? 'text-white' : 'text-muted-foreground group-hover:text-brand',
                    )}
                  />
                  <span className="text-sm font-bold tracking-tight">{tab.label}</span>
                </div>
                <span
                  className={cn(
                    'ml-7 text-[10px] font-medium leading-tight opacity-70',
                    isActive ? 'text-white/80' : 'text-muted-foreground',
                  )}
                >
                  {tab.desc}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:col-span-9">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Identity Section */}
              {activeTab === 'identity' && (
                <div className="space-y-6">
                  <HeroCard restaurant={restaurant} />

                  <GlassCard title="Brand Identity" icon={Store}>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <FieldInput
                        label="Restaurant name *"
                        error={errors.name?.message}
                        {...register('name')}
                      />
                      <div className="space-y-1.5">
                        <label className="text-muted-foreground block text-xs font-black uppercase tracking-widest">
                          Menu URL slug *
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted">
                            /menu/
                          </span>
                          <input
                            className={cn(
                              'h-11 w-full rounded-xl border border-border/50 bg-muted/30 pl-14 pr-3 text-sm font-medium text-fg',
                              'outline-none transition-all focus:bg-surface focus:ring-2 focus:ring-brand/40',
                              errors.slug && 'ring-2 ring-danger/50',
                            )}
                            {...register('slug')}
                          />
                        </div>
                        <div className="mt-2 flex items-center gap-3 px-1">
                          <a
                            href={menuUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-black uppercase tracking-wider text-brand hover:underline"
                          >
                            Open Menu <ExternalLink size={10} className="ml-1 inline" />
                          </a>
                          <CopyButton text={menuUrl} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-6">
                      <FieldInput
                        label="Tagline"
                        placeholder="A short one-liner for your menu page"
                        error={errors.tagline?.message}
                        {...register('tagline')}
                      />
                      <div className="space-y-1.5">
                        <label className="text-muted-foreground block text-xs font-black uppercase tracking-widest">
                          Description
                        </label>
                        <textarea
                          className="h-32 w-full resize-none rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-sm font-medium text-fg outline-none transition-all focus:bg-surface focus:ring-2 focus:ring-brand/40"
                          placeholder="Tell your story..."
                          {...register('description')}
                        />
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard title="Visuals" icon={Upload}>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {/* Logo Upload */}
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                          Logo
                        </p>
                        <div
                          onClick={() => document.getElementById('logo-upload')?.click()}
                          className="group relative flex aspect-square w-32 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-border transition-all hover:border-brand/50 hover:bg-brand/5"
                        >
                          {logoUploading ? (
                            <Loader2 size={24} className="animate-spin text-brand" />
                          ) : watch('logoUrl') ? (
                            <img
                              src={watch('logoUrl')}
                              className="h-full w-full rounded-2xl object-contain p-2"
                              alt="logo"
                            />
                          ) : (
                            <div className="text-muted-foreground flex flex-col items-center gap-2 group-hover:text-brand">
                              <Upload size={20} />
                              <span className="text-[10px] font-bold">UPLOAD</span>
                            </div>
                          )}
                          <input
                            id="logo-upload"
                            type="file"
                            className="hidden"
                            onChange={(e) => handleUpload(e, 'logos', 'logoUrl')}
                          />
                        </div>
                      </div>

                      {/* Cover Upload */}
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                          Cover Image
                        </p>
                        <div
                          onClick={() => document.getElementById('cover-upload')?.click()}
                          className="group relative flex h-32 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-border transition-all hover:border-brand/50 hover:bg-brand/5"
                        >
                          {coverUploading ? (
                            <Loader2 size={24} className="animate-spin text-brand" />
                          ) : watch('coverUrl') ? (
                            <img
                              src={watch('coverUrl')}
                              className="h-full w-full rounded-2xl object-cover"
                              alt="cover"
                            />
                          ) : (
                            <div className="text-muted-foreground flex flex-col items-center gap-2 group-hover:text-brand">
                              <Upload size={20} />
                              <span className="text-[10px] font-bold">UPLOAD COVER</span>
                            </div>
                          )}
                          <input
                            id="cover-upload"
                            type="file"
                            className="hidden"
                            onChange={(e) => handleUpload(e, 'covers', 'coverUrl')}
                          />
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard title="Cuisine" icon={Store}>
                    <div className="flex flex-wrap gap-2">
                      {CUISINE_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleCuisine(c)}
                          className={cn(
                            'rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200',
                            cuisineList.includes(c)
                              ? 'translate-y-[-1px] bg-brand text-white shadow-md shadow-brand/20'
                              : 'text-muted-foreground bg-muted/50 hover:bg-muted hover:text-foreground',
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && (
                <GlassCard title="Contact Information" icon={Globe}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FieldInput
                      label="Phone"
                      type="tel"
                      placeholder="+233..."
                      startIcon={<Phone size={16} />}
                      {...register('phone')}
                    />
                    <FieldInput
                      label="Email"
                      type="email"
                      placeholder="hello@restaurant.com"
                      startIcon={<Mail size={16} />}
                      {...register('email')}
                    />
                    <div className="sm:col-span-2">
                      <FieldInput
                        label="Website"
                        type="url"
                        placeholder="https://..."
                        startIcon={<Globe size={16} />}
                        {...register('website')}
                      />
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Social Tab */}
              {activeTab === 'social' && (
                <GlassCard title="Social Presence" icon={Instagram}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FieldInput
                      label="Instagram"
                      placeholder="username"
                      startIcon={<Instagram size={16} />}
                      hint="Handle without @"
                      {...register('instagramHandle')}
                    />
                    <FieldInput
                      label="Twitter / X"
                      placeholder="username"
                      startIcon={<Twitter size={16} />}
                      hint="Handle without @"
                      {...register('twitterHandle')}
                    />
                    <FieldInput
                      label="Facebook"
                      placeholder="page_name"
                      startIcon={<Facebook size={16} />}
                      {...register('facebookHandle')}
                    />
                    <FieldInput
                      label="TikTok"
                      placeholder="username"
                      startIcon={<Building2 size={16} />}
                      {...register('tiktokHandle')}
                    />
                  </div>
                </GlassCard>
              )}

              {/* Location Tab */}
              {activeTab === 'location' && (
                <div className="space-y-6">
                  <GlassCard title="Physical Address" icon={MapPin}>
                    <div className="space-y-6">
                      <FieldInput
                        label="Street Address"
                        placeholder="123 Osu, Accra..."
                        startIcon={<MapPin size={16} />}
                        {...register('address')}
                      />
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <FieldInput label="City" placeholder="Accra" {...register('city')} />
                        <FieldInput label="Country" placeholder="Ghana" {...register('country')} />
                        <FieldInput label="Currency" placeholder="GHS" {...register('currency')} />
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard title="Operating Hours" icon={Clock}>
                    <div className="divide-y divide-border/30 overflow-hidden rounded-2xl border border-border/50 bg-muted/20">
                      {DAYS.map((day) => {
                        const h = hours[day] || { open: '08:00', close: '22:00', closed: false };
                        return (
                          <div key={day} className="flex items-center justify-between px-5 py-4">
                            <span className="text-muted-foreground w-12 text-xs font-black uppercase tracking-wider">
                              {day}
                            </span>
                            {h.closed ? (
                              <span className="text-[10px] font-black uppercase text-danger/60">
                                Closed for business
                              </span>
                            ) : (
                              <div className="flex items-center gap-3">
                                <input
                                  type="time"
                                  value={h.open}
                                  onChange={(e) => updateHours(day, 'open', e.target.value)}
                                  className="h-9 w-24 rounded-lg border border-border/50 bg-surface px-3 text-xs font-bold"
                                />
                                <span className="text-xs text-muted">to</span>
                                <input
                                  type="time"
                                  value={h.close}
                                  onChange={(e) => updateHours(day, 'close', e.target.value)}
                                  className="h-9 w-24 rounded-lg border border-border/50 bg-surface px-3 text-xs font-bold"
                                />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => updateHours(day, 'closed', !h.closed)}
                              className={cn(
                                'h-8 rounded-lg px-4 text-[10px] font-black uppercase tracking-widest transition-all',
                                h.closed
                                  ? 'text-success-foreground bg-success'
                                  : 'text-muted-foreground bg-muted',
                              )}
                            >
                              {h.closed ? 'Open' : 'Close'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <GlassCard title="Paystack Integration" icon={CreditCard}>
                    <Alert
                      variant="info"
                      message="Keys are encrypted. Only enter if you wish to update."
                      className="mb-6"
                    />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <FieldInput
                        label="Public Key"
                        placeholder="pk_test_..."
                        startIcon={<CreditCard size={16} />}
                        {...register('paystackPublicKey')}
                      />
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-muted-foreground text-xs font-black uppercase tracking-widest">
                            Secret Key
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowSecretKey(!showSecretKey)}
                            className="text-[10px] font-bold uppercase text-brand underline"
                          >
                            {showSecretKey ? 'Hide' : 'Reveal'}
                          </button>
                        </div>
                        <input
                          type={showSecretKey ? 'text' : 'password'}
                          placeholder="sk_test_..."
                          className="h-11 w-full rounded-xl border border-border/50 bg-muted/30 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-brand/40"
                          {...register('paystackSecretKey')}
                        />
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard title="Payout Settings" icon={Banknote}>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="text-muted-foreground text-xs font-black uppercase tracking-widest">
                          Type
                        </label>
                        <select
                          className="h-11 w-full rounded-xl border border-border/50 bg-muted/30 px-3 text-sm font-bold outline-none"
                          {...register('settlementType')}
                        >
                          <option value="">Select</option>
                          <option value="bank">Bank</option>
                          <option value="momo">MoMo</option>
                        </select>
                      </div>
                      <FieldInput
                        label="Provider"
                        placeholder="GCB / MTN"
                        {...register('settlementBank')}
                      />
                      <FieldInput
                        label="Account #"
                        placeholder="020..."
                        {...register('settlementAccountNumber')}
                      />
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <GlassCard title="Plan & Billing" icon={ShieldCheck}>
                  <SubscriptionPanel restaurant={restaurant} />
                </GlassCard>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom Save Action */}
          <div className="flex items-center justify-end border-t border-border pt-6">
            <Button
              type="submit"
              size="lg"
              loading={saving}
              className="h-14 rounded-2xl px-10 text-xs font-black uppercase tracking-widest shadow-xl shadow-brand/20"
            >
              <Check size={18} className="mr-2" /> Save Settings
            </Button>
          </div>
        </form>
      </main>

      {/* Floating Save Bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 z-50 flex w-[90%] max-w-md -translate-x-1/2 items-center justify-between gap-4 rounded-3xl bg-fg px-6 py-4 text-bg shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-brand">
                <AlertCircle size={18} />
              </div>
              <span className="text-sm font-bold">Unsaved changes</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => reset()}
                className="text-xs font-bold opacity-60 hover:opacity-100"
              >
                Discard
              </button>
              <Button
                size="sm"
                loading={saving}
                onClick={handleSubmit(onSubmit)}
                className="h-9 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-fg hover:bg-white/90"
              >
                Save
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    folder: string,
    field: 'logoUrl' | 'coverUrl',
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'logoUrl') setLogoUploading(true);
    else setCoverUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', `tableo/${folder}`);
      const res = await api.post('/uploads/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.url || res.data?.data?.url;
      if (url) setValue(field, url, { shouldDirty: true });
    } catch {
      toast.error('Upload failed.');
    } finally {
      if (field === 'logoUrl') setLogoUploading(false);
      else setCoverUploading(false);
    }
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function HeroCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface shadow-sm">
      <div
        className="h-40 w-full bg-muted/20 bg-cover bg-center"
        style={restaurant.coverUrl ? { backgroundImage: `url(${restaurant.coverUrl})` } : {}}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="relative px-6 pb-6">
        <div className="-mt-12 flex items-end justify-between">
          <div className="flex items-end gap-5">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-[6px] border-surface bg-white shadow-xl shadow-black/10">
              {restaurant.logoUrl ? (
                <img
                  src={restaurant.logoUrl}
                  className="h-full w-full object-contain p-2"
                  alt="logo"
                />
              ) : (
                <Store size={32} className="text-muted" />
              )}
            </div>
            <div className="pb-2">
              <h2 className="text-2xl font-black tracking-tight text-white">{restaurant.name}</h2>
              <p className="text-xs font-medium text-white/70">@{restaurant.slug}</p>
            </div>
          </div>
          <div className="pb-2">
            <Badge
              variant={planBadge[restaurant.plan] ?? 'muted'}
              className="h-7 px-4 text-[10px] font-black uppercase tracking-widest"
            >
              {restaurant.plan}
            </Badge>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border/50 pt-6">
          {[
            { label: 'Branches', value: restaurant._count?.branches ?? 0, icon: MapPin },
            {
              label: 'Menu Items',
              value: restaurant._count?.menuItems ?? 0,
              icon: UtensilsCrossed,
            },
            { label: 'Status', value: restaurant.subStatus, icon: ShieldCheck },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <stat.icon size={12} className="text-muted-foreground" />
              <span className="text-xs font-black capitalize text-fg">{stat.value}</span>
              <span className="text-muted-foreground text-[9px] font-bold uppercase tracking-tighter">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GlassCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/50 bg-surface/50 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Icon size={18} />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-fg">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SubscriptionPanel({ restaurant }: { restaurant: Restaurant }) {
  const features: Record<string, string[]> = {
    starter: ['1 branch', 'Digital menu + QR', 'Up to 60 items'],
    pro: ['Up to 3 branches', 'Online ordering + Paystack', 'Live orders', 'Analytics'],
    business: [
      'Unlimited branches',
      'Staff permissions',
      'Cross-branch analytics',
      'Custom domain',
    ],
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-lg font-black capitalize text-fg">{restaurant.plan} Plan</p>
          <div className="flex items-center gap-2">
            <Badge variant={restaurant.subStatus === 'active' ? 'success' : 'danger'}>
              {restaurant.subStatus}
            </Badge>
            {restaurant.subExpiresAt && (
              <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                Renews {new Date(restaurant.subExpiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        {restaurant.plan !== 'business' && (
          <Button variant="secondary" className="rounded-xl px-6 font-bold">
            Upgrade
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(features[restaurant.plan] ?? []).map((f) => (
          <div
            key={f}
            className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/30 p-4"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20 text-success">
              <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-xs font-bold text-fg">{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const FieldInput = React.forwardRef<HTMLInputElement, any>(
  ({ label, error, hint, startIcon, className, ...props }, ref) => (
    <div className="space-y-2">
      {label && (
        <label className="text-muted-foreground block px-1 text-xs font-black uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="relative">
        {startIcon && (
          <span className="text-muted-foreground pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 opacity-50">
            {startIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'h-12 w-full rounded-2xl border border-border/50 bg-muted/30 px-4 text-sm font-medium text-fg transition-all placeholder:text-muted/60',
            'shadow-inner-sm outline-none focus:bg-surface focus:ring-2 focus:ring-brand/40',
            'disabled:cursor-not-allowed disabled:opacity-40',
            startIcon && 'pl-11',
            error && 'border-danger/20 ring-2 ring-danger/50',
            className,
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="px-1 text-[10px] font-bold uppercase tracking-tighter text-danger">{error}</p>
      )}
      {hint && !error && (
        <p className="text-muted-foreground px-1 text-[10px] font-bold uppercase tracking-tight opacity-70">
          {hint}
        </p>
      )}
    </div>
  ),
);
FieldInput.displayName = 'FieldInput';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors hover:text-fg"
    >
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy link'}
    </button>
  );
}

function UtensilsCrossed(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 2 1.41 1.41L12 11l7.59-7.59L21 2" />
      <path d="m9 9 5.88 5.88" />
      <path d="M19 15v7" />
      <path d="M15 19h7" />
    </svg>
  );
}
