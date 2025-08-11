const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  sourceImages: [{
    originalName: String,
    filename: String,
    path: String,
    size: Number,
    isReference: {
      type: Boolean,
      default: false
    }
  }],
  settings: {
    duration: {
      type: Number,
      min: 1,
      max: 10,
      default: 3
    },
    style: {
      type: String,
      enum: ['zoom-in', 'zoom-out', 'pan-left', 'pan-right', 'fade', 'rotate', 'parallax'],
      default: 'zoom-in'
    },
    quality: {
      type: String,
      enum: ['hd', 'fhd', '4k'],
      default: 'hd'
    },
    aiStyle: {
      type: String,
      enum: ['auto', 'cinematic', 'natural', 'artistic', 'dynamic'],
      default: 'auto'
    },
    aspectRatio: {
      type: String,
      enum: ['16:9', '9:16', '1:1'],
      default: '16:9'
    },
    motionType: {
      type: String,
      enum: ['gentle', 'smooth', 'dynamic', 'cinematic'],
      default: 'gentle'
    },
    motionIntensity: {
      type: Number,
      min: 10,
      max: 100,
      default: 50
    },
    prompt: String,
    enhancedPrompt: String,
    music: {
      type: String,
      enum: ['none', 'upbeat', 'ambient', 'cinematic', 'electronic', 'acoustic', 'epic', 'custom'],
      default: 'none'
    },
    customAudio: {
      originalName: String,
      filename: String,
      path: String,
      size: Number
    }
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'queued'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  currentStage: String,
  processingStarted: Date,
  processingCompleted: Date,
  estimatedTime: Number,
  actualTime: Number,
  retryCount: {
    type: Number,
    default: 0,
    max: 3
  },
  errorMessage: String,
  outputVideo: {
    filename: String,
    path: String,
    size: Number,
    duration: Number,
    resolution: String,
    format: String,
    downloadUrl: String
  },
  thumbnail: {
    filename: String,
    path: String,
    size: Number
  },
  metadata: {
    processingNode: String,
    aiModel: String,
    compressionRatio: Number,
    originalSize: Number,
    compressedSize: Number
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  publicAt: Date,
  category: {
    type: String,
    enum: ['cinematic', 'artistic', 'commercial', 'personal', 'experimental'],
    default: 'personal'
  },
  tags: [String],
  comments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      maxlength: 200
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date,
    default: function() {
      // Videos expire after 24 hours for free users, never for premium
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
videoSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
videoSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Virtual for processing duration
videoSchema.virtual('processingDuration').get(function() {
  if (this.processingStarted && this.processingCompleted) {
    return this.processingCompleted - this.processingStarted;
  }
  return null;
});

// Instance method to check if user can access video
videoSchema.methods.canAccess = function(userId) {
  return this.user.toString() === userId.toString() || this.isPublic;
};

// Instance method to toggle like
videoSchema.methods.toggleLike = async function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (existingLike) {
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
    this.analytics.likes = Math.max(0, this.analytics.likes - 1);
  } else {
    this.likes.push({ user: userId });
    this.analytics.likes += 1;
  }
  
  return this.save();
};

// Instance method to add comment
videoSchema.methods.addComment = async function(userId, text) {
  this.comments.push({ user: userId, text });
  return this.save();
};

// Instance method to track view
videoSchema.methods.trackView = async function() {
  this.analytics.views += 1;
  return this.save();
};

// Instance method to track download
videoSchema.methods.trackDownload = async function() {
  this.analytics.downloads += 1;
  return this.save();
};

// Pre-save middleware to set expiry based on user plan
videoSchema.pre('save', async function(next) {
  if (this.isNew) {
    const User = mongoose.model('User');
    const user = await User.findById(this.user);
    
    if (user && user.plan !== 'free') {
      // Premium users - videos don't expire
      this.expiresAt = undefined;
    }
  }
  next();
});

// Index for better query performance
videoSchema.index({ user: 1, createdAt: -1 });
videoSchema.index({ status: 1 });
videoSchema.index({ isPublic: 1, createdAt: -1 });
videoSchema.index({ category: 1 });
videoSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Video', videoSchema);
