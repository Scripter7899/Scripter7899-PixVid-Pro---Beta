const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  body: {
    type: String,
    required: true,
    maxlength: 300
  },
  icon: {
    type: String,
    default: '/favicon.ico'
  },
  badge: {
    type: String,
    default: '/favicon.ico'
  },
  image: {
    type: String
  },
  url: {
    type: String,
    default: '/'
  },
  tag: {
    type: String,
    index: true
  },
  type: {
    type: String,
    enum: ['broadcast', 'targeted', 'personal'],
    default: 'broadcast',
    index: true
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  targetPlans: [{
    type: String,
    enum: ['free', 'premium', 'pro']
  }],
  createdBy: {
    type: String, // Admin email
    required: true
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'cancelled'],
    default: 'draft',
    index: true
  },
  stats: {
    totalSent: {
      type: Number,
      default: 0
    },
    successCount: {
      type: Number,
      default: 0
    },
    failureCount: {
      type: Number,
      default: 0
    },
    clickCount: {
      type: Number,
      default: 0
    }
  },
  options: {
    requireInteraction: {
      type: Boolean,
      default: false
    },
    silent: {
      type: Boolean,
      default: false
    },
    ttl: {
      type: Number,
      default: 2419200 // 28 days
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ type: 1, createdBy: 1 });
notificationSchema.index({ createdAt: -1 });

// Method to mark as sent
notificationSchema.methods.markAsSent = function(stats = {}) {
  this.status = 'sent';
  this.stats = { ...this.stats.toObject(), ...stats };
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);

