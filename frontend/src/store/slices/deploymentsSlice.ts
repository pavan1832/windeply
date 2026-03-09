import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api, Deployment } from '../../lib/api';

interface DeploymentsState {
  items: Deployment[];
  loading: boolean;
  error: string | null;
  executing: string[];
}

const initialState: DeploymentsState = { items: [], loading: false, error: null, executing: [] };

export const fetchDeployments = createAsyncThunk('deployments/fetchAll', async () => {
  return await api.getDeployments();
});

export const executeDeployment = createAsyncThunk('deployments/execute', async (id: string) => {
  await api.executeDeployment(id);
  return id;
});

const deploymentsSlice = createSlice({
  name: 'deployments',
  initialState,
  reducers: {
    updateDeploymentStatus: (state, action: PayloadAction<{ id: string; status: Deployment['status']; current_step?: number }>) => {
      const dep = state.items.find(d => d.id === action.payload.id);
      if (dep) {
        dep.status = action.payload.status;
        if (action.payload.current_step !== undefined) dep.current_step = action.payload.current_step;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeployments.pending, (state) => { state.loading = true; })
      .addCase(fetchDeployments.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchDeployments.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed'; })
      .addCase(executeDeployment.pending, (state, action) => { state.executing.push(action.meta.arg); })
      .addCase(executeDeployment.fulfilled, (state, action) => {
        state.executing = state.executing.filter(id => id !== action.payload);
        const dep = state.items.find(d => d.id === action.payload);
        if (dep) dep.status = 'running';
      })
      .addCase(executeDeployment.rejected, (state, action) => {
        state.executing = state.executing.filter(id => id !== action.meta.arg);
      });
  },
});

export const { updateDeploymentStatus } = deploymentsSlice.actions;
export default deploymentsSlice.reducer;
