import Notification from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, read } = req.query;
    const skip = (page - 1) * limit;

    const query = { recipient: req.user._id };
    if (read !== undefined) {
      query.read = read === 'true';
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'name role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    return sendSuccess(res, 200, 'Notifications retrieved successfully', {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    return sendSuccess(res, 200, 'Unread count retrieved successfully', { unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    notification.read = true;
    await notification.save();

    return sendSuccess(res, 200, 'Notification marked as read', { notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    return sendSuccess(res, 200, 'All notifications marked as read', {
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    await notification.deleteOne();

    return sendSuccess(res, 200, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/clear-read
// @access  Private
export const clearReadNotifications = async (req, res, next) => {
  try {
    const result = await Notification.deleteMany({
      recipient: req.user._id,
      read: true,
    });

    return sendSuccess(res, 200, 'Read notifications cleared', {
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a notification (internal function)
// @param   {Object} data - Notification data
// @param   {Socket.IO} io - Socket.IO instance
export const createNotification = async (data, io = null) => {
  try {
    const notification = await Notification.create(data);
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'name role');

    // Emit real-time notification if Socket.IO is available
    if (io && data.recipient) {
      io.to(`user:${data.recipient}`).emit('new-notification', populatedNotification);
    }

    return populatedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
