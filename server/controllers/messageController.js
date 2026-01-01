import Message from '../models/Message.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/responseHandler.js';
import { getPaginationParams, buildPagination } from '../utils/helpers.js';
import { ROLES, MESSAGE_STATUS } from '../utils/constants.js';
import { notifyNewMessage } from '../utils/notificationHelper.js';

/**
 * @desc    Send message
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { recipient, subject, content } = req.body;

    // Validate recipient exists
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return sendError(res, 404, 'Recipient not found');
    }

    // Create message
    const message = await Message.create({
      sender: req.user.id,
      recipient,
      subject,
      message: content, // Map content to message field
      status: MESSAGE_STATUS.SENT,
    });

    await message.populate([
      { path: 'sender', select: 'firstName lastName photo role' },
      { path: 'recipient', select: 'firstName lastName photo role' },
    ]);

    // Emit real-time notification via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Emit to recipient
      io.to(`user:${recipient}`).emit('new-message', {
        senderId: req.user.id,
        recipientId: recipient,
        content: content,
        subject: subject,
        timestamp: message.createdAt,
      });
    }

    // Create notification for recipient
    await notifyNewMessage(message, recipient, io);

    sendSuccess(res, 201, 'Message sent successfully', message);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get inbox messages
 * @route   GET /api/messages/inbox
 * @access  Private
 */
export const getInbox = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    let query = {
      recipient: req.user.id,
    };

    // Filter by status
    if (status) {
      query.status = status;
    }

    const totalItems = await Message.countDocuments(query);

    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName photo role')
      .populate('recipient', 'firstName lastName photo role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = buildPagination(page, limit, totalItems);

    sendPaginatedResponse(res, 200, 'Inbox messages retrieved successfully', messages, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get sent messages
 * @route   GET /api/messages/sent
 * @access  Private
 */
export const getSentMessages = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    let query = {
      sender: req.user.id,
    };

    const totalItems = await Message.countDocuments(query);

    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName photo role')
      .populate('recipient', 'firstName lastName photo role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = buildPagination(page, limit, totalItems);

    sendPaginatedResponse(res, 200, 'Sent messages retrieved successfully', messages, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get archived messages
 * @route   GET /api/messages/archived
 * @access  Private
 */
export const getArchivedMessages = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    let query = {
      recipient: req.user.id,
      status: MESSAGE_STATUS.ARCHIVED,
    };

    const totalItems = await Message.countDocuments(query);

    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName photo role')
      .populate('recipient', 'firstName lastName photo role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = buildPagination(page, limit, totalItems);

    sendPaginatedResponse(res, 200, 'Archived messages retrieved successfully', messages, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single message
 * @route   GET /api/messages/:id
 * @access  Private (sender or recipient only)
 */
export const getMessageById = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'firstName lastName photo email role')
      .populate('recipient', 'firstName lastName photo email role');

    if (!message) {
      return sendError(res, 404, 'Message not found');
    }

    // Check if user is sender or recipient
    const isSender = message.sender._id.toString() === req.user.id;
    const isRecipient = message.recipient._id.toString() === req.user.id;

    if (!isSender && !isRecipient) {
      return sendError(res, 403, 'Not authorized to access this message');
    }

    // Mark as read if recipient is viewing and not already read
    if (isRecipient && message.status === MESSAGE_STATUS.SENT) {
      message.status = MESSAGE_STATUS.READ;
      message.readAt = new Date();
      await message.save();
    }

    sendSuccess(res, 200, 'Message retrieved successfully', message);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark message as read
 * @route   PUT /api/messages/:id/read
 * @access  Private (recipient only)
 */
export const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return sendError(res, 404, 'Message not found');
    }

    // Check if user is recipient
    if (message.recipient.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized to mark this message as read');
    }

    if (message.status === MESSAGE_STATUS.READ) {
      return sendError(res, 400, 'Message already marked as read');
    }

    message.status = MESSAGE_STATUS.READ;
    message.readAt = new Date();
    await message.save();

    await message.populate([
      { path: 'sender', select: 'firstName lastName photo' },
      { path: 'recipient', select: 'firstName lastName photo' },
    ]);

    sendSuccess(res, 200, 'Message marked as read', message);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark message as unread
 * @route   PUT /api/messages/:id/unread
 * @access  Private (recipient only)
 */
export const markAsUnread = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return sendError(res, 404, 'Message not found');
    }

    // Check if user is recipient
    if (message.recipient.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized to mark this message as unread');
    }

    if (message.status === MESSAGE_STATUS.SENT) {
      return sendError(res, 400, 'Message already marked as unread');
    }

    message.status = MESSAGE_STATUS.SENT;
    message.readAt = null;
    await message.save();

    await message.populate([
      { path: 'sender', select: 'firstName lastName photo' },
      { path: 'recipient', select: 'firstName lastName photo' },
    ]);

    sendSuccess(res, 200, 'Message marked as unread', message);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Archive message
 * @route   PUT /api/messages/:id/archive
 * @access  Private (recipient only)
 */
export const archiveMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return sendError(res, 404, 'Message not found');
    }

    // Check if user is recipient
    if (message.recipient.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized to archive this message');
    }

    if (message.status === MESSAGE_STATUS.ARCHIVED) {
      return sendError(res, 400, 'Message already archived');
    }

    message.status = MESSAGE_STATUS.ARCHIVED;
    await message.save();

    await message.populate([
      { path: 'sender', select: 'firstName lastName photo' },
      { path: 'recipient', select: 'firstName lastName photo' },
    ]);

    sendSuccess(res, 200, 'Message archived successfully', message);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unarchive message
 * @route   PUT /api/messages/:id/unarchive
 * @access  Private (recipient only)
 */
export const unarchiveMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return sendError(res, 404, 'Message not found');
    }

    // Check if user is recipient
    if (message.recipient.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized to unarchive this message');
    }

    if (message.status !== MESSAGE_STATUS.ARCHIVED) {
      return sendError(res, 400, 'Message is not archived');
    }

    message.status = MESSAGE_STATUS.READ;
    await message.save();

    await message.populate([
      { path: 'sender', select: 'firstName lastName photo' },
      { path: 'recipient', select: 'firstName lastName photo' },
    ]);

    sendSuccess(res, 200, 'Message unarchived successfully', message);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete message
 * @route   DELETE /api/messages/:id
 * @access  Private (sender or recipient)
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return sendError(res, 404, 'Message not found');
    }

    // Check if user is sender or recipient
    const isSender = message.sender.toString() === req.user.id;
    const isRecipient = message.recipient.toString() === req.user.id;

    if (!isSender && !isRecipient) {
      return sendError(res, 403, 'Not authorized to delete this message');
    }

    // Permanently delete the message
    await message.deleteOne();
    sendSuccess(res, 200, 'Message deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread count
 * @route   GET /api/messages/unread/count
 * @access  Private
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user.id,
      status: MESSAGE_STATUS.SENT,
    });

    sendSuccess(res, 200, 'Unread count retrieved successfully', { count });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get message statistics
 * @route   GET /api/messages/stats
 * @access  Private
 */
