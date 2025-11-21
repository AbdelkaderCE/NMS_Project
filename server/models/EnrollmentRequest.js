import mongoose from 'mongoose';

const enrollmentRequestSchema = new mongoose.Schema({
  // Request Type
  requestType: {
    type: String,
    enum: ['public', 'parent'],
    required: true,
    default: 'public'
  },

  // Child Information
  child: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true
    },
    medicalInfo: {
      bloodType: String,
      allergies: [String],
      medications: [String],
      conditions: [String],
      doctorName: String,
      doctorPhone: String,
      insuranceProvider: String,
      insuranceNumber: String
    },
    dietaryRestrictions: [String],
    photo: String
  },

  // Parent Information (for public requests)
  parentInfo: {
    firstName: {
      type: String,
      required: function() { return this.requestType === 'public'; },
      trim: true
    },
    lastName: {
      type: String,
      required: function() { return this.requestType === 'public'; },
      trim: true
    },
    email: {
      type: String,
      required: function() { return this.requestType === 'public'; },
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: function() { return this.requestType === 'public'; }
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    relationship: {
      type: String,
      enum: ['mother', 'father', 'guardian'],
      default: 'mother'
    }
  },

  // If request from logged-in parent
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.requestType === 'parent'; }
  },

  // Emergency Contacts
  emergencyContacts: [{
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: String
  }],

  // Class Preference
  preferredClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },

  // Request Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },

  // Admin Actions
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  rejectionReason: String,

  // Created Child & Parent (after acceptance)
  createdChildId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child'
  },
  createdParentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },

  // Notes
  notes: String

}, {
  timestamps: true
});

// Indexes
enrollmentRequestSchema.index({ status: 1, createdAt: -1 });
enrollmentRequestSchema.index({ 'parentInfo.email': 1 });

export default mongoose.model('EnrollmentRequest', enrollmentRequestSchema);
