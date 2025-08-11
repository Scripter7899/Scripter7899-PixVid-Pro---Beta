const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return email.endsWith('@gmail.com');
      },
      message: 'Only Gmail accounts are allowed'
    }
  },
  password: {
    type: String,
    required: false, // Not required for OAuth users
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values to be unique
  },
  picture: {
    type: String // Google profile picture URL
  },
  authProvider: {
    type: String,
    enum: ['google', 'local'],
    default: 'google'
  },
  avatar: {
    type: String,
    default: null
  },
  plan: {
    type: String,
    enum: ['free', 'pro_monthly', 'pro_annual', 'pro_plus_monthly', 'pro_plus_annual'],
    default: 'free'
  },
  planExpiry: {
    type: Date,
    default: null
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'pro_monthly', 'pro_annual', 'pro_plus_monthly', 'pro_plus_annual'],
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'cancelled'],
    default: 'active'
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  creditsUsed: {
    type: Number,
    default: 0
  },
  totalVideos: {
    type: Number,
    default: 0
  },
  preferences: {
    autoEnhancePrompt: {
      type: Boolean,
      default: false
    },
    defaultMotion: {
      type: String,
      enum: ['gentle', 'smooth', 'dynamic', 'cinematic'],
      default: 'gentle'
    },
    defaultAspectRatio: {
      type: String,
      enum: ['16:9', '9:16', '1:1'],
      default: '16:9'
    },
    compressionEnabled: {
      type: Boolean,
      default: true
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for remaining credits
userSchema.virtual('remainingCredits').get(function() {
  const maxCredits = this.getMaxCredits();
  return Math.max(0, maxCredits - this.creditsUsed);
});

// Virtual for plan features
userSchema.virtual('planFeatures').get(function() {
  const plans = {
    free: {
      maxCredits: 2,
      maxConcurrentJobs: 1,
      maxQuality: 'hd',
      hasWatermark: true,
      canUploadAudio: false,
      canUseReferenceImages: false,
      hasApiAccess: false
    },
    pro_monthly: {
      maxCredits: -1, // unlimited
      maxConcurrentJobs: 3,
      maxQuality: 'fhd',
      hasWatermark: false,
      canUploadAudio: true,
      canUseReferenceImages: true,
      hasApiAccess: false
    },
    pro_annual: {
      maxCredits: -1,
      maxConcurrentJobs: 3,
      maxQuality: 'fhd',
      hasWatermark: false,
      canUploadAudio: true,
      canUseReferenceImages: true,
      hasApiAccess: false
    },
    pro_plus_monthly: {
      maxCredits: -1,
      maxConcurrentJobs: 5,
      maxQuality: '4k',
      hasWatermark: false,
      canUploadAudio: true,
      canUseReferenceImages: true,
      hasApiAccess: true
    },
    pro_plus_annual: {
      maxCredits: -1,
      maxConcurrentJobs: 5,
      maxQuality: '4k',
      hasWatermark: false,
      canUploadAudio: true,
      canUseReferenceImages: true,
      hasApiAccess: true
    }
  };
  return plans[this.plan] || plans.free;
});

// Instance method to get max credits
userSchema.methods.getMaxCredits = function() {
  return this.planFeatures.maxCredits === -1 ? Infinity : this.planFeatures.maxCredits;
};

// Instance method to check if user has remaining credits
userSchema.methods.hasCredits = function(required = 1) {
  if (this.planFeatures.maxCredits === -1) return true;
  return this.remainingCredits >= required;
};

// Instance method to consume credits
userSchema.methods.consumeCredits = function(amount = 1) {
  if (this.planFeatures.maxCredits !== -1) {
    this.creditsUsed += amount;
  }
  this.totalVideos += amount;
  return this.save();
};

// Instance method to reset weekly credits
userSchema.methods.resetWeeklyCredits = function() {
  this.creditsUsed = 0;
  return this.save();
};

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ plan: 1 });
userSchema.index({ createdAt: 1 });

module.exports = mongoose.model('User', userSchema);
