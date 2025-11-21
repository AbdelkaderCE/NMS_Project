import mongoose from 'mongoose';
import { MESSAGE_STATUS } from '../utils/constants.js';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    
    // Message Content
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    
    // Message Type
    type: {
      type: String,
      enum: ['general', 'announcement', 'alert', 'reminder', 'incident'],
      default: 'general',
    },
    
    // Status
    status: {
      type: String,
      enum: Object.values(MESSAGE_STATUS),
      default: MESSAGE_STATUS.SENT,
    },
    
    // Related Child (optional - for parent-staff communication about specific child)
    relatedChild: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      default: null,
    },
    
    // Priority
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    
    // Read status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    
    // Attachments
    attachments: [
      {
        filename: String,
        url: String,
        fileType: String,
        fileSize: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Thread/Reply
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ==================== INDEXES ====================
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, createdAt: -1 });
messageSchema.index({ status: 1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ relatedChild: 1 });

// ==================== METHODS ====================

// Mark message as read
messageSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  this.status = MESSAGE_STATUS.READ;
  return this.save();
};

// Mark message as archived
messageSchema.methods.archive = function () {
  this.status = MESSAGE_STATUS.ARCHIVED;
  return this.save();
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
