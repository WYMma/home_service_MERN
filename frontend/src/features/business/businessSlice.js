import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { businessApi } from '../../services/api';

// Get all businesses
export const getBusinesses = createAsyncThunk(
  'business/getBusinesses',
  async ({ category, search, page, limit } = {}, { rejectWithValue }) => {
    try {
      const response = await businessApi.getAll({ category, search, page, limit });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get business by ID
export const getBusinessById = createAsyncThunk(
  'business/getBusinessById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await businessApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get business profile
export const getBusinessProfile = createAsyncThunk(
  'business/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await businessApi.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update business profile
export const updateBusinessProfile = createAsyncThunk(
  'business/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await businessApi.updateProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get business services
export const getBusinessServices = createAsyncThunk(
  'business/getServices',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await businessApi.getServices(businessId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create business service
export const createBusinessService = createAsyncThunk(
  'business/createService',
  async (serviceData, { rejectWithValue }) => {
    try {
      const response = await businessApi.createService(serviceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update business service
export const updateBusinessService = createAsyncThunk(
  'business/updateService',
  async ({ serviceId, serviceData }, { rejectWithValue }) => {
    try {
      const response = await businessApi.updateService(serviceId, serviceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete business service
export const deleteBusinessService = createAsyncThunk(
  'business/deleteService',
  async (serviceId, { rejectWithValue }) => {
    try {
      await businessApi.deleteService(serviceId);
      return serviceId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const businessSlice = createSlice({
  name: 'business',
  initialState: {
    businesses: [],
    currentBusiness: null,
    businessProfile: null,
    services: [],
    loading: false,
    error: null,
    success: false,
    totalPages: 0,
    currentPage: 1,
  },
  reducers: {
    resetBusinessState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get businesses
      .addCase(getBusinesses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBusinesses.fulfilled, (state, action) => {
        state.loading = false;
        state.businesses = action.payload.businesses;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getBusinesses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get business by ID
      .addCase(getBusinessById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBusinessById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBusiness = action.payload;
      })
      .addCase(getBusinessById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get business profile
      .addCase(getBusinessProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBusinessProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.businessProfile = action.payload;
      })
      .addCase(getBusinessProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update business profile
      .addCase(updateBusinessProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBusinessProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.businessProfile = action.payload;
        state.success = true;
      })
      .addCase(updateBusinessProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Get business services
      .addCase(getBusinessServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBusinessServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(getBusinessServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create business service
      .addCase(createBusinessService.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBusinessService.fulfilled, (state, action) => {
        state.loading = false;
        state.services.push(action.payload);
        state.success = true;
      })
      .addCase(createBusinessService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update business service
      .addCase(updateBusinessService.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBusinessService.fulfilled, (state, action) => {
        state.loading = false;
        state.services = state.services.map((service) =>
          service._id === action.payload._id ? action.payload : service
        );
        state.success = true;
      })
      .addCase(updateBusinessService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete business service
      .addCase(deleteBusinessService.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteBusinessService.fulfilled, (state, action) => {
        state.loading = false;
        state.services = state.services.filter(
          (service) => service._id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteBusinessService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetBusinessState } = businessSlice.actions;
export default businessSlice.reducer;
