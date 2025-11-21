import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [100, 'Group name cannot exceed 100 characters'],
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Maximum capacity is required'],
      min: [1, 'Maximum capacity must be at least 1'],
    },
    instructors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
      },
    ],
    schedule: {
      days: {
        type: [String],
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
      startTime: String, // HH:MM format
      endTime: String,   // HH:MM format
    },
    room: {
      type: String,
      maxlength: [100, 'Room name cannot exceed 100 characters'],
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

// Virtual for children count
groupSchema.virtual('children', {
  ref: 'Child',
  localField: '_id',
  foreignField: 'assignedGroup',
});

groupSchema.virtual('childrenCount', {
  ref: 'Child',
  localField: '_id',
  foreignField: 'assignedGroup',
  count: true,
});

// Check capacity before saving
groupSchema.pre('save', function (next) {
  if (this.instructors && this.instructors.length === 0) {
    next(new Error('At least one instructor must be assigned'));
  }
  next();
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
