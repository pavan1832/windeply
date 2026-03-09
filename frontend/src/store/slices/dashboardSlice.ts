import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, DashboardStats } from '../../lib/api';

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = { stats: null, loading: false, error: null };

export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async () => {
  return await api.getDashboardStats();
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload; })
      .addCase(fetchDashboardStats.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to fetch'; });
  },
});

export default dashboardSlice.reducer;
