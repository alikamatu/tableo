import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';

interface Restaurant {
  id: string;
  name: string;
  logoUrl: string | null;
  plan: string;
  subStatus: string;
  createdAt: string;
  _count?: { branches: number };
}

interface RestaurantState {
  restaurants: Restaurant[];
  current: Restaurant | null;
  loading: boolean;
  error: string | null;
}

const initialState: RestaurantState = {
  restaurants: [],
  current: null,
  loading: false,
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchRestaurants = createAsyncThunk(
  'restaurant/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/restaurants');
      return data.data as Restaurant[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message ?? 'Failed to load restaurants');
    }
  },
);

export const fetchRestaurant = createAsyncThunk(
  'restaurant/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/restaurants/${id}`);
      return data.data as Restaurant;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message ?? 'Failed to load restaurant');
    }
  },
);

export const createRestaurant = createAsyncThunk(
  'restaurant/create',
  async (payload: { name: string; logoUrl?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/restaurants', payload);
      return data.data as Restaurant;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message ?? 'Failed to create restaurant');
    }
  },
);

export const updateRestaurant = createAsyncThunk(
  'restaurant/update',
  async ({ id, ...payload }: { id: string; name?: string; logoUrl?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/restaurants/${id}`, payload);
      return data.data as Restaurant;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message ?? 'Failed to update restaurant');
    }
  },
);

export const deleteRestaurant = createAsyncThunk(
  'restaurant/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/restaurants/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message ?? 'Failed to delete restaurant');
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
    // Fetch all
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload;
        // Auto-select first if no current
        if (!state.current && action.payload.length > 0) {
          state.current = action.payload[0]!;
        }
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch one
    builder
      .addCase(fetchRestaurant.fulfilled, (state, action) => {
        state.current = action.payload;
      });

    // Create
    builder
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.restaurants.unshift(action.payload);
        state.current = action.payload;
      });

    // Update
    builder
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        const idx = state.restaurants.findIndex((r) => r.id === action.payload.id);
        if (idx >= 0) state.restaurants[idx] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
      });

    // Delete
    builder
      .addCase(deleteRestaurant.fulfilled, (state, action) => {
        state.restaurants = state.restaurants.filter((r) => r.id !== action.payload);
        if (state.current?.id === action.payload) {
          state.current = state.restaurants[0] ?? null;
        }
      });
  },
});

export const { setCurrent, clearError } = restaurantSlice.actions;
export default restaurantSlice.reducer;
