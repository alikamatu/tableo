import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';

interface Branch {
  id: string;
  restaurantId: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  openingHours: Record<string, string> | null;
  createdAt: string;
}

interface BranchState {
  branches: Branch[];
  current: Branch | null;
  loading: boolean;
  error: string | null;
}

const initialState: BranchState = {
  branches: [],
  current: null,
  loading: false,
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchBranches = createAsyncThunk(
  'branch/fetchAll',
  async (restaurantId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/restaurants/${restaurantId}/branches`);
      return data.data as Branch[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message ?? 'Failed to load branches');
    }
  },
);

export const fetchBranch = createAsyncThunk(
  'branch/fetchOne',
  async (
    { restaurantId, branchId }: { restaurantId: string; branchId: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(`/restaurants/${restaurantId}/branches/${branchId}`);
      return data.data as Branch;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message ?? 'Failed to load branch');
    }
  },
);

export const createBranch = createAsyncThunk(
  'branch/create',
  async (
    { restaurantId, ...payload }: { 
      restaurantId: string; 
      name: string; 
      address?: string; 
      phone?: string;
      managerName: string;
      managerEmail: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post(`/restaurants/${restaurantId}/branches`, payload);
      return data.data as Branch;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message ?? 'Failed to create branch');
    }
  },
);

export const updateBranch = createAsyncThunk(
  'branch/update',
  async (
    { restaurantId, branchId, ...payload }: { restaurantId: string; branchId: string; [key: string]: unknown },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch(`/restaurants/${restaurantId}/branches/${branchId}`, payload);
      return data.data as Branch;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message ?? 'Failed to update branch');
    }
  },
);

export const deleteBranch = createAsyncThunk(
  'branch/delete',
  async (
    { restaurantId, branchId }: { restaurantId: string; branchId: string },
    { rejectWithValue },
  ) => {
    try {
      await api.delete(`/restaurants/${restaurantId}/branches/${branchId}`);
      return branchId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message ?? 'Failed to delete branch');
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    setCurrentBranch(state, action: PayloadAction<Branch | null>) {
      state.current = action.payload;
    },
    clearBranches(state) {
      state.branches = [];
      state.current = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload;
        if (!state.current && action.payload.length > 0) {
          state.current = action.payload[0]!;
        }
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch one
    builder
      .addCase(fetchBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        const idx = state.branches.findIndex((b) => b.id === action.payload.id);
        if (idx >= 0) state.branches[idx] = action.payload;
        else state.branches.push(action.payload);
      })
      .addCase(fetchBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create
    builder.addCase(createBranch.fulfilled, (state, action) => {
      state.branches.push(action.payload);
      if (!state.current) state.current = action.payload;
    });

    // Update
    builder.addCase(updateBranch.fulfilled, (state, action) => {
      const idx = state.branches.findIndex((b) => b.id === action.payload.id);
      if (idx >= 0) state.branches[idx] = action.payload;
      if (state.current?.id === action.payload.id) state.current = action.payload;
    });

    // Delete
    builder.addCase(deleteBranch.fulfilled, (state, action) => {
      state.branches = state.branches.filter((b) => b.id !== action.payload);
      if (state.current?.id === action.payload) {
        state.current = state.branches[0] ?? null;
      }
    });
  },
});

export const { setCurrentBranch, clearBranches, clearError } = branchSlice.actions;
export default branchSlice.reducer;
