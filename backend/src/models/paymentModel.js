import mongoose from 'mongoose';

const paymentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Business'
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'bank_transfer'],
    default: 'credit_card'
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  subscriptionType: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  subscriptionStartDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  subscriptionEndDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment; 