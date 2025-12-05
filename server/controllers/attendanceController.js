import Attendance from '../models/Attendance.js';
import Child from '../models/Child.js';
import Staff from '../models/Staff.js';
import ErrorResponse from '../utils/errorResponse.js';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/responseHandler.js';
import { getPaginationParams, buildPagination } from '../utils/helpers.js';
import { ROLES, ATTENDANCE_STATUS } from '../utils/constants.js';

/**
 * @desc    Create attendance record
 * @route   POST /api/attendance
 * @access  Private (Admin, Staff)
 */
export const createAttendance = async (req, res, next) => {
  try {
    const { child, date, status, recordedBy } = req.body;

    // Validate child exists
    const childRecord = await Child.findById(child);
    if (!childRecord) {
      return sendError(res, 404, 'Child not found');
    }

    // Find staff by user ID or staff ID
    let staff = await Staff.findById(recordedBy);
    if (!staff) {
      // Try finding by user ID
      staff = await Staff.findOne({ user: recordedBy });
    }
    
    // If user is admin or staff and no staff profile exists, create one automatically
    if (!staff && (req.user.role === ROLES.ADMIN || req.user.role === ROLES.STAFF)) {
      // Auto-create staff profile for admin/staff users
      const position = req.user.role === ROLES.ADMIN ? 'manager' : 'teacher';
      staff = await Staff.create({
        user: recordedBy,
        employeeId: `EMP${Date.now().toString().slice(-6)}`,
        position: position,
        hireDate: new Date(),
        department: 'general'
      });
    }
    
    if (!staff) {
      return sendError(res, 404, 'Staff record not found. Please contact administrator to create your staff profile.');
    }

    // Check if attendance already exists for this child on this date
    // Parse date string as UTC date (input is "YYYY-MM-DD" format from frontend)
    let attendanceDate;
    if (typeof date === 'string') {
      // Create UTC date at start of day from string "YYYY-MM-DD"
      attendanceDate = new Date(date + 'T00:00:00.000Z');
    } else {
      attendanceDate = new Date(date || Date.now());
      attendanceDate.setUTCHours(0, 0, 0, 0);
    }
    
    // For querying, check for this date
    const nextDay = new Date(attendanceDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const existingAttendance = await Attendance.findOne({
      child,
      date: {
        $gte: attendanceDate,
        $lt: nextDay
      }
    });

    if (existingAttendance) {
      return sendError(res, 400, 'Attendance record already exists for this date');
    }

    // Create attendance with staff ID
    let attendance;
    try {
      attendance = await Attendance.create({
        child,
        date: attendanceDate,
        status: status || ATTENDANCE_STATUS.PRESENT,
        recordedBy: staff._id, // Use staff ID
        checkInTime: req.body.checkInTime,
        checkOutTime: req.body.checkOutTime,
        notes: req.body.notes,
      });
    } catch (error) {
      // Handle unique index violation
      if (error.code === 11000) {
        // Extract the field that caused the duplicate
        const duplicateKey = Object.keys(error.keyPattern)[0];
        return sendError(res, 400, `Attendance record already exists for this ${duplicateKey === 'child' ? 'child' : duplicateKey} on this date`);
      }
      throw error;
    }

    await attendance.populate([
      { path: 'child', select: 'firstName lastName photo' },
      { path: 'recordedBy', populate: { path: 'user', select: 'firstName lastName' } },
    ]);

    sendSuccess(res, 201, 'Attendance record created successfully', attendance);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all attendance records
 * @route   GET /api/attendance
 * @access  Private (Admin, Staff) or Parent (own children only)
 */
export const getAllAttendance = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { child, date, status, startDate, endDate } = req.query;

    let query = {};

    // If user is parent, only show their children's attendance
    if (req.user.role === ROLES.PARENT) {
      const children = await Child.find({ 'parents.parent': req.user.id }).select('_id');
      query.child = { $in: children.map((c) => c._id) };
    }

    // If user is teacher, only show attendance for their class children
    if (req.user.role === ROLES.STAFF && ['teacher', 'assistant', 'special_educator'].includes(req.user.staffInfo?.position)) {
      const staffInfo = await Staff.findOne({ user: req.user.id }).populate('assignedClasses');
      
      console.log('🎓 Teacher staff info:', { 
        userId: req.user.id, 
        hasStaffInfo: !!staffInfo,
        assignedClasses: staffInfo?.assignedClasses?.map(c => c._id),
        classCount: staffInfo?.assignedClasses?.length 
      });
      
      if (staffInfo && staffInfo.assignedClasses && staffInfo.assignedClasses.length > 0) {
        const classIds = staffInfo.assignedClasses.map(cls => cls._id);
        const classChildren = await Child.find({ assignedClass: { $in: classIds } }).select('_id');
        console.log('📚 Children in classes:', classChildren.map(c => c._id));
        query.child = { $in: classChildren.map((c) => c._id) };
      } else {
        // Teacher has no assigned classes, return empty result
        console.log('⚠️ Teacher has no assigned classes');
        return sendPaginatedResponse(res, 200, 'No attendance records available', [], { page, limit, total: 0 });
      }
    }

    // Filter by child
    if (child) {
      query.child = child;
    }

    // Filter by specific date
    if (date) {
      // Parse as UTC date at start and end of day
      let filterDate;
      if (typeof date === 'string') {
        filterDate = new Date(date + 'T00:00:00.000Z');
      } else {
        filterDate = new Date(date);
        filterDate.setUTCHours(0, 0, 0, 0);
      }
      const nextDay = new Date(filterDate);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      query.date = { $gte: filterDate, $lt: nextDay };
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = typeof startDate === 'string'
          ? new Date(startDate + 'T00:00:00.000Z')
          : new Date(startDate);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = typeof endDate === 'string'
          ? new Date(endDate + 'T23:59:59.999Z')
          : new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const totalItems = await Attendance.countDocuments(query);

    console.log('🔍 Attendance query:', query);
    console.log('📊 Total items found:', totalItems);

    const attendance = await Attendance.find(query)
      .populate('child', 'firstName lastName photo classGroup')
      .populate('recordedBy', 'user position')
      .populate('checkInBy', 'firstName lastName')
      .populate('checkOutBy', 'firstName lastName')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = buildPagination(page, limit, totalItems);

    sendPaginatedResponse(res, 200, 'Attendance records retrieved successfully', attendance, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single attendance record
 * @route   GET /api/attendance/:id
 * @access  Private (Admin, Staff) or Parent (own child only)
 */
export const getAttendanceById = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate({
        path: 'child',
        select: 'firstName lastName photo classGroup parents assignedClass',
        populate: { path: 'assignedClass', select: '_id' }
      })
      .populate('recordedBy', 'user position')
      .populate('checkInBy', 'firstName lastName')
      .populate('checkOutBy', 'firstName lastName');

    if (!attendance) {
      return sendError(res, 404, 'Attendance record not found');
    }

    // If user is parent, check if they own this child
    if (req.user.role === ROLES.PARENT) {
      const isParent = attendance.child.parents.some(
        (p) => p.parent.toString() === req.user.id
      );

      if (!isParent) {
        return sendError(res, 403, 'Not authorized to access this record');
      }
    }

    // If user is teacher, verify they own the child's class
    if (req.user.role === ROLES.STAFF && ['teacher', 'assistant', 'special_educator'].includes(req.user.staffInfo?.position)) {
      const staffInfo = await Staff.findOne({ user: req.user.id }).populate('assignedClasses');
      
      if (!staffInfo || !staffInfo.assignedClasses || staffInfo.assignedClasses.length === 0) {
        return sendError(res, 403, 'You have no assigned classes');
      }

      const assignedClassId = attendance.child.assignedClass?._id?.toString();
      const hasAccess = staffInfo.assignedClasses.some(
        cls => cls._id.toString() === assignedClassId
      );

      if (!hasAccess) {
        return sendError(res, 403, 'This child is not in any of your assigned classes');
      }
    }

    sendSuccess(res, 200, 'Attendance record retrieved successfully', attendance);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance by child and date
 * @route   GET /api/attendance/child/:childId/date/:date
 * @access  Private (Admin, Staff) or Parent (own child only)
 */
export const getAttendanceByChildAndDate = async (req, res, next) => {
  try {
    const { childId, date } = req.params;

    // Validate child exists
    const child = await Child.findById(childId).populate('assignedClass');
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

    // If user is teacher, verify they own the child's class (middleware handles this, but adding extra validation)
    if (req.user.role === ROLES.STAFF && ['teacher', 'assistant', 'special_educator'].includes(req.user.staffInfo?.position)) {
      const staffInfo = await Staff.findOne({ user: req.user.id }).populate('assignedClasses');
      
      if (!staffInfo || !staffInfo.assignedClasses || staffInfo.assignedClasses.length === 0) {
        return sendError(res, 403, 'You have no assigned classes');
      }

      const assignedClassId = child.assignedClass?._id?.toString();
      const hasAccess = staffInfo.assignedClasses.some(
        cls => cls._id.toString() === assignedClassId
      );

      if (!hasAccess) {
        return sendError(res, 403, 'This child is not in any of your assigned classes');
      }
    }

    // Parse date as UTC date at start of day
    let attendanceDate;
    if (typeof date === 'string') {
      attendanceDate = new Date(date + 'T00:00:00.000Z');
    } else {
      attendanceDate = new Date(date);
      attendanceDate.setUTCHours(0, 0, 0, 0);
    }
    
    const nextDay = new Date(attendanceDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const attendance = await Attendance.findOne({
      child: childId,
      date: {
        $gte: attendanceDate,
        $lt: nextDay
      }
    })
      .populate('child', 'firstName lastName photo')
      .populate('recordedBy', 'user position')
      .populate('checkInBy', 'firstName lastName')
      .populate('checkOutBy', 'firstName lastName');

    if (!attendance) {
      return sendError(res, 404, 'No attendance record found for this date');
    }

    sendSuccess(res, 200, 'Attendance record retrieved successfully', attendance);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update attendance record
 * @route   PUT /api/attendance/:id
 * @access  Private (Admin, Staff)
 */
export const updateAttendance = async (req, res, next) => {
  try {
    let attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return sendError(res, 404, 'Attendance record not found');
    }

    // Get child record to verify authorization
    const child = await Child.findById(attendance.child).populate('assignedClass');
    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    // If user is teacher, verify they own the child's class
    if (req.user.role === ROLES.STAFF && ['teacher', 'assistant', 'special_educator'].includes(req.user.staffInfo?.position)) {
      const staffInfo = await Staff.findOne({ user: req.user.id }).populate('assignedClasses');
      
      if (!staffInfo || !staffInfo.assignedClasses || staffInfo.assignedClasses.length === 0) {
        return sendError(res, 403, 'You have no assigned classes');
      }

      const assignedClassId = child.assignedClass?._id?.toString();
      const hasAccess = staffInfo.assignedClasses.some(
        cls => cls._id.toString() === assignedClassId
      );

      if (!hasAccess) {
        return sendError(res, 403, 'This child is not in any of your assigned classes');
      }
    }

    attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('child', 'firstName lastName photo')
      .populate('recordedBy', 'user position');

    sendSuccess(res, 200, 'Attendance record updated successfully', attendance);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete attendance record
 * @route   DELETE /api/attendance/:id
 * @access  Private (Admin only)
 */
export const deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return sendError(res, 404, 'Attendance record not found');
    }

    await attendance.deleteOne();

    sendSuccess(res, 200, 'Attendance record deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check in child
 * @route   POST /api/attendance/:id/check-in
 * @access  Private (Admin, Staff, Parent - own child)
 */
export const checkInChild = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return sendError(res, 404, 'Attendance record not found');
    }

    // If already checked in
    if (attendance.checkInTime) {
      return sendError(res, 400, 'Child already checked in');
    }

    // Get child record to verify authorization
    const child = await Child.findById(attendance.child).populate('assignedClass');
    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    // If user is parent, check if they own this child
    if (req.user.role === ROLES.PARENT) {
      const isParent = child.parents.some(
        (p) => p.parent.toString() === req.user.id
      );

      if (!isParent) {
        return sendError(res, 403, 'Not authorized to check in this child');
      }
    }

    // If user is teacher, verify they own the child's class
    if (req.user.role === ROLES.STAFF && ['teacher', 'assistant', 'special_educator'].includes(req.user.staffInfo?.position)) {
      const staffInfo = await Staff.findOne({ user: req.user.id }).populate('assignedClasses');
      
      if (!staffInfo || !staffInfo.assignedClasses || staffInfo.assignedClasses.length === 0) {
        return sendError(res, 403, 'You have no assigned classes');
      }

      const assignedClassId = child.assignedClass?._id?.toString();
      const hasAccess = staffInfo.assignedClasses.some(
        cls => cls._id.toString() === assignedClassId
      );

      if (!hasAccess) {
        return sendError(res, 403, 'This child is not in any of your assigned classes');
      }
    }

    attendance.checkInTime = new Date();
    attendance.checkInBy = req.user.id;
    attendance.status = ATTENDANCE_STATUS.PRESENT;

    // Check if late (example: after 9:00 AM)
    const checkInHour = attendance.checkInTime.getHours();
    if (checkInHour >= 9) {
      attendance.isLate = true;
      attendance.status = ATTENDANCE_STATUS.LATE;
    }

    if (req.body.temperature) {
      attendance.temperature = req.body.temperature;
    }

    await attendance.save();
    await attendance.populate('child', 'firstName lastName photo');

    sendSuccess(res, 200, 'Child checked in successfully', attendance);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check out child
 * @route   POST /api/attendance/:id/check-out
 * @access  Private (Admin, Staff, Parent - own child)
 */
export const checkOutChild = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return sendError(res, 404, 'Attendance record not found');
    }

    // If not checked in yet
    if (!attendance.checkInTime) {
      return sendError(res, 400, 'Child has not been checked in yet');
    }

    // If already checked out
    if (attendance.checkOutTime) {
      return sendError(res, 400, 'Child already checked out');
    }

    // Get child record to verify authorization
    const child = await Child.findById(attendance.child).populate('assignedClass');
    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    // If user is parent, check if they own this child
    if (req.user.role === ROLES.PARENT) {
      const isParent = child.parents.some(
        (p) => p.parent.toString() === req.user.id
      );

      if (!isParent) {
        return sendError(res, 403, 'Not authorized to check out this child');
      }
    }

    // If user is teacher, verify they own the child's class
    if (req.user.role === ROLES.STAFF && ['teacher', 'assistant', 'special_educator'].includes(req.user.staffInfo?.position)) {
      const staffInfo = await Staff.findOne({ user: req.user.id }).populate('assignedClasses');
      
      if (!staffInfo || !staffInfo.assignedClasses || staffInfo.assignedClasses.length === 0) {
        return sendError(res, 403, 'You have no assigned classes');
      }

      const assignedClassId = child.assignedClass?._id?.toString();
      const hasAccess = staffInfo.assignedClasses.some(
        cls => cls._id.toString() === assignedClassId
      );

      if (!hasAccess) {
        return sendError(res, 403, 'This child is not in any of your assigned classes');
      }
    }

    attendance.checkOutTime = new Date();
    attendance.checkOutBy = req.user.id;

    // Check if early departure (example: before 4:00 PM)
    const checkOutHour = attendance.checkOutTime.getHours();
    if (checkOutHour < 16) {
      attendance.isEarlyDeparture = true;
    }

    await attendance.save();
    await attendance.populate('child', 'firstName lastName photo');

    sendSuccess(res, 200, 'Child checked out successfully', attendance);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance statistics
 * @route   GET /api/attendance/stats
 * @access  Private (Admin, Staff)
 */
export const getAttendanceStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) {
        // Parse as UTC date at start of day
        const start = typeof startDate === 'string' 
          ? new Date(startDate + 'T00:00:00.000Z')
          : new Date(startDate);
        dateQuery.date.$gte = start;
      }
      if (endDate) {
        // Parse as UTC date at end of day
        const end = typeof endDate === 'string'
          ? new Date(endDate + 'T23:59:59.999Z')
          : new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        dateQuery.date.$lte = end;
      }
    } else {
      // Default to current month (UTC)
      const now = new Date();
      const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      dateQuery.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const totalRecords = await Attendance.countDocuments(dateQuery);
    const presentCount = await Attendance.countDocuments({ ...dateQuery, status: ATTENDANCE_STATUS.PRESENT });
    const absentCount = await Attendance.countDocuments({ ...dateQuery, status: ATTENDANCE_STATUS.ABSENT });
    const lateCount = await Attendance.countDocuments({ ...dateQuery, status: ATTENDANCE_STATUS.LATE });
    const sickCount = await Attendance.countDocuments({ ...dateQuery, status: ATTENDANCE_STATUS.SICK });

    // Average attendance rate
    const attendanceRate = totalRecords > 0 
      ? ((presentCount + lateCount) / totalRecords * 100).toFixed(2)
      : 0;

    // By status
    const byStatus = await Attendance.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Daily attendance count
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
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const stats = {
      total: totalRecords,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      sick: sickCount,
      attendanceRate: parseFloat(attendanceRate),
      byStatus,
      dailyAttendance,
    };

    sendSuccess(res, 200, 'Attendance statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get today's attendance
 * @route   GET /api/attendance/today
 * @access  Private (Admin, Staff)
 */
export const getTodayAttendance = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({ date: today })
      .populate('child', 'firstName lastName photo classGroup')
      .populate('recordedBy', 'user position')
      .sort({ checkInTime: 1 });

    const checkedIn = attendance.filter((a) => a.checkInTime && !a.checkOutTime).length;
    const checkedOut = attendance.filter((a) => a.checkOutTime).length;
    const notCheckedIn = attendance.filter((a) => !a.checkInTime).length;

    sendSuccess(res, 200, "Today's attendance retrieved successfully", {
      attendance,
      summary: {
        total: attendance.length,
        checkedIn,
        checkedOut,
        notCheckedIn,
      },
    });
  } catch (error) {
    next(error);
  }
};
