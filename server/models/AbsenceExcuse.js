import mongoose from 'mongoose';

const absenceExcuseSchema = new mongoose.Schema(
  {
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      required: [true, 'Child reference is required'],
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Parent/guardian reference is required'],
    },
    absenceDate: {
      type: Date,
      required: [true, 'Absence date is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for absence is required'],
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNotes: {
      type: String,
      maxlength: [500, 'Review notes cannot exceed 500 characters'],
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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

// Index for efficient queries
absenceExcuseSchema.index({ child: 1, absenceDate: 1 });
absenceExcuseSchema.index({ submittedBy: 1 });
absenceExcuseSchema.index({ status: 1 });
absenceExcuseSchema.index({ reviewedBy: 1 });

// Virtual for days since submission
absenceExcuseSchema.virtual('daysSinceSubmission').get(function () {
  if (!this.createdAt) return 0;
  const diff = Date.now() - this.createdAt.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to validate absence date
absenceExcuseSchema.pre('save', function (next) {
  // Absence date should not be too far in the future (max 7 days)
  const maxFutureDate = new Date();
  maxFutureDate.setDate(maxFutureDate.getDate() + 7);
  
  if (this.absenceDate > maxFutureDate) {
    return next(new Error('Absence date cannot be more than 7 days in the future'));
  }
  
  next();
});

// Instance method to approve excuse
absenceExcuseSchema.methods.approve = async function (staffId, notes = '') {
  this.status = 'approved';
  this.reviewedBy = staffId;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  return await this.save();
};

// Instance method to reject excuse
absenceExcuseSchema.methods.reject = async function (staffId, notes = '') {
  this.status = 'rejected';
  this.reviewedBy = staffId;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  return await this.save();
};

// Static method to get pending excuses for a teacher's classes
absenceExcuseSchema.statics.getPendingForTeacher = async function (teacherId) {
  const Staff = mongoose.model('Staff');
  const Child = mongoose.model('Child');
  
  // Get teacher's assigned classes
  const teacher = await Staff.findOne({ user: teacherId }).select('assignedClasses');
  if (!teacher || !teacher.assignedClasses || teacher.assignedClasses.length === 0) {
    return [];
  }
  
  // Get children in teacher's classes
  const children = await Child.find({
    assignedClass: { $in: teacher.assignedClasses },
  }).select('_id');
  
  const childIds = children.map((c) => c._id);
  
  // Get pending excuses for these children
  return await this.find({
    child: { $in: childIds },
    status: 'pending',
  })
    .populate('child', 'firstName lastName assignedClass')
    .populate('submittedBy', 'firstName lastName email')
    .sort({ absenceDate: -1 });
};

const AbsenceExcuse = mongoose.model('AbsenceExcuse', absenceExcuseSchema);

export default AbsenceExcuse;
