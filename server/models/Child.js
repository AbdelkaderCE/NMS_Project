import mongoose from 'mongoose';
import { CHILD_STATUS } from '../utils/constants.js';

const childSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Child first name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Child last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    photo: {
      type: String,
      default: null,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CHILD_STATUS),
      default: CHILD_STATUS.ACTIVE,
    },
    
    // Parent Relations (Multiple parents supported)
    parents: [
      {
        parent: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        relationship: {
          type: String,
          enum: ['mother', 'father', 'guardian', 'other'],
          required: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Assigned Class/Group
    classGroup: {
      type: String,
      trim: true,
    },
    
    // Medical Information
    medicalInfo: {
      bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      },
      allergies: [
        {
          name: String,
          severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe'],
          },
          notes: String,
        },
      ],
      medications: [
        {
          name: String,
          dosage: String,
          frequency: String,
          notes: String,
        },
      ],
      conditions: [String],
      doctorName: String,
      doctorPhone: String,
      insuranceProvider: String,
      insuranceNumber: String,
    },

    // Emergency Contacts
    emergencyContacts: [
      {
        name: {
          type: String,
          required: true,
        },
        relationship: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
        email: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Class and Group Assignment
    assignedClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
    },
    assignedGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null,
    },

    // Special Notes
    specialNeeds: {
      type: String,
      maxlength: [500, 'Special needs cannot exceed 500 characters'],
    },
    dietaryRestrictions: [String],
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
childSchema.index({ status: 1 });
childSchema.index({ 'parents.parent': 1 });
childSchema.index({ enrollmentDate: -1 });
childSchema.index({ firstName: 1, lastName: 1 });

// ==================== VIRTUAL FIELDS ====================

// Virtual for full name
childSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
childSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual populate - attendance records
childSchema.virtual('attendanceRecords', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'child',
  justOne: false,
});

// Virtual populate - activities
childSchema.virtual('activities', {
  ref: 'Activity',
  localField: '_id',
  foreignField: 'child',
  justOne: false,
});

// Virtual populate - payments
childSchema.virtual('payments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'child',
  justOne: false,
});

// ==================== MIDDLEWARE ====================

// Validate at least one parent exists
childSchema.pre('save', function (next) {
  if (!this.parents || this.parents.length === 0) {
    return next(new Error('At least one parent is required'));
  }
  next();
});

// Ensure only one primary parent
childSchema.pre('save', function (next) {
  const primaryParents = this.parents.filter((p) => p.isPrimary);
  if (primaryParents.length > 1) {
    return next(new Error('Only one primary parent is allowed'));
  }
  next();
});

const Child = mongoose.model('Child', childSchema);

export default Child;
