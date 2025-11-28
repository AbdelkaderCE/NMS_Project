import mongoose from 'mongoose';
import { STAFF_POSITION } from '../utils/constants.js';

const staffSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true,
    },
    position: {
      type: String,
      enum: Object.values(STAFF_POSITION),
      required: [true, 'Position is required'],
    },
    department: {
      type: String,
      trim: true,
    },
    hireDate: {
      type: Date,
      required: [true, 'Hire date is required'],
      default: Date.now,
    },
    
    // Qualifications
    qualifications: [
      {
        degree: String,
        institution: String,
        year: Number,
        field: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuedBy: String,
        issuedDate: Date,
        expiryDate: Date,
        certificateNumber: String,
      },
    ],
    
    // Employment Details
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'temporary'],
      default: 'full-time',
    },
    salary: {
      amount: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
      payFrequency: {
        type: String,
        enum: ['hourly', 'weekly', 'bi-weekly', 'monthly', 'annually'],
        default: 'monthly',
      },
    },
    
    // Schedule
    schedule: {
      workDays: {
        type: [String],
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      },
      startTime: {
        type: String, // Format: "HH:MM"
        default: '08:00',
      },
      endTime: {
        type: String, // Format: "HH:MM"
        default: '17:00',
      },
    },
    
    // Assigned Classes/Groups
    assignedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
      },
    ],
    
    // Emergency Contact
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String,
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    terminationDate: {
      type: Date,
      default: null,
    },
    terminationReason: {
      type: String,
      maxlength: [500, 'Termination reason cannot exceed 500 characters'],
    },
    
    // Performance & Notes
    performanceRatings: [
      {
        date: Date,
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        comments: String,
      },
    ],
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
staffSchema.index({ user: 1 }, { unique: true });
staffSchema.index({ employeeId: 1 }, { unique: true });
staffSchema.index({ position: 1 });
staffSchema.index({ isActive: 1 });

// ==================== VIRTUAL FIELDS ====================

// Virtual for years of service
staffSchema.virtual('yearsOfService').get(function () {
  if (!this.hireDate) return 0;
  
  const today = new Date();
  const hireDate = new Date(this.hireDate);
  const years = today.getFullYear() - hireDate.getFullYear();
  
  return years;
});

// Virtual populate - activities logged
staffSchema.virtual('activitiesLogged', {
  ref: 'Activity',
  localField: '_id',
  foreignField: 'loggedBy',
  justOne: false,
});

// ==================== METHODS ====================

// Check if staff is currently employed
staffSchema.methods.isCurrentlyEmployed = function () {
  return this.isActive && !this.terminationDate;
};

// Get latest performance rating
staffSchema.methods.getLatestRating = function () {
  if (!this.performanceRatings || this.performanceRatings.length === 0) {
    return null;
  }
  
  return this.performanceRatings
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
};

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;
