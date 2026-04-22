'use client';

import * as React from 'react';
import { useEffect, useRef, useCallback } from 'react';
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
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' },
    );
  }, [!!restaurant]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={22} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Store size={32} className="text-muted" />
        <p className="text-sm font-medium text-fg">No restaurant found</p>
        <p className="max-w-xs text-sm text-muted">
          Complete onboarding to set up your restaurant profile.
        </p>
      </div>
    );
  }

  return (
    <div ref={pageRef}>
      <PageHeader
        title="Restaurant"
        description="Manage your restaurant profile, contact info, and payment settings."
      />
      <RestaurantEditor restaurant={restaurant} saving={saving} />
    </div>
  );
}

// ─── Main editor ──────────────────────────────────────────────────────────────

function RestaurantEditor({ restaurant, saving }: { restaurant: Restaurant; saving: boolean }) {
  const dispatch = useAppDispatch();
  const { show, node: alertNode } = useAlert();
  const [expandedSection, setExpandedSection] = React.useState<string | null>('identity');
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
      // Don't send empty secret key — would overwrite with blank
      if (!payload.paystackSecretKey) delete payload.paystackSecretKey;

      // Convert empty strings to null for optional formatted fields to bypass backend validation
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

      // These fields cannot be null in the DB, fallback to defaults if empty
      if (payload.currency === '') payload.currency = 'GHS';
      if (payload.country === '') payload.country = 'Ghana';

      const result = await dispatch(updateRestaurant(payload));
      if (updateRestaurant.fulfilled.match(result)) {
        show('success', 'Restaurant updated successfully.');
        reset(values); // reset dirty state
      } else {
        const err = result.payload as { message: string } | undefined;
        show('error', err?.message ?? 'Failed to save changes. Please try again.');
      }
    },
    [dispatch, restaurant.id, cuisineList, hours, show, reset],
  );

  const toggleSection = (id: string) => setExpandedSection((prev) => (prev === id ? null : id));

  const toggleCuisine = (c: string) =>
    setCuisineList((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const updateHours = (day: string, field: string, value: string | boolean) =>
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day]!, [field]: value },
    }));

  const menuUrl = `https://tableo.app/menu/${restaurant.slug}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-3">
      {/* Sticky save bar */}
      {(isDirty || cuisineList.join() !== (restaurant.cuisine ?? []).join()) && (
        <StickyBar
          saving={saving}
          onDiscard={() => {
            reset();
            setCuisineList(restaurant.cuisine ?? []);
            setHours(restaurant.openingHours ?? hours);
          }}
        />
      )}

      {alertNode}

      {/* ── Hero card: logo + name + plan ───────────────────────────── */}
      <HeroCard restaurant={restaurant} />

      {/* ── Sections ───────────────────────────────────────────────── */}

      <Section
        id="identity"
        title="Identity"
        icon={Store}
        expanded={expandedSection === 'identity'}
        onToggle={() => toggleSection('identity')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldInput
              label="Restaurant name *"
              error={errors.name?.message}
              {...register('name')}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-fg">Menu URL slug *</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                  /menu/
                </span>
                <input
                  className={cn(
                    'h-10 w-full rounded-md bg-subtle pl-14 pr-3 text-sm text-fg',
                    'outline-none transition-all focus:bg-surface focus:ring-2 focus:ring-brand/40',
                    errors.slug && 'ring-2 ring-danger/50',
                  )}
                  {...register('slug')}
                />
              </div>
              {errors.slug && <p className="text-xs text-danger">{errors.slug.message}</p>}
              <div className="mt-1 flex items-center gap-2">
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-brand hover:underline"
                >
                  {menuUrl} <ExternalLink size={10} />
                </a>
                <CopyButton text={menuUrl} />
              </div>
            </div>
          </div>

          <FieldInput
            label="Tagline"
            placeholder="A short one-liner shown on your menu page"
            error={errors.tagline?.message}
            {...register('tagline')}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-fg">Description</label>
            <textarea
              className="h-24 w-full resize-none rounded-md bg-subtle px-3 py-2.5 text-sm text-fg outline-none transition-all placeholder:text-muted focus:bg-surface focus:ring-2 focus:ring-brand/40"
              placeholder="What makes your restaurant special?"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Logo upload */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-fg">Logo</label>
              <div
                className="relative flex h-24 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-border text-muted transition-colors hover:border-brand/40 hover:text-brand"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                {logoUploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin text-brand" />
                    <span className="text-xs">Uploading…</span>
                  </>
                ) : watch('logoUrl') ? (
                  <img
                    src={watch('logoUrl')}
                    alt="logo"
                    className="h-16 w-16 rounded-lg object-contain"
                  />
                ) : (
                  <>
                    <Upload size={20} />
                    <span className="text-xs">Upload logo</span>
                  </>
                )}
                <input
                  id="logo-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif,.heic,.heif,.svg,.tiff,.bmp,.avif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setLogoUploading(true);
                    try {
                      const fd = new FormData();
                      fd.append('file', file);
                      fd.append('folder', 'tableo/logos');
                      const res = await api.post('/uploads/image', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      const url = res.data?.url || res.data?.data?.url;
                      if (url) {
                        setValue('logoUrl', url, { shouldDirty: true });
                      }
                    } catch {
                      show('error', 'Logo upload failed. Try again.');
                    } finally {
                      setLogoUploading(false);
                    }
                  }}
                />
              </div>
              {watch('logoUrl') && (
                <button
                  type="button"
                  onClick={() => setValue('logoUrl', '', { shouldDirty: true })}
                  className="text-xs text-danger hover:underline"
                >
                  Remove logo
                </button>
              )}
            </div>

            {/* Cover upload */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-fg">Cover image</label>
              <div
                className="relative flex h-24 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-border text-muted transition-colors hover:border-brand/40 hover:text-brand"
                onClick={() => document.getElementById('cover-upload')?.click()}
              >
                {coverUploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin text-brand" />
                    <span className="text-xs">Uploading…</span>
                  </>
                ) : watch('coverUrl') ? (
                  <img
                    src={watch('coverUrl')}
                    alt="cover"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <>
                    <Upload size={20} />
                    <span className="text-xs">Upload cover</span>
                  </>
                )}
                <input
                  id="cover-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif,.heic,.heif,.svg,.tiff,.bmp,.avif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setCoverUploading(true);
                    try {
                      const fd = new FormData();
                      fd.append('file', file);
                      fd.append('folder', 'tableo/covers');
                      const res = await api.post('/uploads/image', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      const url = res.data?.url || res.data?.data?.url;
                      if (url) {
                        setValue('coverUrl', url, { shouldDirty: true });
                      }
                    } catch {
                      show('error', 'Cover upload failed. Try again.');
                    } finally {
                      setCoverUploading(false);
                    }
                  }}
                />
              </div>
              {watch('coverUrl') && (
                <button
                  type="button"
                  onClick={() => setValue('coverUrl', '', { shouldDirty: true })}
                  className="text-xs text-danger hover:underline"
                >
                  Remove cover
                </button>
              )}
            </div>
          </div>

          {/* Cuisine */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-fg">Cuisine type</label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCuisine(c)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
                    cuisineList.includes(c)
                      ? 'bg-brand text-white'
                      : 'bg-subtle text-muted hover:text-fg',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="contact"
        title="Contact & website"
        icon={Globe}
        expanded={expandedSection === 'contact'}
        onToggle={() => toggleSection('contact')}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput
            label="Phone"
            type="tel"
            placeholder="+233 20 000 0000"
            startIcon={<Phone size={14} />}
            error={errors.phone?.message}
            {...register('phone')}
          />
          <FieldInput
            label="Email"
            type="email"
            placeholder="info@yourrestaurant.com"
            startIcon={<Mail size={14} />}
            error={errors.email?.message}
            {...register('email')}
          />
          <div className="sm:col-span-2">
            <FieldInput
              label="Website"
              type="url"
              placeholder="https://yourrestaurant.com"
              startIcon={<Globe size={14} />}
              error={errors.website?.message}
              {...register('website')}
            />
          </div>
        </div>
      </Section>

      <Section
        id="social"
        title="Social media"
        icon={Instagram}
        expanded={expandedSection === 'social'}
        onToggle={() => toggleSection('social')}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput
            label="Instagram"
            placeholder="yourrestaurant"
            startIcon={<Instagram size={14} />}
            hint="Without the @"
            error={errors.instagramHandle?.message}
            {...register('instagramHandle')}
          />
          <FieldInput
            label="X / Twitter"
            placeholder="yourrestaurant"
            startIcon={<Twitter size={14} />}
            hint="Without the @"
            error={errors.twitterHandle?.message}
            {...register('twitterHandle')}
          />
          <FieldInput
            label="Facebook"
            placeholder="yourrestaurantpage"
            startIcon={<Facebook size={14} />}
            hint="Page name or full URL"
            error={errors.facebookHandle?.message}
            {...register('facebookHandle')}
          />
          <FieldInput
            label="TikTok"
            placeholder="yourrestaurant"
            startIcon={
              <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
              </svg>
            }
            hint="Without the @"
            error={errors.tiktokHandle?.message}
            {...register('tiktokHandle')}
          />
        </div>
      </Section>

      <Section
        id="location"
        title="Location & hours"
        icon={MapPin}
        expanded={expandedSection === 'location'}
        onToggle={() => toggleSection('location')}
      >
        <div className="space-y-4">
          <FieldInput
            label="Street address"
            placeholder="123 Oxford Street, Osu"
            startIcon={<MapPin size={14} />}
            {...register('address')}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FieldInput label="City" placeholder="Accra" {...register('city')} />
            <FieldInput label="Country" placeholder="Ghana" {...register('country')} />
            <FieldInput
              label="Currency"
              placeholder="GHS"
              hint="3-letter ISO code"
              error={errors.currency?.message}
              {...register('currency')}
            />
          </div>

          {/* Opening hours */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-muted" />
              <label className="text-sm font-medium text-fg">Opening hours</label>
            </div>
            <div className="divide-y divide-border overflow-hidden rounded-xl bg-subtle">
              {DAYS.map((day) => {
                const h = hours[day] ?? { open: '08:00', close: '22:00', closed: false };
                return (
                  <div key={day} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="w-9 flex-shrink-0 text-xs font-medium text-fg">
                      {DAY_LABELS[day]?.slice(0, 3)}
                    </span>
                    {h.closed ? (
                      <span className="flex-1 text-xs text-muted">Closed</span>
                    ) : (
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="time"
                          value={h.open}
                          onChange={(e) => updateHours(day, 'open', e.target.value)}
                          className="h-7 rounded-md bg-bg px-2 text-xs text-fg outline-none focus:ring-1 focus:ring-brand/40"
                        />
                        <span className="text-xs text-muted">–</span>
                        <input
                          type="time"
                          value={h.close}
                          onChange={(e) => updateHours(day, 'close', e.target.value)}
                          className="h-7 rounded-md bg-bg px-2 text-xs text-fg outline-none focus:ring-1 focus:ring-brand/40"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => updateHours(day, 'closed', !h.closed)}
                      className={cn(
                        'flex-shrink-0 rounded-full px-2 py-0.5 text-2xs transition-colors',
                        h.closed ? 'bg-danger/10 text-danger' : 'bg-bg text-muted hover:text-fg',
                      )}
                    >
                      {h.closed ? 'Open' : 'Close'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="payment"
        title="Paystack & payments"
        icon={CreditCard}
        expanded={expandedSection === 'payment'}
        onToggle={() => toggleSection('payment')}
      >
        <div className="space-y-4">
          <Alert
            variant="info"
            message="Your secret key is stored encrypted and never returned in API responses. Enter it only when you want to update it."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldInput
              label="Public key"
              placeholder="pk_test_…"
              startIcon={<CreditCard size={14} />}
              error={errors.paystackPublicKey?.message}
              hint={restaurant.paystackPublicKey ? '✓ Set' : 'Not set'}
              {...register('paystackPublicKey')}
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-fg">Secret key</label>
                <button
                  type="button"
                  onClick={() => setShowSecretKey((p) => !p)}
                  className="text-xs text-muted transition-colors hover:text-fg"
                >
                  {showSecretKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showSecretKey ? 'text' : 'password'}
                placeholder="sk_test_… (leave blank to keep current)"
                className={cn(
                  'h-10 w-full rounded-md bg-subtle px-3 text-sm text-fg placeholder:text-muted',
                  'outline-none transition-all focus:bg-surface focus:ring-2 focus:ring-brand/40',
                  errors.paystackSecretKey && 'ring-2 ring-danger/50',
                )}
                {...register('paystackSecretKey')}
              />
              {errors.paystackSecretKey && (
                <p className="text-xs text-danger">{errors.paystackSecretKey.message}</p>
              )}
              <p className="text-xs text-muted">
                {restaurant.paystackPublicKey ? '✓ Secret key is set' : 'Not configured'}
              </p>
            </div>
          </div>

          {/* Settlement */}
          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Banknote size={15} className="text-muted" />
              <p className="text-sm font-medium text-fg">Settlement account</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-fg">Settlement type</label>
                <select
                  className="h-10 w-full appearance-none rounded-md bg-subtle px-3 text-sm text-fg outline-none transition-all focus:ring-2 focus:ring-brand/40"
                  {...register('settlementType')}
                >
                  <option value="">Select type</option>
                  <option value="bank">Bank account</option>
                  <option value="momo">Mobile money</option>
                </select>
              </div>
              <FieldInput
                label="Bank / provider"
                placeholder="e.g. GCB Bank / MTN"
                error={errors.settlementBank?.message}
                {...register('settlementBank')}
              />
              <FieldInput
                label="Account number"
                placeholder="0201234567"
                error={errors.settlementAccountNumber?.message}
                {...register('settlementAccountNumber')}
              />
            </div>
            {restaurant.paystackSubaccountCode && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <Check size={12} className="text-success" />
                Subaccount code:{' '}
                <code className="font-mono">{restaurant.paystackSubaccountCode}</code>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Subscription */}
      <Section
        id="subscription"
        title="Subscription"
        icon={Building2}
        expanded={expandedSection === 'subscription'}
        onToggle={() => toggleSection('subscription')}
      >
        <SubscriptionPanel restaurant={restaurant} />
      </Section>

      {/* Save button at bottom */}
      <div className="pt-2">
        <Button type="submit" size="lg" loading={saving} className="w-full sm:w-auto">
          <Check size={16} /> Save changes
        </Button>
      </div>
    </form>
  );
}

// ─── Hero card ────────────────────────────────────────────────────────────────

function HeroCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface">
      {/* Cover image */}
      <div
        className="relative h-28 w-full bg-subtle"
        style={
          restaurant.coverUrl
            ? {
                backgroundImage: `url(${restaurant.coverUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}
        }
      >
        {!restaurant.coverUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Store size={24} className="text-border" />
          </div>
        )}
      </div>

      {/* Logo + info */}
      <div className="px-5 pb-5">
        <div className="-mt-8 mb-4 flex items-end gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-surface bg-bg shadow-sm">
            {restaurant.logoUrl ? (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <Store size={20} className="text-muted" />
            )}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <h2 className="truncate text-base font-semibold text-fg">{restaurant.name}</h2>
            <p className="text-xs text-muted">/menu/{restaurant.slug}</p>
          </div>
          <Badge variant={planBadge[restaurant.plan] ?? 'muted'}>{restaurant.plan}</Badge>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Branches', value: restaurant._count?.branches ?? 0 },
            { label: 'Menu items', value: restaurant._count?.menuItems ?? 0 },
            { label: 'Status', value: restaurant.subStatus },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-subtle px-3 py-2">
              <p className="text-2xs text-muted">{label}</p>
              <p className="text-sm font-semibold capitalize text-fg">{value}</p>
            </div>
          ))}
        </div>

        {/* Social links row */}
        {(restaurant.instagramHandle ||
          restaurant.twitterHandle ||
          restaurant.facebookHandle ||
          restaurant.tiktokHandle ||
          restaurant.website) && (
          <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
            {restaurant.website && (
              <a
                href={restaurant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-fg"
              >
                <Globe size={15} />
              </a>
            )}
            {restaurant.instagramHandle && (
              <a
                href={`https://instagram.com/${restaurant.instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-fg"
              >
                <Instagram size={15} />
              </a>
            )}
            {restaurant.twitterHandle && (
              <a
                href={`https://x.com/${restaurant.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-fg"
              >
                <Twitter size={15} />
              </a>
            )}
            {restaurant.facebookHandle && (
              <a
                href={`https://facebook.com/${restaurant.facebookHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-fg"
              >
                <Facebook size={15} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Subscription panel ───────────────────────────────────────────────────────

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold capitalize text-fg">{restaurant.plan} plan</p>
          <p className="mt-0.5 text-xs text-muted">
            Status:{' '}
            <span
              className={cn(
                'font-medium',
                restaurant.subStatus === 'active' ? 'text-success' : 'text-danger',
              )}
            >
              {restaurant.subStatus}
            </span>
            {restaurant.subExpiresAt && (
              <span> · Renews {new Date(restaurant.subExpiresAt).toLocaleDateString()}</span>
            )}
          </p>
        </div>
        {restaurant.plan !== 'business' && (
          <Button variant="secondary" size="sm">
            Upgrade plan
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(features[restaurant.plan] ?? []).map((f) => (
          <div key={f} className="flex items-center gap-1.5 text-xs text-muted">
            <Check size={11} className="flex-shrink-0 text-success" strokeWidth={3} />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sticky save bar ──────────────────────────────────────────────────────────

function StickyBar({ saving, onDiscard }: { saving: boolean; onDiscard: () => void }) {
  return (
    <div className="sticky top-14 z-20 flex items-center justify-between gap-4 rounded-xl bg-fg px-4 py-2.5 text-bg">
      <div className="flex items-center gap-2 text-sm">
        <AlertCircle size={14} className="flex-shrink-0 text-warning" />
        Unsaved changes
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDiscard}
          className="text-xs text-bg/60 transition-colors hover:text-bg"
        >
          Discard
        </button>
        <Button
          type="submit"
          size="sm"
          loading={saving}
          className="h-7 bg-white px-3 text-xs text-fg hover:bg-white/90"
        >
          Save
        </Button>
      </div>
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  icon: React.ElementType;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bodyRef.current) return;
    if (expanded) {
      gsap.fromTo(
        bodyRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.3, ease: 'power3.out' },
      );
    } else {
      gsap.to(bodyRef.current, { height: 0, opacity: 0, duration: 0.2, ease: 'power3.in' });
    }
  }, [expanded]);

  return (
    <div className="overflow-hidden rounded-xl bg-surface">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-subtle/40"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10">
            <Icon size={14} className="text-brand" />
          </span>
          <span className="text-sm font-medium text-fg">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-muted" />
        ) : (
          <ChevronDown size={16} className="text-muted" />
        )}
      </button>

      <div ref={bodyRef} style={{ height: expanded ? 'auto' : 0, overflow: 'hidden' }}>
        <div className="px-5 pb-5 pt-1">{children}</div>
      </div>
    </div>
  );
}

// ─── Field input (thin wrapper for the raw input — avoids the old Input bugs) ─

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  startIcon?: React.ReactNode;
}

const FieldInput = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, hint, startIcon, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-fg">{label}</label>}
      <div className="relative">
        {startIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {startIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'h-10 w-full rounded-md bg-subtle px-3 text-sm text-fg placeholder:text-muted',
            'outline-none transition-all focus:bg-surface focus:ring-2 focus:ring-brand/40',
            'disabled:cursor-not-allowed disabled:opacity-40',
            startIcon && 'pl-9',
            error && 'ring-2 ring-danger/50',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  ),
);
FieldInput.displayName = 'FieldInput';

// ─── Copy button ──────────────────────────────────────────────────────────────

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
      className="text-muted transition-colors hover:text-fg"
      title="Copy URL"
    >
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
    </button>
  );
}
