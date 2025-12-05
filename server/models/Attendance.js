import mongoose from 'mongoose';
import { ATTENDANCE_STATUS } from '../utils/constants.js';

const attendanceSchema = new mongoose.Schema(
  {
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      required: [true, 'Child reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      required: [true, 'Status is required'],
      default: ATTENDANCE_STATUS.PRESENT,
    },
    
    // Check-in/Check-out times
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    
    // Who checked in/out the child
    checkInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    checkOutBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    
    // Staff who recorded attendance (can be null for admin)
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
    },
    
    // Temperature check (if applicable)
    temperature: {
      value: {
        type: Number,
        min: 30,
        max: 45,
      },
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius',
      },
    },
    
    // Notes
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    
    // Late arrival flag
    isLate: {
      type: Boolean,
      default: false,
    },
    
    // Early departure flag
    isEarlyDeparture: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ==================== INDEXES ====================
attendanceSchema.index({ child: 1, date: -1 });
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ child: 1, date: 1 }, { unique: true }); // One record per child per day

// ==================== VIRTUAL FIELDS ====================

// Virtual for duration (hours present)
attendanceSchema.virtual('duration').get(function () {
  if (!this.checkInTime || !this.checkOutTime) return null;
  
  const duration = this.checkOutTime - this.checkInTime;
  const hours = duration / (1000 * 60 * 60); // Convert ms to hours
  
  return Math.round(hours * 100) / 100; // Round to 2 decimal places
});

// ==================== METHODS ====================

// Check if child is currently checked in
attendanceSchema.methods.isCheckedIn = function () {
  return this.checkInTime && !this.checkOutTime;
};

// ==================== MIDDLEWARE ====================

// Set date to start of day (00:00:00) for consistency
attendanceSchema.pre('save', function (next) {
  if (this.date) {
    this.date = new Date(this.date.setHours(0, 0, 0, 0));
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
