const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro_monthly', 'pro_plus_monthly', 'pro_annual', 'pro_plus_annual'],
    default: 'free'
  },
  planType: {
    type: String,
    enum: ['monthly', 'annual'],
    default: null
  },
  planTier: {
    type: String,
    enum: ['free', 'pro', 'pro_plus'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  paymentId: {
    type: String,
    sparse: true
  },
  autoRenew: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for checking if subscription is active
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.endDate > new Date();
});

// Method to check if subscription is expiring soon (within 7 days)
subscriptionSchema.methods.isExpiringSoon = function() {
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return this.endDate <= sevenDaysFromNow && this.endDate > new Date();
};

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);