import mongoose from 'mongoose';
import { PAYMENT_STATUS, PAYMENT_METHOD } from '../utils/constants.js';

const paymentSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
    },
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      required: [true, 'Child reference is required'],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Parent reference is required'],
    },
    
    // Payment Details
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    
    // Payment Status
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      required: true,
    },
    
    // Payment Method
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: null,
    },
    
    // Dates
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paidDate: {
      type: Date,
      default: null,
    },
    
    // Billing Period
    billingPeriod: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    
    // Payment Items
    items: [
      {
        description: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        total: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    
    // Discounts & Taxes
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Transaction Details
    transactionId: {
      type: String,
      trim: true,
    },
    
    // Processing
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    
    // Notes
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    
    // Reminder tracking
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
paymentSchema.index({ invoiceNumber: 1 });
paymentSchema.index({ child: 1, status: 1 });
paymentSchema.index({ parent: 1, status: 1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ status: 1 });

// ==================== VIRTUAL FIELDS ====================

// Virtual for total amount after discount and tax
paymentSchema.virtual('finalAmount').get(function () {
  return this.amount - this.discount + this.tax;
});

// Virtual to check if payment is overdue
paymentSchema.virtual('isOverdue').get(function () {
  return (
    this.status === PAYMENT_STATUS.PENDING &&
    new Date() > new Date(this.dueDate)
  );
});

// Virtual for days overdue
paymentSchema.virtual('daysOverdue').get(function () {
  if (this.status !== PAYMENT_STATUS.PENDING) return 0;
  
  const today = new Date();
  const due = new Date(this.dueDate);
  
  if (today <= due) return 0;
  
  const diffTime = Math.abs(today - due);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// ==================== MIDDLEWARE ====================

// Auto-generate invoice number if not provided
paymentSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Count existing invoices this month
    const count = await mongoose.model('Payment').countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), 1),
        $lt: new Date(year, date.getMonth() + 1, 1),
      },
    });
    
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Update status to overdue if past due date
paymentSchema.pre('save', function (next) {
  if (
    this.status === PAYMENT_STATUS.PENDING &&
    new Date() > new Date(this.dueDate)
  ) {
    this.status = PAYMENT_STATUS.OVERDUE;
  }
  next();
});

// ==================== METHODS ====================

// Mark as paid
paymentSchema.methods.markAsPaid = function (paymentMethod, transactionId, processedBy) {
  this.status = PAYMENT_STATUS.PAID;
  this.paidDate = new Date();
  this.paymentMethod = paymentMethod;
  this.transactionId = transactionId;
  this.processedBy = processedBy;
  return this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
