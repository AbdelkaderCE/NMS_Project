import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    // Owner (can be child, staff, or general nursery document)
    relatedTo: {
      entityType: {
        type: String,
        enum: ['child', 'staff', 'nursery'],
        required: true,
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedTo.entityModel',
        default: null,
      },
      entityModel: {
        type: String,
        enum: ['Child', 'Staff', ''],
        default: '',
      },
    },
    
    // Document Details
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    
    // Document Type
    type: {
      type: String,
      enum: [
        'birth_certificate',
        'medical_record',
        'vaccination_record',
        'insurance',
        'contract',
        'policy',
        'report',
        'certificate',
        'id_document',
        'photo',
        'other',
      ],
      required: [true, 'Document type is required'],
    },
    
    // File Information
    file: {
      filename: {
        type: String,
        required: true,
      },
      originalName: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      fileType: {
        type: String,
        required: true,
      },
      fileSize: {
        type: Number,
        required: true,
      },
      mimeType: String,
    },
    
    // Expiry (for documents like insurance, certificates)
    expiryDate: {
      type: Date,
      default: null,
    },
    
    // Access Control
    isPrivate: {
      type: Boolean,
      default: true,
    },
    accessibleBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    
    // Uploaded by
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required'],
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Version control (for updated documents)
    version: {
      type: Number,
      default: 1,
    },
    previousVersions: [
      {
        version: Number,
        url: String,
        uploadedAt: Date,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    
    // Tags for better organization
    tags: [String],
    
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
documentSchema.index({ 'relatedTo.entityType': 1, 'relatedTo.entityId': 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ expiryDate: 1 });
documentSchema.index({ isActive: 1 });

// ==================== VIRTUAL FIELDS ====================

// Check if document is expired
documentSchema.virtual('isExpired').get(function () {
  if (!this.expiryDate) return false;
  return new Date() > new Date(this.expiryDate);
});

// Days until expiry
documentSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiryDate) return null;
  
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  
  if (today > expiry) return 0;
  
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

const Document = mongoose.model('Document', documentSchema);

export default Document;
