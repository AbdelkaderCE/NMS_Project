import AuditLog from '../models/AuditLog.js';
import { sendSuccess, sendPaginatedResponse } from '../utils/responseHandler.js';
import { getPaginationParams, buildPagination } from '../utils/helpers.js';

/**
 * @desc    Get all audit logs
 * @route   GET /api/audit-logs
 * @access  Private (Admin only)
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { 
      action, 
      resourceType, 
      resourceId, 
      userId,
      startDate,
      endDate 
    } = req.query;

    const query = {};

    // Filter by action
    if (action) {
      query.action = action;
    }

    // Filter by resource type
    if (resourceType) {
      query.resourceType = resourceType;
    }

    // Filter by specific resource
    if (resourceId) {
      query.resourceId = resourceId;
    }

    // Filter by user
    if (userId) {
      query.user = userId;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const totalItems = await AuditLog.countDocuments(query);

    const logs = await AuditLog.find(query)
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = buildPagination(page, limit, totalItems);

    sendPaginatedResponse(res, 200, 'Audit logs retrieved successfully', logs, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get audit logs for a specific resource
 * @route   GET /api/audit-logs/resource/:resourceType/:resourceId
 * @access  Private (Admin only)
 */
export const getResourceAuditLogs = async (req, res, next) => {
  try {
    const { resourceType, resourceId } = req.params;

    const logs = await AuditLog.find({ 
      resourceType, 
      resourceId 
    })
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 changes

    sendSuccess(res, 200, 'Resource audit logs retrieved successfully', logs);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get audit logs for a specific user
 * @route   GET /api/audit-logs/user/:userId
 * @access  Private (Admin only)
 */
export const getUserAuditLogs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page, limit, skip } = getPaginationParams(req.query);

    const query = { user: userId };
    const totalItems = await AuditLog.countDocuments(query);

    const logs = await AuditLog.find(query)
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = buildPagination(page, limit, totalItems);

    sendPaginatedResponse(res, 200, 'User audit logs retrieved successfully', logs, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get audit statistics
 * @route   GET /api/audit-logs/stats
 * @access  Private (Admin only)
 */
export const getAuditStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) {
        dateQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateQuery.createdAt.$lte = end;
      }
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateQuery.createdAt = { $gte: thirtyDaysAgo };
    }

    // Actions by type
    const byAction = await AuditLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Actions by resource type
    const byResourceType = await AuditLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$resourceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Most active users
    const topUsers = await AuditLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$user', count: { $sum: 1 }, userName: { $first: '$userName' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Daily activity
    const dailyActivity = await AuditLog.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const stats = {
      byAction,
      byResourceType,
      topUsers,
      dailyActivity,
    };

    sendSuccess(res, 200, 'Audit statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
