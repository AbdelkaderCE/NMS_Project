import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    // Activity can be for individual child, group, or entire class
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      default: null,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    
    // Activity Type
    type: {
      type: String,
      enum: ['meal', 'nap', 'activity', 'learning', 'play', 'outdoor', 'incident', 'other'],
      required: [true, 'Activity type is required'],
    },
    
    // Activity Details
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    
    // Time
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      default: null,
    },
    
    // Meal-specific fields
    mealDetails: {
      mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'snack', 'dinner', ''],
      },
      foodItems: [String],
      amountEaten: {
        type: String,
        enum: ['none', 'little', 'half', 'most', 'all', ''],
      },
      notes: String,
    },
    
    // Nap-specific fields
    napDetails: {
      napStartTime: Date,
      napEndTime: Date,
      quality: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent', ''],
      },
      notes: String,
    },
    
    // Incident-specific fields (falls, injuries, etc.)
    incidentDetails: {
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical', ''],
      },
      injuryType: String,
      bodyPart: String,
      treatmentGiven: String,
      parentNotified: {
        type: Boolean,
        default: false,
      },
      notifiedAt: Date,
      requiresFollowUp: {
        type: Boolean,
        default: false,
      },
    },
    
    // Photos/Media
    photos: [
      {
        url: String,
        caption: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Staff who logged the activity (optional for admin users)
    loggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
    },
    
    // Parent visibility
    visibleToParents: {
      type: Boolean,
      default: true,
    },
    
    // Parent acknowledgment
    acknowledgedBy: [
      {
        parent: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        acknowledgedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Additional notes
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
activitySchema.index({ child: 1, date: -1 });
activitySchema.index({ date: -1 });
activitySchema.index({ type: 1 });
activitySchema.index({ loggedBy: 1 });

// ==================== VIRTUAL FIELDS ====================

// Virtual for duration (hours)
activitySchema.virtual('duration').get(function () {
  if (!this.startTime || !this.endTime) return null;
  
  const duration = this.endTime - this.startTime;
  const hours = duration / (1000 * 60 * 60); // Convert ms to hours
  
  return Math.round(hours * 100) / 100; // Round to 2 decimal places
});

// Virtual for nap duration
activitySchema.virtual('napDuration').get(function () {
  if (!this.napDetails?.napStartTime || !this.napDetails?.napEndTime) return null;
  
  const duration = this.napDetails.napEndTime - this.napDetails.napStartTime;
  const minutes = duration / (1000 * 60); // Convert ms to minutes
  
  return Math.round(minutes);
});

// ==================== METHODS ====================

// Validate at least one target is provided
activitySchema.pre('validate', function (next) {
  if (!this.child && !this.group && !this.class) {
    next(new Error('Activity must target at least one: child, group, or class'));
  }
  next();
});

// Check if parent has acknowledged
activitySchema.methods.isAcknowledgedBy = function (parentId) {
  return this.acknowledgedBy.some(
    (ack) => ack.parent.toString() === parentId.toString()
  );
};

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
