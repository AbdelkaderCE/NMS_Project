import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
      maxlength: [100, 'Class name cannot exceed 100 characters'],
      unique: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    ageRange: {
      minMonths: {
        type: Number,
        required: [true, 'Minimum age is required'],
        min: [0, 'Minimum age cannot be negative'],
      },
      maxMonths: {
        type: Number,
        required: [true, 'Maximum age is required'],
        min: [0, 'Maximum age cannot be negative'],
      },
    },
    monthlyFee: {
      type: Number,
      required: [true, 'Monthly fee is required'],
      min: [0, 'Monthly fee cannot be negative'],
    },
    color: {
      type: String,
      default: '#3B82F6', // Blue
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for groups
classSchema.virtual('groups', {
  ref: 'Group',
  localField: '_id',
  foreignField: 'class',
});

// Virtual for total children count
classSchema.virtual('totalChildren', {
  ref: 'Child',
  localField: '_id',
  foreignField: 'assignedClass',
  count: true,
});

// Validate age range
classSchema.pre('save', function (next) {
  if (this.ageRange.minMonths >= this.ageRange.maxMonths) {
    next(new Error('Maximum age must be greater than minimum age'));
  }
  next();
});

const Class = mongoose.model('Class', classSchema);

export default Class;
