import Child from '../models/Child.js';
import Staff from '../models/Staff.js';
import Attendance from '../models/Attendance.js';
import Payment from '../models/Payment.js';
import Activity from '../models/Activity.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/responseHandler.js';
import { ROLES, CHILD_STATUS, ATTENDANCE_STATUS, PAYMENT_STATUS, MESSAGE_STATUS } from '../utils/constants.js';

/**
 * @desc    Get dashboard overview
 * @route   GET /api/dashboard/overview
 * @access  Private (Admin, Staff)
 */
export const getDashboardOverview = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total counts
    const totalChildren = await Child.countDocuments({ status: CHILD_STATUS.ACTIVE });
    const totalStaff = await Staff.countDocuments({ employmentStatus: 'active' });
    const totalParents = await User.countDocuments({ role: ROLES.PARENT });

    // Today's attendance
    const todayAttendance = await Attendance.countDocuments({
      date: today,
      status: { $in: [ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.LATE] },
    });

    const attendanceRate = totalChildren > 0 
      ? ((todayAttendance / totalChildren) * 100).toFixed(2)
      : 0;

    // This month's revenue
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyRevenueResult = await Payment.aggregate([
      {
        $match: {
          status: PAYMENT_STATUS.PAID,
          paidDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]);
    const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;

    // Pending payments
    const pendingPayments = await Payment.countDocuments({
      status: PAYMENT_STATUS.PENDING,
    });

    // Unread messages (for current user if not admin)
    let unreadMessages = 0;
    if (req.user.role === ROLES.ADMIN) {
      unreadMessages = await Message.countDocuments({
        status: MESSAGE_STATUS.SENT,
      });
    } else {
      unreadMessages = await Message.countDocuments({
        recipient: req.user.id,
        status: MESSAGE_STATUS.SENT,
        'recipient_deleted': false,
      });
    }

    // Recent activities (last 5)
    const recentActivities = await Activity.find()
      .populate('child', 'firstName lastName photo')
      .populate({
        path: 'performedBy',
        select: 'user position',
        populate: { path: 'user', select: 'firstName lastName' },
      })
      .sort({ createdAt: -1 })
      .limit(5);

    const overview = {
      counts: {
        totalChildren,
        totalStaff,
        totalParents,
        todayAttendance,
        attendanceRate: parseFloat(attendanceRate),
        pendingPayments,
        unreadMessages,
      },
      revenue: {
        monthly: monthlyRevenue,
      },
      recentActivities,
    };

    sendSuccess(res, 200, 'Dashboard overview retrieved successfully', overview);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get enrollment statistics
 * @route   GET /api/dashboard/enrollment
 * @access  Private (Admin, Staff)
 */
export const getEnrollmentStats = async (req, res, next) => {
  try {
    // Total children by status
    const byStatus = await Child.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Children by age group
    const children = await Child.find().select('dateOfBirth');
    const ageGroups = {
      '0-1': 0,
      '1-2': 0,
      '2-3': 0,
      '3-4': 0,
      '4-5': 0,
      '5+': 0,
    };

    children.forEach((child) => {
      if (child.dateOfBirth) {
        const age = Math.floor(
          (Date.now() - child.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        );
        if (age < 1) ageGroups['0-1']++;
        else if (age < 2) ageGroups['1-2']++;
        else if (age < 3) ageGroups['2-3']++;
        else if (age < 4) ageGroups['3-4']++;
        else if (age < 5) ageGroups['4-5']++;
        else ageGroups['5+']++;
      }
    });

    // Children by class group
    const byClassGroup = await Child.aggregate([
      { $match: { status: CHILD_STATUS.ACTIVE } },
      { $group: { _id: '$classGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Enrollment trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const enrollmentTrend = await Child.aggregate([
      { $match: { enrollmentDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$enrollmentDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const stats = {
      byStatus,
      ageGroups,
      byClassGroup,
      enrollmentTrend,
    };

    sendSuccess(res, 200, 'Enrollment statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance analytics
 * @route   GET /api/dashboard/attendance
 * @access  Private (Admin, Staff)
 */
export const getAttendanceAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

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

    // Attendance by status
    const byStatus = await Attendance.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Daily attendance rate
    const dailyAttendance = await Attendance.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: {
            $sum: {
              $cond: [
                { $in: ['$status', [ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.LATE]] },
                1,
                0,
              ],
            },
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$status', ATTENDANCE_STATUS.ABSENT] }, 1, 0],
            },
          },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          date: '$_id',
          present: 1,
          absent: 1,
          total: 1,
          rate: {
            $multiply: [{ $divide: ['$present', '$total'] }, 100],
          },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Late arrivals trend
    const lateArrivals = await Attendance.countDocuments({
      ...dateQuery,
      isLate: true,
    });

    // Early departures
    const earlyDepartures = await Attendance.countDocuments({
      ...dateQuery,
      isEarlyDeparture: true,
    });

    const analytics = {
      byStatus,
      dailyAttendance,
      lateArrivals,
      earlyDepartures,
    };

    sendSuccess(res, 200, 'Attendance analytics retrieved successfully', analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get revenue analytics
 * @route   GET /api/dashboard/revenue
 * @access  Private (Admin)
 */
export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) {
        dateQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateQuery.createdAt.$lte = new Date(endDate);
      }
    } else {
      // Default to current year
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateQuery.createdAt = { $gte: startOfYear };
    }

    // Total revenue (paid invoices)
    const revenueResult = await Payment.aggregate([
      { $match: { ...dateQuery, status: PAYMENT_STATUS.PAID } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Revenue by payment type
    const byType = await Payment.aggregate([
      { $match: { ...dateQuery, status: PAYMENT_STATUS.PAID } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$finalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Revenue by payment method
    const byMethod = await Payment.aggregate([
      { $match: { ...dateQuery, status: PAYMENT_STATUS.PAID } },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$finalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Monthly revenue trend
    const monthlyRevenue = await Payment.aggregate([
      { $match: { ...dateQuery, status: PAYMENT_STATUS.PAID } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paidDate' } },
          revenue: { $sum: '$finalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Pending and overdue amounts
    const today = new Date();
    const pendingResult = await Payment.aggregate([
      { $match: { status: PAYMENT_STATUS.PENDING } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]);
    const pendingAmount = pendingResult.length > 0 ? pendingResult[0].total : 0;

    const overdueResult = await Payment.aggregate([
      {
        $match: {
          status: PAYMENT_STATUS.PENDING,
          dueDate: { $lt: today },
        },
      },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]);
    const overdueAmount = overdueResult.length > 0 ? overdueResult[0].total : 0;

    const analytics = {
      totalRevenue,
      pendingAmount,
      overdueAmount,
      byType,
      byMethod,
      monthlyRevenue,
    };

    sendSuccess(res, 200, 'Revenue analytics retrieved successfully', analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get staff analytics
 * @route   GET /api/dashboard/staff
 * @access  Private (Admin)
 */
export const getStaffAnalytics = async (req, res, next) => {
  try {
    // Total staff by position
    const byPosition = await Staff.aggregate([
      { $match: { employmentStatus: 'active' } },
      { $group: { _id: '$position', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Staff by employment status
    const byStatus = await Staff.aggregate([
      { $group: { _id: '$employmentStatus', count: { $sum: 1 } } },
    ]);

    // Average salary by position
    const avgSalaryByPosition = await Staff.aggregate([
      { $match: { employmentStatus: 'active' } },
      {
        $group: {
          _id: '$position',
          avgSalary: { $avg: '$salary.amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgSalary: -1 } },
    ]);

    // Staff with expiring certifications (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringCertifications = await Staff.aggregate([
      { $match: { employmentStatus: 'active' } },
      { $unwind: '$certifications' },
      {
        $match: {
          'certifications.expiryDate': {
            $gte: new Date(),
            $lte: thirtyDaysFromNow,
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          name: {
            $concat: ['$userInfo.firstName', ' ', '$userInfo.lastName'],
          },
          certification: '$certifications.name',
          expiryDate: '$certifications.expiryDate',
        },
      },
    ]);

    // Most active staff (by activities)
    const mostActiveStaff = await Activity.aggregate([
      { $match: { performedBy: { $ne: null } } },
      { $group: { _id: '$performedBy', activityCount: { $sum: 1 } } },
      { $sort: { activityCount: -1 } },
      { $limit: 5 },
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
          name: {
            $concat: ['$userInfo.firstName', ' ', '$userInfo.lastName'],
          },
          position: '$staffInfo.position',
          activityCount: 1,
        },
      },
    ]);

    const analytics = {
      byPosition,
      byStatus,
      avgSalaryByPosition,
      expiringCertifications,
      mostActiveStaff,
    };

    sendSuccess(res, 200, 'Staff analytics retrieved successfully', analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get activity summary
 * @route   GET /api/dashboard/activities
 * @access  Private (Admin, Staff)
 */
export const getActivitySummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

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
      // Default to last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateQuery.date = { $gte: sevenDaysAgo };
    }

    // Activities by type
    const byType = await Activity.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Daily activity count
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

    // Total activities
    const totalActivities = await Activity.countDocuments(dateQuery);

    const summary = {
      total: totalActivities,
      byType,
      dailyActivities,
    };

    sendSuccess(res, 200, 'Activity summary retrieved successfully', summary);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get parent engagement metrics
 * @route   GET /api/dashboard/parent-engagement
 * @access  Private (Admin, Staff)
 */
export const getParentEngagement = async (req, res, next) => {
  try {
    // Total parents
    const totalParents = await User.countDocuments({ role: ROLES.PARENT });

    // Parents with unread messages
    const parentsWithUnreadMessages = await Message.distinct('recipient', {
      status: MESSAGE_STATUS.SENT,
      'recipient_deleted': false,
    });

    // Messages statistics
    const totalMessages = await Message.countDocuments();
    const messagesByParents = await Message.countDocuments({
      sender: { $in: await User.find({ role: ROLES.PARENT }).distinct('_id') },
    });

    // Parents with overdue payments
    const today = new Date();
    const parentsWithOverduePayments = await Payment.distinct('parent', {
      status: PAYMENT_STATUS.PENDING,
      dueDate: { $lt: today },
    });

    const engagement = {
      totalParents,
      parentsWithUnreadMessages: parentsWithUnreadMessages.length,
      parentsWithOverduePayments: parentsWithOverduePayments.length,
      messageStats: {
        total: totalMessages,
        fromParents: messagesByParents,
      },
    };

    sendSuccess(res, 200, 'Parent engagement metrics retrieved successfully', engagement);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get quick stats for dashboard widgets
 * @route   GET /api/dashboard/quick-stats
 * @access  Private
 */
export const getQuickStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {};

    // Role-based stats
    if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.STAFF) {
      stats.children = await Child.countDocuments({ status: CHILD_STATUS.ACTIVE });
      stats.staff = await Staff.countDocuments({ employmentStatus: 'active' });
      stats.todayAttendance = await Attendance.countDocuments({
        date: today,
        status: { $in: [ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.LATE] },
      });
      stats.pendingPayments = await Payment.countDocuments({
        status: PAYMENT_STATUS.PENDING,
      });
    }

    if (req.user.role === ROLES.PARENT) {
      // Parent's children
      const children = await Child.find({ 'parents.parent': req.user.id }).select('_id');
      stats.myChildren = children.length;

      // My children's attendance today
      stats.todayAttendance = await Attendance.countDocuments({
        date: today,
        child: { $in: children.map((c) => c._id) },
        status: { $in: [ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.LATE] },
      });

      // My pending payments
      stats.pendingPayments = await Payment.countDocuments({
        parent: req.user.id,
        status: PAYMENT_STATUS.PENDING,
      });
    }

    // Common stats for all roles
    stats.unreadMessages = await Message.countDocuments({
      recipient: req.user.id,
      status: MESSAGE_STATUS.SENT,
      'recipient_deleted': false,
    });

    sendSuccess(res, 200, 'Quick stats retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
