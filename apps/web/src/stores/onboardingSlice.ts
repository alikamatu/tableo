import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { normalizeError, type NormalizedError } from '@/lib/api-error';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OnboardStep = 'welcome' | 'restaurant_info' | 'location_hours' | 'payment' | 'done';

export interface HoursEntry {
  open: string;
  close: string;
  closed: boolean;
}
export type OpeningHours = Record<string, HoursEntry>;

export interface OnboardingDraft {
  // restaurant_info
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  cuisine: string[];
  // location_hours
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  openingHours: OpeningHours;
  // payment
  paystackPublicKey: string;
  paystackSecretKey: string;
  // settlement
  settlementType: 'bank' | 'momo';
  settlementBank: string;
  settlementAccountNumber: string;
}

interface OnboardingState {
  step: OnboardStep;
  complete: boolean;
  draft: OnboardingDraft;
  restaurantId: string | null;
  loading: boolean;
  saving: boolean;
  error: NormalizedError | null;
}

const DEFAULT_HOURS: OpeningHours = {
  mon: { open: '08:00', close: '22:00', closed: false },
  tue: { open: '08:00', close: '22:00', closed: false },
  wed: { open: '08:00', close: '22:00', closed: false },
  thu: { open: '08:00', close: '22:00', closed: false },
  fri: { open: '08:00', close: '22:00', closed: false },
  sat: { open: '09:00', close: '23:00', closed: false },
  sun: { open: '10:00', close: '21:00', closed: false },
};

const EMPTY_DRAFT: OnboardingDraft = {
  name: '',
  slug: '',
  description: '',
  logoUrl: '',
  coverUrl: '',
  cuisine: [],
  phone: '',
  email: '',
  address: '',
  city: '',
  country: 'Ghana',
  openingHours: DEFAULT_HOURS,
  paystackPublicKey: '',
  paystackSecretKey: '',
  settlementType: 'momo',
  settlementBank: '',
  settlementAccountNumber: '',
};

const STORAGE_KEY = 'tableo_onboard_draft';

// ── localStorage persistence helpers ─────────────────────────────────────────

function saveDraft(draft: OnboardingDraft) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

function loadDraft(): OnboardingDraft {
  if (typeof window === 'undefined') return EMPTY_DRAFT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_DRAFT;
    return { ...EMPTY_DRAFT, ...JSON.parse(raw) };
  } catch {
    return EMPTY_DRAFT;
  }
}

function clearDraft() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const initialState: OnboardingState = {
  step: 'welcome',
  complete: false,
  draft: EMPTY_DRAFT,
  restaurantId: null,
  loading: false,
  saving: false,
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

/** Load state from API (resumes where user left off) */
export const loadOnboardingState = createAsyncThunk(
  'onboarding/loadState',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/onboarding/state');
      return data.data as {
        step: OnboardStep;
        complete: boolean;
        restaurant: Record<string, unknown> | null;
      };
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  },
);

/** Save a step to the API and advance */
export const saveOnboardingStep = createAsyncThunk(
  'onboarding/saveStep',
  async (payload: Partial<OnboardingDraft> & { step: OnboardStep }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch('/onboarding/step', payload);
      return data.data as {
        step: OnboardStep;
        complete: boolean;
        restaurant: Record<string, unknown>;
      };
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    /** Update draft fields locally — persists to localStorage */
    updateDraft(state, action: PayloadAction<Partial<OnboardingDraft>>) {
      state.draft = { ...state.draft, ...action.payload };
      saveDraft(state.draft);
    },
    /** Restore draft from localStorage on mount */
    hydrateDraft(state) {
      state.draft = loadDraft();
    },
    /** Move to a step directly (for back navigation) */
    goToStep(state, action: PayloadAction<OnboardStep>) {
      state.step = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    resetOnboarding(state) {
      state.step = 'welcome';
      state.complete = false;
      state.draft = EMPTY_DRAFT;
      state.restaurantId = null;
      state.error = null;
      clearDraft();
    },
  },
  extraReducers: (builder) => {
    // loadState
    builder
      .addCase(loadOnboardingState.pending, (s) => {
        s.loading = true;
      })
      .addCase(loadOnboardingState.fulfilled, (s, a) => {
        s.loading = false;
        s.step = a.payload.complete ? 'done' : a.payload.step;
        s.complete = a.payload.complete;
        if (a.payload.restaurant) {
          const r = a.payload.restaurant;
          s.restaurantId = (r['id'] as string) ?? null;
          // Merge API data into draft (API is source of truth, localStorage fills gaps)
          const local = loadDraft();
          s.draft = {
            ...local,
            name: (r['name'] as string) || local.name,
            slug: (r['slug'] as string) || local.slug,
            description: (r['description'] as string) || local.description,
            logoUrl: (r['logoUrl'] as string) || local.logoUrl,
            coverUrl: (r['coverUrl'] as string) || local.coverUrl,
            cuisine: (r['cuisine'] as string[]) || local.cuisine,
            phone: (r['phone'] as string) || local.phone,
            email: (r['email'] as string) || local.email,
            address: (r['address'] as string) || local.address,
            city: (r['city'] as string) || local.city,
            country: (r['country'] as string) || local.country,
            openingHours: (r['openingHours'] as OpeningHours) || local.openingHours,
            paystackPublicKey: (r['paystackPublicKey'] as string) || local.paystackPublicKey,
            paystackSecretKey: '', // never echo secrets
            settlementType: (r['settlementType'] as 'bank' | 'momo') || local.settlementType,
            settlementBank: (r['settlementBank'] as string) || local.settlementBank,
            settlementAccountNumber:
              (r['settlementAccountNumber'] as string) || local.settlementAccountNumber,
          };
        }
      })
      .addCase(loadOnboardingState.rejected, (s) => {
        s.loading = false;
      });

    // saveStep
    builder
      .addCase(saveOnboardingStep.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(saveOnboardingStep.fulfilled, (s, a) => {
        s.saving = false;
        s.step = a.payload.step;
        s.complete = a.payload.complete;
        if (a.payload.restaurant?.['id']) s.restaurantId = a.payload.restaurant['id'] as string;
        if (a.payload.complete) clearDraft();
      })
      .addCase(saveOnboardingStep.rejected, (s, a) => {
        s.saving = false;
        s.error = a.payload as NormalizedError;
      });
  },
});

export const { updateDraft, hydrateDraft, goToStep, clearError, resetOnboarding } =
  onboardingSlice.actions;
export default onboardingSlice.reducer;