export const getMessageStats = async (req, res, next) => {
  try {
    const totalReceived = await Message.countDocuments({
      recipient: req.user.id,
    });

    const totalSent = await Message.countDocuments({
      sender: req.user.id,
    });

    const unreadCount = await Message.countDocuments({
      recipient: req.user.id,
      status: MESSAGE_STATUS.SENT,
    });

    const readCount = await Message.countDocuments({
      recipient: req.user.id,
      status: MESSAGE_STATUS.READ,
    });

    const archivedCount = await Message.countDocuments({
      recipient: req.user.id,
      status: MESSAGE_STATUS.ARCHIVED,
    });

    const stats = {
      inbox: {
        total: totalReceived,
        unread: unreadCount,
        read: readCount,
        archived: archivedCount,
      },
      sent: totalSent,
    };

    sendSuccess(res, 200, 'Message statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get conversation with a user
 * @route   GET /api/messages/conversation/:userId
 * @access  Private
 */
export const getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: userId },
        { sender: userId, recipient: req.user.id },
      ],
    })
      .populate('sender', 'firstName lastName photo role')
      .populate('recipient', 'firstName lastName photo role')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      {
        sender: userId,
        recipient: req.user.id,
        status: MESSAGE_STATUS.SENT,
      },
      {
        status: MESSAGE_STATUS.READ,
        readAt: new Date(),
      }
    );

    sendSuccess(res, 200, 'Conversation retrieved successfully', messages);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all messages as read
 * @route   PUT /api/messages/read-all
 * @access  Private
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Message.updateMany(
      {
        recipient: req.user.id,
        status: MESSAGE_STATUS.SENT,
      },
      {
        status: MESSAGE_STATUS.READ,
        readAt: new Date(),
      }
    );

    sendSuccess(res, 200, `${result.modifiedCount} messages marked as read`);
  } catch (error) {
    next(error);
  }
};
