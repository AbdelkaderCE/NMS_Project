import Activity from '../models/Activity.js';
import Child from '../models/Child.js';
import Staff from '../models/Staff.js';
import Group from '../models/Group.js';
import Class from '../models/Class.js';
import ErrorResponse from '../utils/errorResponse.js';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/responseHandler.js';
import { getPaginationParams, buildPagination } from '../utils/helpers.js';
import { ROLES } from '../utils/constants.js';

/**
 * @desc    Create activity log
 * @route   POST /api/activities
 * @access  Private (Admin, Staff)
 */
export const createActivity = async (req, res, next) => {
  try {
    const { child, group, class: classId } = req.body;

    // Validate at least one target is provided
    if (!child && !group && !classId) {
      return sendError(res, 400, 'Activity must target at least one: child, group, or class');
    }

    // Validate child exists if provided
    if (child) {
      const childRecord = await Child.findById(child);
      if (!childRecord) {
        return sendError(res, 404, 'Child not found');
      }
    }

    // Validate group exists if provided
    if (group) {
      const groupRecord = await Group.findById(group);
      if (!groupRecord) {
        return sendError(res, 404, 'Group not found');
      }
    }

    // Validate class exists if provided
    if (classId) {
      const classRecord = await Class.findById(classId);
      if (!classRecord) {
        return sendError(res, 404, 'Class not found');
      }
    }

    // Find staff profile for the authenticated user
    const staffProfile = await Staff.findOne({ user: req.user.id });
    if (!staffProfile) {
      return sendError(res, 400, 'Staff profile is required. Only staff members can log activities.');
    }
    if (staffProfile.position !== 'teacher') {
      return sendError(res, 403, 'Only staff with position "teacher" can log activities');
    }

    // Create activity
    const activity = await Activity.create({
      ...req.body,
      loggedBy: staffProfile._id,
    });

    await activity.populate([
      { path: 'child', select: 'firstName lastName photo parents', populate: { path: 'parents.parent', select: '_id firstName lastName' } },
      { path: 'group', select: 'name maxCapacity', populate: { path: 'class', select: 'name' } },
      { path: 'class', select: 'name ageRange' },
      { path: 'loggedBy', populate: { path: 'user', select: 'firstName lastName' } },
    ]);

    // Send real-time notification to parents via Socket.IO
    const io = req.app.get('io');
    if (io) {
      let parentIds = [];
      
      // Get parent IDs based on activity target
      if (activity.child) {
        // For individual child activities
        parentIds = activity.child.parents?.map(p => p.parent?._id?.toString() || p.parent?.toString()) || [];
      } else if (activity.group || activity.class) {
        // For group or class activities, get all children's parents
        let targetChildren = [];
        
        if (activity.group) {
          // Get children in the group
          const groupChildren = await Child.find({ assignedGroup: activity.group._id }).populate('parents.parent', '_id');
          targetChildren = groupChildren;
        } else if (activity.class) {
          // Get children in the class
          const classChildren = await Child.find({ assignedClass: activity.class._id }).populate('parents.parent', '_id');
          targetChildren = classChildren;
        }
        
        // Extract unique parent IDs
        const parentIdSet = new Set();
        targetChildren.forEach(child => {
          child.parents?.forEach(p => {
            const parentId = p.parent?._id?.toString() || p.parent?.toString();
            if (parentId) parentIdSet.add(parentId);
          });
        });
        parentIds = Array.from(parentIdSet);
      }
      
      // Format notification message
      let targetName = '';
      if (activity.child) {
        targetName = `${activity.child.firstName} ${activity.child.lastName}`;
      } else if (activity.group) {
        targetName = activity.group.name;
      } else if (activity.class) {
        targetName = activity.class.name;
      }
      
      const notificationMessage = `${activity.title} has been scheduled for ${new Date(activity.date).toLocaleDateString()}`;
      
      // Emit to each parent
      parentIds.forEach(parentId => {
        io.to(`user:${parentId}`).emit('activity-notification', {
          type: 'activity',
          title: 'New Activity Scheduled',
          message: notificationMessage,
          activityId: activity._id,
          activityTitle: activity.title,
          activityType: activity.type,
          activityDate: activity.date,
          targetName: targetName,
          timestamp: new Date(),
          link: '/activities/calendar',
        });
      });
    }

    sendSuccess(res, 201, 'Activity log created successfully', activity);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all activities
 * @route   GET /api/activities
 * @access  Private (Admin, Staff) or Parent (own children only)
 */
export const getAllActivities = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { child, loggedBy, type, startDate, endDate } = req.query;

    let query = {};

    // If user is parent, only show their children's activities
    if (req.user.role === ROLES.PARENT) {
      const children = await Child.find({ 'parents.parent': req.user.id }).select('_id');
      if (children.length === 0) {
        return sendPaginatedResponse(res, 200, 'No activities found', [], {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
        });
      }
      query.child = { $in: children.map((c) => c._id) };
    }

    // Filter by child
    if (child) {
      query.child = child;
    }

    // Filter by staff
    if (loggedBy) {
      query.loggedBy = loggedBy;
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const totalItems = await Activity.countDocuments(query);

    const activities = await Activity.find(query)
      .populate('child', 'firstName lastName photo assignedClass assignedGroup')
      .populate('group', 'name maxCapacity')
      .populate('class', 'name ageRange')
      .populate({
        path: 'loggedBy',
        select: 'user position',
        populate: { path: 'user', select: 'firstName lastName' },
      })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = buildPagination(page, limit, totalItems);

    sendPaginatedResponse(res, 200, 'Activities retrieved successfully', activities, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single activity
 * @route   GET /api/activities/:id
 * @access  Private (Admin, Staff) or Parent (own child only)
 */
export const getActivityById = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('child', 'firstName lastName photo assignedClass assignedGroup parents')
      .populate('group', 'name maxCapacity')
      .populate('class', 'name ageRange')
      .populate({
        path: 'loggedBy',
        select: 'user position',
        populate: { path: 'user', select: 'firstName lastName' },
      });

    if (!activity) {
      return sendError(res, 404, 'Activity not found');
    }

    // If user is parent, check if they own this child
    if (req.user.role === ROLES.PARENT) {
      if (!activity.child) {
        return sendError(res, 403, 'Not authorized to access this activity');
      }

      const isParent = activity.child.parents.some(
        (p) => p.parent.toString() === req.user.id
      );

      if (!isParent) {
        return sendError(res, 403, 'Not authorized to access this activity');
      }
    }

    sendSuccess(res, 200, 'Activity retrieved successfully', activity);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update activity
 * @route   PUT /api/activities/:id
 * @access  Private (Admin, Staff)
 */
export const updateActivity = async (req, res, next) => {
  try {
    let activity = await Activity.findById(req.params.id);

    if (!activity) {
      return sendError(res, 404, 'Activity not found');
    }

    activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('child', 'firstName lastName photo')
      .populate('group', 'name maxCapacity')
      .populate('class', 'name ageRange')
      .populate({
        path: 'loggedBy',
        populate: { path: 'user', select: 'firstName lastName' },
      });

    sendSuccess(res, 200, 'Activity updated successfully', activity);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete activity
 * @route   DELETE /api/activities/:id
 * @access  Private (Admin only)
 */
export const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return sendError(res, 404, 'Activity not found');
    }

    await activity.deleteOne();

    sendSuccess(res, 200, 'Activity deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get activities by child
 * @route   GET /api/activities/child/:childId
 * @access  Private (Admin, Staff) or Parent (own child only)
 */
export const getActivitiesByChild = async (req, res, next) => {
  try {
    const { childId } = req.params;
    const { type, startDate, endDate } = req.query;

    // Validate child exists
    const child = await Child.findById(childId);
    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    // If user is parent, check if they own this child
    if (req.user.role === ROLES.PARENT) {
      const isParent = child.parents.some(
        (p) => p.parent.toString() === req.user.id
      );

      if (!isParent) {
        return sendError(res, 403, 'Not authorized to access this child');
      }
    }

    let query = { child: childId };

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const activities = await Activity.find(query)
      .populate({
        path: 'loggedBy',
        populate: { path: 'user', select: 'firstName lastName' },
      })
      .sort({ date: -1, createdAt: -1 });

    sendSuccess(res, 200, 'Child activities retrieved successfully', activities);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get activities by staff
 * @route   GET /api/activities/staff/:staffId
 * @access  Private (Admin, Staff)
 */
export const getActivitiesByStaff = async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const { type, startDate, endDate } = req.query;

    // Validate staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return sendError(res, 404, 'Staff not found');
    }

    let query = { loggedBy: staffId };

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const activities = await Activity.find(query)
      .populate('child', 'firstName lastName photo')
      .populate('group', 'name maxCapacity')
      .populate('class', 'name ageRange')
      .populate({
        path: 'loggedBy',
        populate: { path: 'user', select: 'firstName lastName' },
      })
      .sort({ date: -1, createdAt: -1 });

    sendSuccess(res, 200, 'Staff activities retrieved successfully', activities);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get activity statistics
 * @route   GET /api/activities/stats
 * @access  Private (Admin, Staff)
 */
export const getActivityStats = async (req, res, next) => {
  try {
    const { startDate, endDate, childId, staffId } = req.query;

    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) {
        dateQuery.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateQuery.date.$lte = end;
      }
    } else {
      // Default to current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      dateQuery.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    // Add child filter if provided
    if (childId) {
      dateQuery.child = childId;
    }

    // Add staff filter if provided
    if (staffId) {
      dateQuery.loggedBy = staffId;
    }

    const totalActivities = await Activity.countDocuments(dateQuery);

    // Count by type
    const byType = await Activity.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Activities per day
    const dailyActivities = await Activity.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Most active children
    const mostActiveChildren = await Activity.aggregate([
      { $match: { ...dateQuery, child: { $ne: null } } },
      {
        $group: {
          _id: '$child',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'children',
          localField: '_id',
          foreignField: '_id',
          as: 'childInfo',
        },
      },
      { $unwind: '$childInfo' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: {
            $concat: ['$childInfo.firstName', ' ', '$childInfo.lastName'],
          },
          photo: '$childInfo.photo',
        },
      },
    ]);

    // Most active staff
    const mostActiveStaff = await Activity.aggregate([
      { $match: { ...dateQuery, loggedBy: { $ne: null } } },
      {
        $group: {
          _id: '$loggedBy',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'staff',
          localField: '_id',
          foreignField: '_id',
          as: 'staffInfo',
        },
      },
      { $unwind: '$staffInfo' },
      {
        $lookup: {
          from: 'users',
          localField: 'staffInfo.user',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: {
            $concat: ['$userInfo.firstName', ' ', '$userInfo.lastName'],
          },
          position: '$staffInfo.position',
        },
      },
    ]);

    const stats = {
      total: totalActivities,
      byType,
      dailyActivities,
      mostActiveChildren,
      mostActiveStaff,
    };

    sendSuccess(res, 200, 'Activity statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get today's activities
 * @route   GET /api/activities/today
 * @access  Private (Admin, Staff) or Parent (own children only)
 */
export const getTodayActivities = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let query = {
      date: { $gte: today, $lt: tomorrow },
    };

    // If user is parent, only show their children's activities
    if (req.user.role === ROLES.PARENT) {
      const children = await Child.find({ 'parents.parent': req.user.id }).select('_id');
      query.child = { $in: children.map((c) => c._id) };
    }

    const activities = await Activity.find(query)
      .populate('child', 'firstName lastName photo assignedClass assignedGroup')
      .populate('group', 'name maxCapacity')
      .populate('class', 'name ageRange')
      .populate({
        path: 'loggedBy',
        populate: { path: 'user', select: 'firstName lastName' },
      })
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, "Today's activities retrieved successfully", {
      count: activities.length,
      activities,
    });
  } catch (error) {
    next(error);
  }
};
