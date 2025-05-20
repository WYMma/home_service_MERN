import mongoose from 'mongoose';

const businessSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    employees: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['manager', 'staff'],
        default: 'staff'
      },
      permissions: {
        manageBookings: {
          type: Boolean,
          default: true
        },
        manageServices: {
          type: Boolean,
          default: false
        },
        viewAnalytics: {
          type: Boolean,
          default: true
        },
        editProfile: {
          type: Boolean,
          default: false
        }
      }
    }],
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    website: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    workingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    images: [String],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending',
    }
  },
  {
    timestamps: true,
  }
);

// Add text index for search functionality
businessSchema.index({ name: 'text', description: 'text' });

const Business = mongoose.model('Business', businessSchema);

export default Business;
