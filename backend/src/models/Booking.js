import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  service: {
    name: String,
    price: Number,
    duration: Number
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  notes: String,
  cancellationReason: String
}, {
  timestamps: true
});

// Index for querying bookings
bookingSchema.index({ business: 1, date: 1 });
bookingSchema.index({ user: 1, date: -1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
