'use client';

import * as React from 'react';
import { useEffect, useRef, useCallback } from 'react';
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
  ExternalLink,
  Copy,
  Loader2,
  Banknote,
  Upload,
  ShieldCheck,
  UtensilsCrossed,
  ArrowUpRight,
  Sparkles,
  Wifi,
  CircleDot,
  ChevronRight,
  Edit3,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/stores/store';
import {
  fetchRestaurants,
  updateRestaurant,
  type Restaurant,
  type RestaurantUpdatePayload,
} from '@/stores/restaurantSlice';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
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
const DAY_FULL: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

const TABS = [
  { id: 'identity', label: 'Identity', icon: Store },
  { id: 'contact', label: 'Contact', icon: Globe },
  { id: 'social', label: 'Social', icon: Instagram },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'payment', label: 'Payments', icon: CreditCard },
  { id: 'subscription', label: 'Plan', icon: ShieldCheck },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ─── Zod schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Lowercase, numbers, hyphens only.'),
  tagline: z.string().max(160).optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  coverUrl: z.string().url().optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  instagramHandle: z.string().max(60).optional().or(z.literal('')),
  twitterHandle: z.string().max(60).optional().or(z.literal('')),
  facebookHandle: z.string().max(100).optional().or(z.literal('')),
  tiktokHandle: z.string().max(60).optional().or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  city: z.string().max(80).optional().or(z.literal('')),
  country: z.string().max(80).optional().or(z.literal('')),
  currency: z.string().length(3).optional().or(z.literal('')),
  paystackPublicKey: z.string().optional().or(z.literal('')),
  paystackSecretKey: z.string().optional().or(z.literal('')),
  settlementType: z.enum(['bank', 'momo']).optional(),
  settlementBank: z.string().max(120).optional().or(z.literal('')),
  settlementAccountNumber: z.string().max(20).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

// ─── Variants for animations ──────────────────────────────────────────────────

const fadeSlide = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: 'easeOut' },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
};

const item = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RestaurantsPage() {
  const dispatch = useAppDispatch();
  const { restaurants, loading, saving } = useAppSelector((s) => s.restaurant);
  const restaurant = restaurants[0] ?? null;

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 size={20} className="animate-spin text-brand" />
          <p className="text-xs text-muted">Loading…</p>
        </motion.div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <motion.div
        {...fadeSlide}
        className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-subtle">
          <Store size={20} className="text-muted" />
        </div>
        <p className="text-sm font-medium text-fg">No restaurant found</p>
        <p className="max-w-xs text-xs text-muted">Complete onboarding to set up your profile.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <RestaurantEditor restaurant={restaurant} saving={saving} />
    </motion.div>
  );
}

// ─── Main editor ──────────────────────────────────────────────────────────────

