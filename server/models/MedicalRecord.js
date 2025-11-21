import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
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
    
    // Record Type
    type: {
      type: String,
      enum: ['checkup', 'vaccination', 'illness', 'injury', 'medication', 'other'],
      required: [true, 'Medical record type is required'],
    },
    
    // Details
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    
    // Vaccination details
    vaccinationDetails: {
      vaccineName: String,
      vaccineType: String,
      doseNumber: Number,
      nextDueDate: Date,
      administeredBy: String,
      batchNumber: String,
    },
    
    // Medication details
    medicationDetails: {
      medicationName: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date,
      prescribedBy: String,
      sideEffects: String,
    },
    
    // Vital signs
    vitals: {
      temperature: Number,
      temperatureUnit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius',
      },
      heartRate: Number,
      bloodPressure: String,
      weight: Number,
      weightUnit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg',
      },
      height: Number,
      heightUnit: {
        type: String,
        enum: ['cm', 'inches'],
        default: 'cm',
      },
    },
    
    // Documents
    documents: [
      {
        filename: String,
        url: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Staff who recorded
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: [true, 'Staff reference is required'],
    },
    
    // Follow-up
    requiresFollowUp: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    followUpNotes: String,
    
    // Parent notification
    parentNotified: {
      type: Boolean,
      default: false,
    },
    notifiedAt: {
      type: Date,
      default: null,
    },
    
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// ==================== INDEXES ====================
medicalRecordSchema.index({ child: 1, date: -1 });
medicalRecordSchema.index({ type: 1 });
medicalRecordSchema.index({ requiresFollowUp: 1, followUpDate: 1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;
