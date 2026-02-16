import mongoose from 'mongoose';

const dailyReportSchema = new mongoose.Schema(
  {
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      required: [true, 'Child reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    // Attendance Info
    attendance: {
      status: {
        type: String,
        enum: ['present', 'absent', 'late', 'left_early'],
      },
      checkIn: Date,
      checkOut: Date,
    },
    // Meals
    meals: {
      breakfast: {
        consumed: {
          type: String,
          enum: ['all', 'most', 'some', 'none', 'not_applicable'],
          default: 'not_applicable',
        },
        notes: String,
      },
      lunch: {
        consumed: {
          type: String,
          enum: ['all', 'most', 'some', 'none', 'not_applicable'],
          default: 'not_applicable',
        },
        notes: String,
      },
      snacks: {
        consumed: {
          type: String,
          enum: ['all', 'most', 'some', 'none', 'not_applicable'],
          default: 'not_applicable',
        },
        notes: String,
      },
    },
    // Naps/Sleep
    naps: [
      {
        startTime: {
          type: String, // HH:MM format
          required: true,
        },
        endTime: {
          type: String, // HH:MM format
          required: true,
        },
        quality: {
          type: String,
          enum: ['excellent', 'good', 'fair', 'poor', 'restless'],
          default: 'good',
        },
        notes: String,
      },
    ],
    // Diaper Changes (for younger children)
    diaperChanges: [
      {
        time: {
          type: String, // HH:MM format
          required: true,
        },
        type: {
          type: String,
          enum: ['wet', 'soiled', 'dry'],
          required: true,
        },
      },
    ],
    // Mood & Behavior
    mood: {
      morning: {
        type: String,
        enum: ['happy', 'content', 'fussy', 'cranky', 'sleepy', 'energetic'],
      },
      afternoon: {
        type: String,
        enum: ['happy', 'content', 'fussy', 'cranky', 'sleepy', 'energetic'],
      },
      overall: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'challenging'],
      },
      notes: String,
    },
    // Activities participated in
    activities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
      },
    ],
    // Incidents (accidents, behavioral issues, etc.)
    incidents: [
      {
        time: String,
        description: {
          type: String,
          required: true,
        },
        actionTaken: String,
        severity: {
          type: String,
          enum: ['minor', 'moderate', 'serious'],
          default: 'minor',
        },
      },
    ],
    // General notes from teacher
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    // Report status
    status: {
      type: String,
      enum: ['draft', 'completed', 'sent'],
      default: 'draft',
    },
    // Who created/completed the report
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    completedAt: Date,
    sentAt: Date,
    // Parent notification
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
dailyReportSchema.index({ child: 1, date: 1 }, { unique: true }); // One report per child per day
dailyReportSchema.index({ date: 1 });
dailyReportSchema.index({ status: 1 });
dailyReportSchema.index({ createdBy: 1 });

// Virtual for duration calculations
dailyReportSchema.virtual('totalNapDuration').get(function () {
  if (!this.naps || this.naps.length === 0) return 0;
  
  return this.naps.reduce((total, nap) => {
    const [startHour, startMin] = nap.startTime.split(':').map(Number);
    const [endHour, endMin] = nap.endTime.split(':').map(Number);
    const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    return total + minutes;
  }, 0);
});

// Pre-save middleware
dailyReportSchema.pre('save', function (next) {
  // Set completedAt when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Set sentAt when status changes to sent
  if (this.isModified('status') && this.status === 'sent' && !this.sentAt) {
    this.sentAt = new Date();
  }
  
  next();
});

// Instance method to mark as completed
dailyReportSchema.methods.complete = async function () {
  this.status = 'completed';
  this.completedAt = new Date();
  return await this.save();
};

// Instance method to mark as sent
dailyReportSchema.methods.markAsSent = async function () {
  this.status = 'sent';
  this.sentAt = new Date();
  this.notificationSent = true;
  return await this.save();
};

// Static method to get report for specific child and date
dailyReportSchema.statics.getByChildAndDate = async function (childId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await this.findOne({
    child: childId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });
};

const DailyReport = mongoose.model('DailyReport', dailyReportSchema);

export default DailyReport;
