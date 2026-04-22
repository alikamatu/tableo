import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { normalizeError, type NormalizedError } from '@/lib/api-error';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Restaurant {
  id: string;
  ownerId: string;
  // Identity
  name: string;
  slug: string;
  description: string | null;
  tagline: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  cuisine: string[];
  // Contact
  phone: string | null;
  email: string | null;
  website: string | null;
  // Social
  instagramHandle: string | null;
  twitterHandle: string | null;
  facebookHandle: string | null;
  tiktokHandle: string | null;
  // Location
  address: string | null;
  city: string | null;
  country: string;
  currency: string;
  openingHours: Record<string, { open: string; close: string; closed: boolean }> | null;
  // Paystack
  paystackPublicKey: string | null;
  // Settlement
  settlementType: string | null;
  settlementBank: string | null;
  settlementAccountNumber: string | null;
  paystackSubaccountCode: string | null;
  // Subscription
  plan: string;
  subStatus: string;
  subExpiresAt: string | null;
  // Onboarding
  onboardComplete: boolean;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  // Relations
  branches?: { id: string; name: string; slug: string; isActive: boolean }[];
  _count?: { branches: number; menuItems: number };
}

export type RestaurantUpdatePayload = Partial<Omit<Restaurant, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'plan' | 'subStatus' | 'subExpiresAt' | 'onboardComplete' | '_count' | 'branches'>> & {
  paystackSecretKey?: string;
};

interface RestaurantState {
  restaurants: Restaurant[];
  current: Restaurant | null;
  loading: boolean;
  saving: boolean;
  error: NormalizedError | null;
}

const initialState: RestaurantState = {
  restaurants: [],
  current: null,
  loading: false,
  saving: false,
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchRestaurants = createAsyncThunk(
  'restaurant/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/restaurants');
      return data.data as Restaurant[];
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  },
);

export const fetchRestaurant = createAsyncThunk(
  'restaurant/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/restaurants/${id}`);
      return data.data as Restaurant;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  },
);

export const updateRestaurant = createAsyncThunk(
  'restaurant/update',
  async (
    { id, ...payload }: RestaurantUpdatePayload & { id: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch(`/restaurants/${id}`, payload);
      return data.data as Restaurant;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setCurrent(state, action: PayloadAction<Restaurant | null>) {
      state.current = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchRestaurants.fulfilled, (s, a: PayloadAction<Restaurant[]>) => {
        s.loading = false;
        s.restaurants = a.payload;
        if (!s.current && a.payload.length > 0) s.current = a.payload[0]!;
      })
      .addCase(fetchRestaurants.rejected,  (s, a) => {
        s.loading = false;
        s.error = a.payload as NormalizedError;
      });

    builder
      .addCase(fetchRestaurant.pending,   (s) => { s.loading = true; })
      .addCase(fetchRestaurant.fulfilled, (s, a: PayloadAction<Restaurant>) => {
        s.loading = false;
        s.current = a.payload;
        const idx = s.restaurants.findIndex((r) => r.id === a.payload.id);
        if (idx >= 0) s.restaurants[idx] = a.payload;
        else s.restaurants.unshift(a.payload);
      })
      .addCase(fetchRestaurant.rejected,  (s) => { s.loading = false; });

    builder
      .addCase(updateRestaurant.pending,   (s) => { s.saving = true; s.error = null; })
      .addCase(updateRestaurant.fulfilled, (s, a: PayloadAction<Restaurant>) => {
        s.saving = false;
        const idx = s.restaurants.findIndex((r) => r.id === a.payload.id);
        if (idx >= 0) s.restaurants[idx] = a.payload;
        if (s.current?.id === a.payload.id) s.current = a.payload;
      })
      .addCase(updateRestaurant.rejected,  (s, a) => {
        s.saving = false;
        s.error = a.payload as NormalizedError;
      });
  },
});

export const { setCurrent, clearError } = restaurantSlice.actions;
export default restaurantSlice.reducer;
