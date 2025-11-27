import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    // Who performed the action
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },

    // What action was performed
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE', 'PAYMENT'],
      required: true,
    },
    
    // What resource was affected
    resourceType: {
      type: String,
      enum: ['Child', 'Staff', 'Payment', 'User', 'Attendance', 'Activity', 'Group', 'Class'],
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    resourceName: {
      type: String, // Human-readable name (e.g., "John Doe", "Invoice #123")
    },

    // Details of the change
    changes: {
      type: mongoose.Schema.Types.Mixed, // Flexible object to store before/after
      default: {},
    },
    
    // Additional context
    description: {
      type: String,
      maxlength: 500,
    },
    
    // IP address and user agent for security
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
