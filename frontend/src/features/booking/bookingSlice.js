import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingApi } from '../../services/api';

// Create booking
export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingApi.create(bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get user bookings
export const getUserBookings = createAsyncThunk(
  'booking/getUserBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingApi.getUserBookings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get business bookings
export const getBusinessBookings = createAsyncThunk(
  'booking/getBusinessBookings',
  async ({ businessId, page, limit }, { rejectWithValue }) => {
    try {
      const response = await bookingApi.getBusinessBookings(businessId, { page, limit });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update booking status
export const updateBookingStatus = createAsyncThunk(
  'booking/updateStatus',
  async ({ bookingId, status, cancellationReason }, { rejectWithValue }) => {
    try {
      const response = await bookingApi.updateStatus(bookingId, { status, cancellationReason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get available slots
export const getAvailableSlots = createAsyncThunk(
  'booking/getAvailableSlots',
  async ({ businessId, date }, { rejectWithValue }) => {
    try {
      const response = await bookingApi.getAvailableSlots(businessId, date);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    bookings: [],
    availableSlots: [],
    loading: false,
    error: null,
    success: false,
    totalPages: 0,
    currentPage: 1,
  },
  reducers: {
    resetBookingState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearAvailableSlots: (state) => {
      state.availableSlots = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload);
        state.success = true;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Get user bookings
      .addCase(getUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get business bookings
      .addCase(getBusinessBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBusinessBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getBusinessBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update booking status
      .addCase(updateBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = state.bookings.map((booking) =>
          booking._id === action.payload._id ? action.payload : booking
        );
        state.success = true;
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Get available slots
      .addCase(getAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload.slots;
      })
      .addCase(getAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetBookingState, clearAvailableSlots } = bookingSlice.actions;
export default bookingSlice.reducer;
