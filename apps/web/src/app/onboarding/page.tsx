'use client';

import * as React from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import {
  Store,
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Clock,
  Upload,
  Loader2,
  Check,
  Sparkles,
  Settings,
} from 'lucide-react';
import { AppLoader } from '@/components/ui/AppLoader';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAppDispatch, useAppSelector } from '@/stores/store';
import {
  updateDraft,
  hydrateDraft,
  goToStep,
  loadOnboardingState,
  saveOnboardingStep,
  type OnboardStep,
  type OpeningHours,
} from '@/stores/onboardingSlice';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, useAlert } from '@/components/ui/Alert';
import { Divider } from '@/components/ui/Divider';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { refreshSession } from '@/stores/authSlice';

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS: { id: OnboardStep; label: string; icon: React.ElementType }[] = [
  { id: 'welcome', label: 'Welcome', icon: Sparkles },
  { id: 'restaurant_info', label: 'Restaurant', icon: Store },
  { id: 'location_hours', label: 'Location', icon: MapPin },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'done', label: 'Done', icon: CheckCircle },
];

const VISIBLE_STEPS = STEPS.filter((s) => s.id !== 'welcome' && s.id !== 'done');

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

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const restaurantInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(120),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters.')
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens.'),
  description: z.string().max(500).optional(),
  cuisine: z.array(z.string()).optional(),
});

const locationSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email('Enter a valid email.').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

const paymentSchema = z.object({
  paystackPublicKey: z
    .string()
    .startsWith('pk_', 'Must start with pk_')
    .min(10, 'Enter your Paystack public key.')
    .optional()
    .or(z.literal('')),
  paystackSecretKey: z
    .string()
    .startsWith('sk_', 'Must start with sk_')
    .min(20, 'Enter your Paystack secret key.')
    .optional()
    .or(z.literal('')),
  settlementType: z.enum(['bank', 'momo']).default('momo'),
  settlementBank: z.string().min(2, 'Select a provider.'),
  settlementAccountNumber: z
    .string()
    .regex(/^\+233\d{9}$/, 'Must be +233 followed by 9 digits (e.g. +233241234567)')
    .or(z.string().min(8, 'Account number is too short.')),
});

const GHANA_MOMO_PROVIDERS = ['MTN Mobile Money', 'Telecel Cash', 'AirtelTigo Money'] as const;

const GHANA_BANKS = [
  'GCB Bank',
  'Ecobank Ghana',
  'Stanbic Bank',
  'Absa Bank Ghana',
  'Fidelity Bank',
  'CalBank',
  'Zenith Bank Ghana',
  'Access Bank Ghana',
  'Republic Bank',
  'Societe Generale Ghana',
  'First National Bank',
  'Prudential Bank',
  'UBA Ghana',
  'First Atlantic Bank',
  'OmniBSIC Bank',
  'Bank of Africa Ghana',
  'FBN Bank Ghana',
  'Agricultural Development Bank',
  'National Investment Bank',
  'Universal Merchant Bank',
] as const;

