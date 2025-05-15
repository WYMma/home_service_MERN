import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsApi } from '../../services/api';

// Get business analytics
export const getBusinessAnalytics = createAsyncThunk(
  'analytics/getBusinessAnalytics',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await analyticsApi.getBusinessAnalytics(businessId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get business insights
export const getBusinessInsights = createAsyncThunk(
  'analytics/getBusinessInsights',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await analyticsApi.getBusinessInsights(businessId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    analytics: {
      totalBookings: 0,
      totalRevenue: 0,
      averageRating: 0,
      bookingsByMonth: [],
      revenueByMonth: [],
      popularServices: []
    },
    insights: {
      bookingTrends: [],
      retentionRate: 0,
      customerStats: {
        total: 0,
        returning: 0
      }
    },
    loading: false,
    error: null
  },
  reducers: {
    resetAnalyticsState: (state) => {
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get business analytics
      .addCase(getBusinessAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBusinessAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(getBusinessAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get business insights
      .addCase(getBusinessInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBusinessInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload;
      })
      .addCase(getBusinessInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetAnalyticsState } = analyticsSlice.actions;
export default analyticsSlice.reducer;