function RestaurantEditor({ restaurant, saving }: { restaurant: Restaurant; saving: boolean }) {
  const dispatch = useAppDispatch();
  const [tab, setTab] = React.useState<TabId>('identity');
  const [showSecret, setShowSecret] = React.useState(false);
  const [logoLoading, setLogoLoading] = React.useState(false);
  const [coverLoading, setCoverLoading] = React.useState(false);
  const [cuisine, setCuisine] = React.useState<string[]>(restaurant.cuisine ?? []);
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
        cuisine,
        openingHours: hours,
      };
      if (!payload.paystackSecretKey) delete payload.paystackSecretKey;
      // Coerce empty strings to null
      (Object.keys(payload) as (keyof typeof payload)[]).forEach((k) => {
        if (payload[k] === '') (payload as Record<string, unknown>)[k] = null;
      });
      if (!payload.currency) payload.currency = 'GHS';
      if (!payload.country) payload.country = 'Ghana';

      const result = await dispatch(updateRestaurant(payload));
      if (updateRestaurant.fulfilled.match(result)) {
        toast.success('Saved');
        reset(values);
      } else {
        const err = result.payload as { message?: string } | undefined;
        toast.error(err?.message ?? 'Failed to save.');
      }
    },
    [dispatch, restaurant.id, cuisine, hours, reset],
  );

  const toggleCuisine = (c: string) =>
    setCuisine((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const updateHour = (day: string, field: string, val: string | boolean) =>
    setHours((p) => ({ ...p, [day]: { ...p[day]!, [field]: val } }));

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'coverUrl',
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const set = field === 'logoUrl' ? setLogoLoading : setCoverLoading;
    set(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', `tableo/${field === 'logoUrl' ? 'logos' : 'covers'}`);
      const res = await api.post('/uploads/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.url || res.data?.data?.url;
      if (url) setValue(field, url, { shouldDirty: true });
    } catch {
      toast.error('Upload failed.');
    } finally {
      set(false);
    }
  }

  const logoUrl = watch('logoUrl');
  const coverUrl = watch('coverUrl');
  const menuUrl = `https://tableo.app/menu/${restaurant.slug}`;

  return (
    <div className="max-w-3xl">
      {/* ── Profile strip ──────────────────────────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="mb-6 flex items-center gap-4"
      >
        {/* Avatar */}
        <motion.div variants={item} className="relative flex-shrink-0">
          <div
            onClick={() => document.getElementById('logo-input')?.click()}
            className="group relative h-14 w-14 cursor-pointer overflow-hidden rounded-2xl bg-subtle"
          >
            {logoLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 size={16} className="animate-spin text-brand" />
              </div>
            ) : logoUrl ? (
              <img src={logoUrl} className="h-full w-full object-contain p-1.5" alt="" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Store size={18} className="text-muted" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Upload size={14} className="text-white" />
            </div>
          </div>
          <input
            id="logo-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e, 'logoUrl')}
          />
        </motion.div>

        {/* Name + slug + status */}
        <motion.div variants={item} className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-base font-semibold text-fg">{restaurant.name}</h1>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium',
                restaurant.subStatus === 'active'
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger',
              )}
            >
              <CircleDot size={8} />
              {restaurant.plan}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="truncate text-xs text-muted">tableo.app/menu/{restaurant.slug}</span>
            <CopyBtn text={menuUrl} />
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener"
              className="text-muted transition-colors hover:text-fg"
            >
              <ArrowUpRight size={12} />
            </a>
          </div>
        </motion.div>

        {/* Save button — visible on desktop */}
        <motion.div variants={item} className="hidden flex-shrink-0 sm:block">
          <Button type="submit" size="sm" loading={saving} form="restaurant-form">
            <Check size={14} /> Save
          </Button>
        </motion.div>
      </motion.div>

      {/* ── Cover strip ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.25 }}
        className="mb-5"
      >
        <div
          onClick={() => document.getElementById('cover-input')?.click()}
          className="group relative h-28 w-full cursor-pointer overflow-hidden rounded-xl bg-subtle"
        >
          {coverLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg/60">
              <Loader2 size={18} className="animate-spin text-brand" />
            </div>
          )}
          {coverUrl ? (
            <img src={coverUrl} className="h-full w-full object-cover" alt="" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted">
              <Upload size={16} />
              <span className="text-xs">Add cover photo</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex items-center gap-1.5 text-xs font-medium text-white">
              <Upload size={13} /> Replace cover
            </div>
          </div>
        </div>
        <input
          id="cover-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e, 'coverUrl')}
        />
      </motion.div>

      {/* ── Tab bar ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="scrollbar-hide mb-5 flex gap-1 overflow-x-auto pb-0.5"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'relative flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-150',
                active ? 'text-fg' : 'text-muted hover:bg-subtle hover:text-fg',
              )}
            >
              <Icon size={13} />
              {label}
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 rounded-lg bg-subtle"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* ── Form ───────────────────────────────────────────────────────── */}
      <form id="restaurant-form" onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} {...fadeSlide}>
            {/* Identity */}
            {tab === 'identity' && (
              <Section>
                <Row>
                  <Field label="Restaurant name" error={errors.name?.message}>
                    <Input {...register('name')} placeholder="Chow House" error={!!errors.name} />
                  </Field>
                  <Field label="Menu slug" error={errors.slug?.message}>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                        /menu/
                      </span>
                      <Input {...register('slug')} className="pl-14" error={!!errors.slug} />
                    </div>
                  </Field>
                </Row>
                <Field label="Tagline" hint="Shown on your public menu page">
                  <Input {...register('tagline')} placeholder="Fresh food, fast." />
                </Field>
                <Field label="Description">
                  <textarea
                    {...register('description')}
                    placeholder="Tell customers what makes your restaurant special."
                    className="h-20 w-full resize-none rounded-lg bg-subtle px-3 py-2.5 text-sm text-fg outline-none transition-all placeholder:text-muted focus:bg-surface focus:ring-2 focus:ring-brand/30"
                  />
                </Field>
                <Field label="Cuisine types" hint="Select all that apply">
                  <div className="flex flex-wrap gap-1.5">
                    {CUISINE_OPTIONS.map((c) => {
                      const on = cuisine.includes(c);
                      return (
                        <motion.button
                          key={c}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleCuisine(c)}
                          className={cn(
                            'rounded-full px-3 py-1 text-xs font-medium transition-all duration-150',
                            on ? 'bg-brand text-white' : 'bg-subtle text-muted hover:text-fg',
                          )}
                        >
                          {c}
                        </motion.button>
                      );
                    })}
                  </div>
                </Field>
              </Section>
            )}

            {/* Contact */}
            {tab === 'contact' && (
              <Section>
                <Row>
                  <Field label="Phone">
                    <Input
                      {...register('phone')}
                      type="tel"
                      placeholder="+233 20 000 0000"
                      startIcon={<Phone size={14} />}
                    />
                  </Field>
                  <Field label="Email" error={errors.email?.message}>
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="hello@restaurant.com"
                      startIcon={<Mail size={14} />}
                      error={!!errors.email}
                    />
                  </Field>
                </Row>
                <Field label="Website" error={errors.website?.message}>
                  <Input
                    {...register('website')}
                    type="url"
                    placeholder="https://yourrestaurant.com"
                    startIcon={<Globe size={14} />}
                    error={!!errors.website}
                  />
                </Field>
              </Section>
            )}

            {/* Social */}
            {tab === 'social' && (
              <Section>
                <Alert
                  variant="info"
                  message="Enter handles without the @ symbol."
                  className="mb-4"
                />
                <Row>
                  <Field label="Instagram">
                    <Input
                      {...register('instagramHandle')}
                      placeholder="yourrestaurant"
                      startIcon={<Instagram size={14} />}
                    />
                  </Field>
                  <Field label="X / Twitter">
                    <Input
                      {...register('twitterHandle')}
                      placeholder="yourrestaurant"
                      startIcon={<Twitter size={14} />}
                    />
                  </Field>
                  <Field label="Facebook">
                    <Input
                      {...register('facebookHandle')}
                      placeholder="yourpage"
                      startIcon={<Facebook size={14} />}
                    />
                  </Field>
                  <Field label="TikTok">
                    <Input
                      {...register('tiktokHandle')}
                      placeholder="yourrestaurant"
                      startIcon={
                        <svg
                          viewBox="0 0 24 24"
                          width={14}
                          height={14}
                          fill="currentColor"
                          className="text-muted"
                        >
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
                        </svg>
                      }
                    />
                  </Field>
                </Row>
              </Section>
            )}

            {/* Location */}
            {tab === 'location' && (
              <Section>
                <Field label="Street address">
                  <Input
                    {...register('address')}
                    placeholder="123 Oxford Street, Osu"
                    startIcon={<MapPin size={14} />}
                  />
                </Field>
                <Row>
                  <Field label="City">
                    <Input {...register('city')} placeholder="Accra" />
                  </Field>
                  <Field label="Country">
                    <Input {...register('country')} placeholder="Ghana" />
                  </Field>
                  <Field label="Currency" hint="3-letter ISO">
                    <Input {...register('currency')} placeholder="GHS" className="uppercase" />
                  </Field>
                </Row>

                {/* Hours */}
                <Field label="Opening hours">
                  <div className="divide-y divide-border overflow-hidden rounded-xl">
                    {DAYS.map((day, i) => {
                      const h = hours[day] ?? { open: '08:00', close: '22:00', closed: false };
                      return (
                        <motion.div
                          key={day}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className={cn(
                            'flex items-center gap-3 bg-surface px-3 py-2.5',
                            h.closed && 'opacity-50',
                          )}
                        >
                          <span className="w-9 flex-shrink-0 text-xs font-medium text-muted">
                            {DAY_FULL[day]?.slice(0, 3)}
                          </span>
                          {h.closed ? (
                            <span className="flex-1 text-xs text-muted">Closed</span>
                          ) : (
                            <div className="flex flex-1 items-center gap-2">
                              <input
                                type="time"
                                value={h.open}
                                onChange={(e) => updateHour(day, 'open', e.target.value)}
                                className="h-7 w-24 rounded-md bg-subtle px-2 text-xs text-fg outline-none focus:ring-1 focus:ring-brand/40"
                              />
                              <span className="text-xs text-muted">–</span>
                              <input
                                type="time"
                                value={h.close}
                                onChange={(e) => updateHour(day, 'close', e.target.value)}
                                className="h-7 w-24 rounded-md bg-subtle px-2 text-xs text-fg outline-none focus:ring-1 focus:ring-brand/40"
                              />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => updateHour(day, 'closed', !h.closed)}
                            className={cn(
                              'flex-shrink-0 rounded-full px-2.5 py-1 text-2xs font-medium transition-colors',
                              h.closed
                                ? 'bg-success/10 text-success'
                                : 'bg-subtle text-muted hover:text-fg',
                            )}
                          >
                            {h.closed ? 'Open' : 'Close'}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </Field>
              </Section>
            )}

            {/* Payments */}
            {tab === 'payment' && (
              <Section>
                <Alert
                  variant="info"
                  message="Your secret key is stored encrypted and never shown in the UI. Enter it only when you want to update it."
                  className="mb-2"
                />
                <Row>
                  <Field label="Paystack public key" error={errors.paystackPublicKey?.message}>
                    <Input
                      {...register('paystackPublicKey')}
                      placeholder="pk_test_…"
                      startIcon={<CreditCard size={14} />}
                      hint={restaurant.paystackPublicKey ? '✓ Currently set' : 'Not configured'}
                    />
                  </Field>
                  <Field label="Paystack secret key">
                    <div className="relative">
                      <Input
                        {...register('paystackSecretKey')}
                        type={showSecret ? 'text' : 'password'}
                        placeholder="sk_test_… (leave blank to keep)"
                        hint={
                          restaurant.paystackPublicKey ? '✓ Secret key is set' : 'Not configured'
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret((p) => !p)}
                        className="absolute right-3 top-2.5 text-muted transition-colors hover:text-fg"
                      >
                        {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </Field>
                </Row>

                <div className="mt-2 border-t border-border pt-4">
                  <p className="mb-3 flex items-center gap-1.5 text-xs text-muted">
                    <Banknote size={13} className="text-muted" /> Settlement account
                  </p>
                  <Row>
                    <Field label="Type">
                      <select
                        {...register('settlementType')}
                        className="h-10 w-full appearance-none rounded-lg bg-subtle px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-brand/30"
                      >
                        <option value="">Select</option>
                        <option value="bank">Bank account</option>
                        <option value="momo">Mobile money</option>
                      </select>
                    </Field>
                    <Field label="Bank / provider">
                      <Input {...register('settlementBank')} placeholder="GCB / MTN" />
                    </Field>
                    <Field label="Account number">
                      <Input {...register('settlementAccountNumber')} placeholder="020…" />
                    </Field>
                  </Row>
                </div>
              </Section>
            )}

            {/* Subscription */}
            {tab === 'subscription' && (
              <Section>
                <PlanPanel restaurant={restaurant} />
              </Section>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Bottom save ─────────────────────────────────────────────── */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-5">
          {isDirty && (
            <button
              type="button"
              onClick={() => reset()}
              className="text-xs text-muted transition-colors hover:text-fg"
            >
              Discard
            </button>
          )}
          <Button type="submit" size="sm" loading={saving}>
            <Check size={14} /> Save changes
          </Button>
        </div>
      </form>

      {/* ── Floating unsaved bar ─────────────────────────────────────── */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full bg-fg px-5 py-2.5 text-bg shadow-xl"
          >
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
              <span className="text-xs font-medium">Unsaved changes</span>
            </div>
            <div className="h-3 w-px bg-bg/20" />
            <button
              form="restaurant-form"
              type="submit"
              className="text-xs font-semibold text-brand"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="text-xs text-bg/50 transition-colors hover:text-bg"
            >
              Discard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Plan panel ────────────────────────────────────────────────────────────────

function PlanPanel({ restaurant }: { restaurant: Restaurant }) {
  const FEATURES: Record<string, { label: string; icon: React.ElementType }[]> = {
    starter: [
      { label: '1 branch', icon: MapPin },
      { label: 'Digital menu + QR code', icon: Wifi },
      { label: 'Up to 60 menu items', icon: UtensilsCrossed },
      { label: 'Basic analytics', icon: Sparkles },
    ],
    pro: [
      { label: 'Up to 3 branches', icon: MapPin },
      { label: 'Online ordering + Paystack', icon: CreditCard },
      { label: 'Live orders dashboard', icon: Wifi },
      { label: 'Analytics & reports', icon: Sparkles },
    ],
    business: [
      { label: 'Unlimited branches', icon: MapPin },
      { label: 'Staff roles & permissions', icon: ShieldCheck },
      { label: 'Cross-branch analytics', icon: Sparkles },
      { label: 'Custom domain', icon: Globe },
    ],
  };

  const feats = FEATURES[restaurant.plan] ?? FEATURES['starter']!;

  return (
    <div className="space-y-5">
      {/* Current plan card */}
      <div className="flex items-center justify-between rounded-xl bg-subtle p-4">
        <div>
          <p className="text-sm font-semibold capitalize text-fg">{restaurant.plan} plan</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                restaurant.subStatus === 'active' ? 'bg-success' : 'bg-danger',
              )}
            />
            <span className="text-xs capitalize text-muted">{restaurant.subStatus}</span>
            {restaurant.subExpiresAt && (
              <span className="text-xs text-muted">
                · Renews{' '}
                {new Date(restaurant.subExpiresAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            )}
          </div>
        </div>
        {restaurant.plan !== 'business' && (
          <Button size="sm" variant="secondary">
            Upgrade <ChevronRight size={13} />
          </Button>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {feats.map(({ label, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2.5 rounded-lg bg-surface px-3 py-2.5"
          >
            <span className="bg-brand/8 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md">
              <Icon size={12} className="text-brand" />
            </span>
            <span className="text-xs text-fg">{label}</span>
          </motion.div>
        ))}
      </div>

      {restaurant.plan !== 'business' && (
        <div className="flex items-start gap-3 rounded-xl border border-border p-4">
          <Sparkles size={16} className="mt-0.5 flex-shrink-0 text-brand" />
          <div>
            <p className="text-sm font-medium text-fg">More features available</p>
            <p className="mt-0.5 text-xs text-muted">
              Upgrade to unlock multi-branch management, staff roles, and advanced analytics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Section({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
      {children}
    </motion.div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  const count = React.Children.count(children);
  return (
    <div
      className={cn(
        'grid gap-3',
        count === 2 ? 'sm:grid-cols-2' : count === 3 ? 'sm:grid-cols-3' : 'grid-cols-1',
      )}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={item} className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-fg">{label}</label>}
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-danger"
        >
          {error}
        </motion.p>
      )}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </motion.div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  hint?: string;
  startIcon?: React.ReactNode;
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, hint, startIcon, className, ...props }, ref) => (
    <div className="relative">
      {startIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          {startIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          'h-10 w-full rounded-lg bg-subtle px-3 text-sm text-fg placeholder:text-muted',
          'outline-none transition-all focus:bg-surface focus:ring-2 focus:ring-brand/30',
          'disabled:cursor-not-allowed disabled:opacity-40',
          startIcon && 'pl-9',
          error && 'ring-2 ring-danger/40',
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Input.displayName = 'Input';

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        })
      }
      className="text-muted transition-colors hover:text-fg"
    >
      {done ? <Check size={11} className="text-success" /> : <Copy size={11} />}
    </button>
  );
}