type RestaurantInfoForm = z.infer<typeof restaurantInfoSchema>;
type LocationForm = z.infer<typeof locationSchema>;
type PaymentForm = z.infer<typeof paymentSchema>;

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const dispatch = useAppDispatch();
  const { step, loading } = useAppSelector((s) => s.onboarding);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hydrate draft from localStorage then load server state
  useEffect(() => {
    dispatch(hydrateDraft());
    dispatch(loadOnboardingState());
  }, [dispatch]);

  // Note: StepDone handles the redirect with its preparation animation

  // Animate step transitions
  const animateStep = useCallback(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' },
    );
  }, []);

  useEffect(() => {
    animateStep();
  }, [step, animateStep]);

  if (loading) {
    return <AppLoader message="Loading your setup…" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand">
            <span className="text-[10px] font-bold text-white">T</span>
          </span>
          <span className="text-sm font-semibold text-fg">Tableo</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand">
            <span className="text-[10px] font-bold text-white">T</span>
          </span>
          <span className="text-sm font-semibold text-fg">Tableo</span>
        </div>
      </header>

      {/* Progress bar (shown after welcome) */}
      {step !== 'welcome' && step !== 'done' && <ProgressBar step={step} />}

      {/* Step content */}
      <div
        ref={containerRef}
        className="flex flex-1 flex-col items-center justify-center px-5 py-10"
      >
        <div className="w-full max-w-lg">
          {step === 'welcome' && <StepWelcome />}
          {step === 'restaurant_info' && <StepRestaurantInfo onNext={animateStep} />}
          {step === 'location_hours' && <StepLocation onNext={animateStep} />}
          {step === 'payment' && <StepPayment onNext={animateStep} />}
          {step === 'done' && <StepDone />}
        </div>
      </div>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: OnboardStep }) {
  const idx = VISIBLE_STEPS.findIndex((s) => s.id === step);
  const pct = Math.round(((idx + 1) / VISIBLE_STEPS.length) * 100);

  return (
    <div className="mx-auto w-full max-w-lg px-5 pb-2 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-muted">
          Step {idx + 1} of {VISIBLE_STEPS.length}
        </span>
        <span className="text-xs text-muted">{pct}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-subtle">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Step dots */}
      <div className="mt-3 flex items-center justify-between">
        {VISIBLE_STEPS.map((s, i) => {
          const done = i < idx;
          const current = i === idx;
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs transition-all duration-300',
                  done ? 'bg-brand text-white' : '',
                  current ? 'bg-brand/10 text-brand ring-2 ring-brand/30' : '',
                  !done && !current ? 'bg-subtle text-muted' : '',
                )}
              >
                {done ? <Check size={12} strokeWidth={3} /> : <Icon size={13} />}
              </span>
              <span
                className={cn(
                  'hidden text-2xs transition-colors sm:block',
                  current ? 'font-medium text-fg' : 'text-muted',
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step: Welcome ────────────────────────────────────────────────────────────

function StepWelcome() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  return (
    <div className="space-y-6 text-center">
      {/* Animated logo mark */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="flex h-20 w-20 animate-float items-center justify-center rounded-2xl bg-brand">
            <span className="text-3xl font-bold text-white">T</span>
          </div>
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-success">
            <Sparkles size={11} className="text-white" />
          </span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Welcome, {user?.fullName?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
          Let&apos;s set up your restaurant in 3 quick steps. It takes about 3 minutes and you can
          always come back to finish later.
        </p>
      </div>

      {/* What you'll set up */}
      <div className="space-y-3 rounded-2xl bg-surface p-5 text-left">
        {[
          { icon: Store, label: 'Restaurant name, logo & description' },
          { icon: MapPin, label: 'Location, hours & contact info' },
          { icon: CreditCard, label: 'Paystack keys for online payments' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10">
              <Icon size={15} className="text-brand" />
            </span>
            <span className="text-sm text-fg">{label}</span>
          </div>
        ))}
      </div>

      <Button className="w-full" size="lg" onClick={() => dispatch(goToStep('restaurant_info'))}>
        Let&apos;s go <ArrowRight size={16} />
      </Button>
    </div>
  );
}

// ─── Step: Restaurant Info ────────────────────────────────────────────────────

function StepRestaurantInfo({ onNext }: { onNext: () => void }) {
  const dispatch = useAppDispatch();
  const { draft, saving, error } = useAppSelector((s) => s.onboarding);
  const { show, node: alertNode } = useAlert();

  const [slugStatus, setSlugStatus] = React.useState<'idle' | 'checking' | 'available' | 'taken'>(
    'idle',
  );
  const [uploading, setUploading] = React.useState(false);
  const slugTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RestaurantInfoForm>({
    resolver: zodResolver(restaurantInfoSchema),
    defaultValues: {
      name: draft.name,
      slug: draft.slug,
      description: draft.description,
      cuisine: draft.cuisine,
    },
  });

  const nameVal = watch('name');
  const slugVal = watch('slug');

  // Auto-generate slug from name
  useEffect(() => {
    if (!draft.slug && nameVal) {
      const auto = nameVal
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50);
      setValue('slug', auto);
    }
  }, [nameVal, draft.slug, setValue]);

  // Slug availability check (debounced)
  useEffect(() => {
    clearTimeout(slugTimer.current);
    if (!slugVal || slugVal.length < 3) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    slugTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/onboarding/slug-check?slug=${slugVal}`);
        setSlugStatus(data.data.available ? 'available' : 'taken');
      } catch {
        setSlugStatus('idle');
      }
    }, 500);
    return () => clearTimeout(slugTimer.current);
  }, [slugVal]);

  const toggleCuisine = (c: string) => {
    const next = draft.cuisine.includes(c)
      ? draft.cuisine.filter((x) => x !== c)
      : [...draft.cuisine, c];
    dispatch(updateDraft({ cuisine: next }));
    setValue('cuisine', next);
  };

  const onSubmit = async (data: RestaurantInfoForm) => {
    if (slugStatus === 'taken') {
      show('error', 'This slug is already taken. Choose another.');
      return;
    }
    dispatch(updateDraft(data));
    const result = await dispatch(saveOnboardingStep({ ...data, step: 'restaurant_info' }));
    if (saveOnboardingStep.rejected.match(result)) {
      const err = result.payload as { message: string };
      show('error', err?.message ?? 'Failed to save. Please try again.');
    } else {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-fg">Restaurant details</h2>
        <p className="mt-1 text-sm text-muted">Tell customers about your place.</p>
      </div>

      {alertNode}
      {error && !alertNode && <Alert variant="error" message={error.message} className="mb-4" />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Restaurant name *"
          placeholder="e.g. Chow House"
          error={errors.name?.message}
          {...register('name', {
            onChange: (e) => dispatch(updateDraft({ name: e.target.value })),
          })}
        />

        {/* Slug field */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-fg">Menu URL slug *</label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">
              tableo.app/menu/
            </div>
            <input
              className={cn(
                'h-10 w-full rounded-md bg-subtle pl-[128px] pr-9 text-sm text-fg',
                'outline-none transition-all focus:bg-surface focus:ring-2 focus:ring-brand/40',
                errors.slug && 'ring-2 ring-danger/50',
              )}
              {...register('slug', {
                onChange: (e) => dispatch(updateDraft({ slug: e.target.value })),
              })}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {slugStatus === 'checking' && (
                <Loader2 size={14} className="animate-spin text-muted" />
              )}
              {slugStatus === 'available' && <Check size={14} className="text-success" />}
              {slugStatus === 'taken' && <X size={14} className="text-danger" />}
            </span>
          </div>
          {errors.slug && <p className="text-xs text-danger">{errors.slug.message}</p>}
          {!errors.slug && slugStatus === 'taken' && (
            <p className="text-xs text-danger">This slug is already taken.</p>
          )}
          {!errors.slug && slugStatus === 'available' && (
            <p className="text-xs text-success">This slug is available.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-fg">Description</label>
          <textarea
            className="h-24 w-full resize-none rounded-md bg-subtle px-3 py-2.5 text-sm text-fg outline-none transition-all placeholder:text-muted focus:bg-surface focus:ring-2 focus:ring-brand/40"
            placeholder="What makes your restaurant special? (optional)"
            value={draft.description}
            onChange={(e) => dispatch(updateDraft({ description: e.target.value }))}
          />
        </div>

        {/* Cuisine tags */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-fg">Cuisine type</label>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((c) => {
              const active = draft.cuisine.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCuisine(c)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
                    active
                      ? 'bg-brand text-white'
                      : 'bg-subtle text-muted hover:bg-subtle/60 hover:text-fg',
                  )}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Logo upload */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-fg">Logo</label>
          <div
            className="relative flex h-24 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-border text-muted transition-colors hover:border-brand/40 hover:text-brand"
            onClick={() => document.getElementById('logo-upload')?.click()}
          >
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin text-brand" />
                <span className="text-xs">Uploading…</span>
              </>
            ) : draft.logoUrl ? (
              <img src={draft.logoUrl} alt="logo" className="h-16 w-16 rounded-lg object-contain" />
            ) : (
              <>
                <Upload size={20} />
                <span className="text-xs">Upload logo (supports HEIC, PNG, JPG…)</span>
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
                setUploading(true);
                try {
                  const fd = new FormData();
                  fd.append('file', file);
                  fd.append('folder', 'tableo/logos');
                  const res = await api.post('/uploads/image', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                  });
                  const url = res.data?.url || res.data?.data?.url;
                  if (url) dispatch(updateDraft({ logoUrl: url }));
                } catch {
                  show('error', 'Logo upload failed. Try again.');
                } finally {
                  setUploading(false);
                }
              }}
            />
          </div>
          {draft.logoUrl && (
            <button
              type="button"
              onClick={() => dispatch(updateDraft({ logoUrl: '' }))}
              className="text-xs text-danger hover:underline"
            >
              Remove logo
            </button>
          )}
        </div>

        <StepFooter onBack={() => dispatch(goToStep('welcome'))} loading={saving} isFirst />
      </form>
    </div>
  );
}

// ─── Step: Location & Hours ───────────────────────────────────────────────────

function StepLocation({ onNext }: { onNext: () => void }) {
  const dispatch = useAppDispatch();
  const { draft, saving } = useAppSelector((s) => s.onboarding);
  const { show, node: alertNode } = useAlert();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      phone: draft.phone,
      email: draft.email,
      address: draft.address,
      city: draft.city,
      country: draft.country,
    },
  });

  const updateHours = (day: string, field: keyof OpeningHours[string], value: string | boolean) => {
    const next: OpeningHours = {
      ...draft.openingHours,
      [day]: { ...draft.openingHours[day]!, [field]: value },
    };
    dispatch(updateDraft({ openingHours: next }));
  };

  const onSubmit = async (data: LocationForm) => {
    dispatch(updateDraft(data));
    const result = await dispatch(
      saveOnboardingStep({
        ...data,
        openingHours: draft.openingHours,
        step: 'location_hours',
      }),
    );
    if (saveOnboardingStep.rejected.match(result)) {
      const err = result.payload as { message: string };
      show('error', err?.message ?? 'Failed to save. Please try again.');
    } else {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-fg">Location & hours</h2>
        <p className="mt-1 text-sm text-muted">Help customers find you.</p>
      </div>

      {alertNode}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Phone"
            type="tel"
            placeholder="+233 20 000 0000"
            error={errors.phone?.message}
            {...register('phone', {
              onChange: (e) => dispatch(updateDraft({ phone: e.target.value })),
            })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="info@restaurant.com"
            error={errors.email?.message}
            {...register('email', {
              onChange: (e) => dispatch(updateDraft({ email: e.target.value })),
            })}
          />
        </div>

        <Input
          label="Street address"
          placeholder="123 Oxford Street"
          {...register('address', {
            onChange: (e) => dispatch(updateDraft({ address: e.target.value })),
          })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="City"
            placeholder="Accra"
            {...register('city', {
              onChange: (e) => dispatch(updateDraft({ city: e.target.value })),
            })}
          />
          <Input
            label="Country"
            placeholder="Ghana"
            {...register('country', {
              onChange: (e) => dispatch(updateDraft({ country: e.target.value })),
            })}
          />
        </div>

        {/* Opening hours */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-muted" />
            <label className="text-sm font-medium text-fg">Opening hours</label>
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-xl bg-surface">
            {DAYS.map((day) => {
              const h = draft.openingHours[day] ?? { open: '08:00', close: '22:00', closed: false };
              return (
                <div key={day} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-10 flex-shrink-0 text-xs font-medium text-fg">
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
                        className="h-7 rounded-md bg-subtle px-2 text-xs text-fg outline-none focus:ring-1 focus:ring-brand/40"
                      />
                      <span className="text-xs text-muted">–</span>
                      <input
                        type="time"
                        value={h.close}
                        onChange={(e) => updateHours(day, 'close', e.target.value)}
                        className="h-7 rounded-md bg-subtle px-2 text-xs text-fg outline-none focus:ring-1 focus:ring-brand/40"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => updateHours(day, 'closed', !h.closed)}
                    className={cn(
                      'flex-shrink-0 rounded-full px-2 py-0.5 text-2xs transition-colors',
                      h.closed ? 'bg-danger/10 text-danger' : 'bg-subtle text-muted hover:text-fg',
                    )}
                  >
                    {h.closed ? 'Open' : 'Close'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <StepFooter onBack={() => dispatch(goToStep('restaurant_info'))} loading={saving} />
      </form>
    </div>
  );
}

// ─── Step: Payment ────────────────────────────────────────────────────────────

function StepPayment({ onNext }: { onNext: () => void }) {
  const dispatch = useAppDispatch();
  const { draft, saving } = useAppSelector((s) => s.onboarding);
  const { show, node: alertNode } = useAlert();
  const [showSecret, setShowSecret] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paystackPublicKey: draft.paystackPublicKey,
      paystackSecretKey: draft.paystackSecretKey,
      settlementType: draft.settlementType || 'momo',
      settlementBank: draft.settlementBank,
      settlementAccountNumber: draft.settlementAccountNumber,
    },
  });

  const settlementType = watch('settlementType');

  const onSubmit = async (data: PaymentForm) => {
    dispatch(updateDraft(data));
    const result = await dispatch(saveOnboardingStep({ ...data, step: 'payment' }));
    if (saveOnboardingStep.rejected.match(result)) {
      const err = result.payload as { message: string };
      show('error', err?.message ?? 'Failed to save.');
    } else {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-fg">Payment setup</h2>
        <p className="mt-1 text-sm text-muted">
          Tell us where to send your money. We use Paystack for all payouts.
        </p>
      </div>

      {alertNode}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Settlement Type Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-fg">
            How would you like to receive payments?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'momo', label: 'Mobile Money', icon: CreditCard },
              { id: 'bank', label: 'Bank Account', icon: Store },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setValue('settlementType', t.id as 'bank' | 'momo')}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all',
                  settlementType === t.id
                    ? 'border-brand bg-brand/5 ring-4 ring-brand/10'
                    : 'border-border bg-subtle hover:border-brand/40',
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    settlementType === t.id ? 'bg-brand text-white' : 'bg-muted text-muted',
                  )}
                >
                  <t.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none text-fg">{t.label}</p>
                  <p className="mt-1 text-[10px] text-muted">Instant Payouts</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-fg">
              {settlementType === 'momo' ? 'Network Provider' : 'Bank Name'}
            </label>
            <select
              className={cn(
                'h-10 w-full rounded-md bg-subtle px-3 text-sm text-fg',
                'outline-none transition-all focus:bg-surface focus:ring-2 focus:ring-brand/40',
                errors.settlementBank && 'ring-2 ring-danger/50',
              )}
              {...register('settlementBank', {
                onChange: (e) => dispatch(updateDraft({ settlementBank: e.target.value })),
              })}
            >
              <option value="">Select {settlementType === 'momo' ? 'provider' : 'bank'}…</option>
              {(settlementType === 'momo' ? GHANA_MOMO_PROVIDERS : GHANA_BANKS).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors.settlementBank && (
              <p className="text-xs text-danger">{errors.settlementBank.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-fg">
              {settlementType === 'momo' ? 'Mobile Number' : 'Account Number'}
            </label>
            {settlementType === 'momo' ? (
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted">
                  +233
                </span>
                <input
                  className={cn(
                    'h-10 w-full rounded-md bg-subtle pl-14 pr-3 text-sm text-fg placeholder:text-muted',
                    'outline-none transition-all focus:bg-surface focus:ring-2 focus:ring-brand/40',
                    errors.settlementAccountNumber && 'ring-2 ring-danger/50',
                  )}
                  placeholder="241234567"
                  maxLength={9}
                  {...register('settlementAccountNumber', {
                    onChange: (e) => {
                      // Strip non-digits and prepend +233
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                      e.target.value = digits;
                      dispatch(updateDraft({ settlementAccountNumber: `+233${digits}` }));
                    },
                  })}
                />
              </div>
            ) : (
              <input
                className={cn(
                  'h-10 w-full rounded-md bg-subtle px-3 text-sm text-fg placeholder:text-muted',
                  'outline-none transition-all focus:bg-surface focus:ring-2 focus:ring-brand/40',
                  errors.settlementAccountNumber && 'ring-2 ring-danger/50',
                )}
                placeholder="1234567890123"
                {...register('settlementAccountNumber', {
                  onChange: (e) =>
                    dispatch(updateDraft({ settlementAccountNumber: e.target.value })),
                })}
              />
            )}
            {errors.settlementAccountNumber && (
              <p className="text-xs text-danger">{errors.settlementAccountNumber.message}</p>
            )}
          </div>
        </div>

        <Divider className="my-2" />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings size={14} className="text-muted" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Advanced (Optional)
            </span>
          </div>

          <Input
            label="Paystack public key"
            placeholder="pk_test_xxxxxxxxxxxxxxxxxxxx"
            error={errors.paystackPublicKey?.message}
            {...register('paystackPublicKey', {
              onChange: (e) => dispatch(updateDraft({ paystackPublicKey: e.target.value })),
            })}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-fg">Paystack secret key</label>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="text-xs text-muted transition-colors hover:text-fg"
              >
                {showSecret ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showSecret ? 'text' : 'password'}
              placeholder="sk_test_xxxxxxxxxxxxxxxxxxxx"
              className={cn(
                'h-10 w-full rounded-md bg-subtle px-3 text-sm text-fg placeholder:text-muted',
                'outline-none transition-all focus:bg-surface focus:ring-2 focus:ring-brand/40',
                errors.paystackSecretKey && 'ring-2 ring-danger/50',
              )}
              {...register('paystackSecretKey', {
                onChange: (e) => dispatch(updateDraft({ paystackSecretKey: e.target.value })),
              })}
            />
          </div>
        </div>

        <Alert
          variant="info"
          message="By providing your settlement details, you agree to allow Tableo to process split payments via Paystack. A standard processing fee applies."
          className="mt-2"
        />

        <StepFooter onBack={() => dispatch(goToStep('location_hours'))} loading={saving} isLast />
      </form>
    </div>
  );
}

// ─── Step: Done ───────────────────────────────────────────────────────────────

const PHASES = [
  { label: 'Setting up your menu system…', icon: Store },
  { label: 'Configuring payment processing…', icon: CreditCard },
  { label: 'Preparing your dashboard…', icon: Settings },
];

function StepDone() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { draft } = useAppSelector((s) => s.onboarding);
  const containerRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = React.useState(0);
  const [done, setDone] = React.useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(
      setTimeout(
        async () => {
          // Refresh session to update the refresh_token cookie with onboardComplete: true
          await dispatch(refreshSession());
          router.replace('/subscription');
        },
        PHASES.length * 1500 + 3500,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [router, dispatch]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' },
      );
    }
  }, [done]);

  if (done) {
    return (
      <div ref={containerRef} className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="relative h-20 w-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-success/10">
              <CheckCircle size={36} className="text-success" />
            </div>
            <div className="absolute inset-0 animate-ping rounded-2xl border-2 border-success/30" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-fg">You&apos;re all set! 🎉</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
            <strong className="text-fg">{draft.name || 'Your restaurant'}</strong> is ready. Taking
            you to your dashboard…
          </p>
        </div>
        <div className="flex justify-center">
          <div className="h-1 w-32 overflow-hidden rounded-full bg-subtle">
            <div className="h-full animate-[loading_2s_ease-in-out_forwards] rounded-full bg-brand" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-center">
      <div className="flex justify-center">
        <div className="relative h-20 w-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/10">
            <Sparkles size={32} className="animate-pulse text-brand" />
          </div>
          <div
            className="absolute inset-0 animate-spin rounded-2xl border-[3px] border-transparent border-t-brand"
            style={{ animationDuration: '1.5s' }}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-tight text-fg">
          Preparing {draft.name || 'your restaurant'}…
        </h2>
        <p className="mt-1 text-sm text-muted">This will only take a moment.</p>
      </div>

      <div className="mx-auto max-w-xs space-y-3">
        {PHASES.map((p, i) => {
          const Icon = p.icon;
          const isDone = phase > i;
          const isCurrent = phase === i;
          return (
            <div
              key={p.label}
              className={cn(
                'flex items-center gap-3 rounded-xl p-3 transition-all duration-500',
                isDone ? 'bg-success/10' : isCurrent ? 'bg-brand/5' : 'bg-subtle/50 opacity-40',
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-500',
                  isDone
                    ? 'bg-success text-white'
                    : isCurrent
                      ? 'bg-brand/20 text-brand'
                      : 'bg-subtle text-muted',
                )}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
              </div>
              <span
                className={cn(
                  'text-sm transition-all duration-300',
                  isDone
                    ? 'font-medium text-success'
                    : isCurrent
                      ? 'font-medium text-fg'
                      : 'text-muted',
                )}
              >
                {isDone ? p.label.replace('…', ' ✓') : p.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Shared step footer ───────────────────────────────────────────────────────

function StepFooter({
  onBack,
  loading,
  isFirst = false,
  isLast = false,
}: {
  onBack: () => void;
  loading: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-2">
      {!isFirst && (
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeft size={16} /> Back
        </Button>
      )}
      <Button type="submit" size="lg" className={isFirst ? 'w-full' : 'flex-1'} loading={loading}>
        {isLast ? 'Finish setup' : 'Continue'} <ArrowRight size={16} />
      </Button>
    </div>
  );
}
