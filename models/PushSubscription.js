const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  endpoint: {
    type: String,
    required: true
  },
  keys: {
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    }
  },
  userAgent: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
pushSubscriptionSchema.index({ user: 1, isActive: 1 });
pushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });

// Method to deactivate subscription
pushSubscriptionSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);

