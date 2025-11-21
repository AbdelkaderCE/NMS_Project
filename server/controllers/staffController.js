import Staff from '../models/Staff.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/responseHandler.js';
import { getPaginationParams, buildPagination } from '../utils/helpers.js';
import { ROLES } from '../utils/constants.js';

/**
 * @desc    Create staff profile
 * @route   POST /api/staff
 * @access  Private (Admin only)
 */
export const createStaff = async (req, res, next) => {
  try {
    const { user, employeeId, position, department, hireDate, ...otherData } = req.body;

    // Validate user exists and has staff role
    const userRecord = await User.findById(user);
    
    if (!userRecord) {
      return sendError(res, 404, 'User not found');
    }
    
    if (userRecord.role !== ROLES.STAFF) {
      return sendError(res, 400, 'User must have staff role');
    }

    // Check if staff profile already exists for this user
    const existingStaff = await Staff.findOne({ user });
    if (existingStaff) {
      return sendError(res, 400, 'Staff profile already exists for this user');
    }

    // Check if employee ID already exists
    const existingEmployeeId = await Staff.findOne({ employeeId });
    if (existingEmployeeId) {
      return sendError(res, 400, 'Employee ID already exists');
    }

    // Create staff profile
    const staff = await Staff.create({
      user,
      employeeId,
      position,
      department,
      hireDate: hireDate || Date.now(),
      ...otherData,
    });

    await staff.populate('user', 'firstName lastName email phone avatar');

    sendSuccess(res, 201, 'Staff profile created successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all staff
 * @route   GET /api/staff
 * @access  Private (Admin, Staff)
 */
export const getAllStaff = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { position, department, isActive, search } = req.query;

    let query = {};

    // Filter by position
    if (position) {
      query.position = position;
    }

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search by employee ID
    if (search) {
      query.employeeId = { $regex: search, $options: 'i' };
    }

    const totalItems = await Staff.countDocuments(query);

    const staff = await Staff.find(query)
      .populate('user', 'firstName lastName email phone avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = buildPagination(page, limit, totalItems);

    sendPaginatedResponse(res, 200, 'Staff retrieved successfully', staff, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single staff by ID
 * @route   GET /api/staff/:id
 * @access  Private (Admin, Staff)
 */
export const getStaffById = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('user', 'firstName lastName email phone avatar address')
      .populate('performanceRatings.reviewedBy', 'firstName lastName');

    if (!staff) {
      return sendError(res, 404, 'Staff not found');
    }

    sendSuccess(res, 200, 'Staff retrieved successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get staff by user ID
 * @route   GET /api/staff/user/:userId
 * @access  Private (Admin, Staff - own profile)
 */
export const getStaffByUserId = async (req, res, next) => {
  try {
    const staff = await Staff.findOne({ user: req.params.userId })
      .populate('user', 'firstName lastName email phone avatar address')
      .populate('performanceRatings.reviewedBy', 'firstName lastName');

    if (!staff) {
      return sendError(res, 404, 'Staff profile not found');
    }

    // Staff can only view their own profile unless they're admin
    if (req.user.role === ROLES.STAFF && req.user.id !== req.params.userId) {
      return sendError(res, 403, 'Not authorized to view this profile');
    }

    sendSuccess(res, 200, 'Staff retrieved successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update staff profile
 * @route   PUT /api/staff/:id
 * @access  Private (Admin only)
 */
export const updateStaff = async (req, res, next) => {
  try {
    let staff = await Staff.findById(req.params.id);

    if (!staff) {
      return sendError(res, 404, 'Staff not found');
    }

    // If updating employee ID, check if it's unique
    if (req.body.employeeId && req.body.employeeId !== staff.employeeId) {
      const existingEmployeeId = await Staff.findOne({ employeeId: req.body.employeeId });
      if (existingEmployeeId) {
        return sendError(res, 400, 'Employee ID already exists');
      }
    }

    staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('user', 'firstName lastName email phone avatar');

    sendSuccess(res, 200, 'Staff updated successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete staff profile
 * @route   DELETE /api/staff/:id
 * @access  Private (Admin only)
 */
export const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return sendError(res, 404, 'Staff not found');
    }

    await staff.deleteOne();

    sendSuccess(res, 200, 'Staff deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add qualification to staff
 * @route   POST /api/staff/:id/qualifications
 * @access  Private (Admin only)
 */
export const addQualification = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return sendError(res, 404, 'Staff not found');
    }

    staff.qualifications.push(req.body);
    await staff.save();

    await staff.populate('user', 'firstName lastName email phone');

    sendSuccess(res, 200, 'Qualification added successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove qualification from staff
 * @route   DELETE /api/staff/:id/qualifications/:qualificationId
 * @access  Private (Admin only)
 */
export const removeQualification = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return sendError(res, 404, 'Staff not found');
    }

    staff.qualifications = staff.qualifications.filter(
      (qual) => qual._id.toString() !== req.params.qualificationId
    );

    await staff.save();

    sendSuccess(res, 200, 'Qualification removed successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add certification to staff
 * @route   POST /api/staff/:id/certifications
 * @access  Private (Admin only)
 */
export const addCertification = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return sendError(res, 404, 'Staff not found');
    }

    staff.certifications.push(req.body);
    await staff.save();

    await staff.populate('user', 'firstName lastName email phone');

    sendSuccess(res, 200, 'Certification added successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove certification from staff
 * @route   DELETE /api/staff/:id/certifications/:certificationId
 * @access  Private (Admin only)
 */
export const removeCertification = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return sendError(res, 404, 'Staff not found');
    }

    staff.certifications = staff.certifications.filter(
      (cert) => cert._id.toString() !== req.params.certificationId
    );

    await staff.save();

    sendSuccess(res, 200, 'Certification removed successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update staff schedule
 * @route   PUT /api/staff/:id/schedule
 * @access  Private (Admin only)
 */
export const updateSchedule = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return sendError(res, 404, 'Staff not found');
    }

    staff.schedule = {
      ...staff.schedule,
      ...req.body,
    };

    await staff.save();
    await staff.populate('user', 'firstName lastName email phone');

    sendSuccess(res, 200, 'Schedule updated successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add performance rating
 * @route   POST /api/staff/:id/performance
 * @access  Private (Admin only)
 */
export const addPerformanceRating = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return sendError(res, 404, 'Staff not found');
    }

    const { rating, comments } = req.body;

    staff.performanceRatings.push({
      date: new Date(),
      rating,
      reviewedBy: req.user.id,
      comments,
    });

    await staff.save();
    await staff.populate('performanceRatings.reviewedBy', 'firstName lastName');

    sendSuccess(res, 200, 'Performance rating added successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Terminate staff
 * @route   POST /api/staff/:id/terminate
 * @access  Private (Admin only)
 */
export const terminateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return sendError(res, 404, 'Staff not found');
    }

    staff.isActive = false;
    staff.terminationDate = new Date();
    staff.terminationReason = req.body.reason || '';

    await staff.save();

    // Deactivate user account
    await User.findByIdAndUpdate(staff.user, { isActive: false });

    sendSuccess(res, 200, 'Staff terminated successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reactivate staff
 * @route   POST /api/staff/:id/reactivate
 * @access  Private (Admin only)
 */
export const reactivateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return sendError(res, 404, 'Staff not found');
    }

    staff.isActive = true;
    staff.terminationDate = null;
    staff.terminationReason = '';

    await staff.save();

    // Reactivate user account
    await User.findByIdAndUpdate(staff.user, { isActive: true });

    sendSuccess(res, 200, 'Staff reactivated successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get staff statistics
 * @route   GET /api/staff/stats
 * @access  Private (Admin only)
 */
export const getStaffStats = async (req, res, next) => {
  try {
    const totalStaff = await Staff.countDocuments();
    const activeStaff = await Staff.countDocuments({ isActive: true });
    const inactiveStaff = await Staff.countDocuments({ isActive: false });

    // Group by position
    const byPosition = await Staff.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$position', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Group by department
    const byDepartment = await Staff.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Average years of service
    const staffWithYears = await Staff.find({ isActive: true });
    const avgYearsOfService = staffWithYears.reduce((acc, staff) => {
      const years = new Date().getFullYear() - new Date(staff.hireDate).getFullYear();
      return acc + years;
    }, 0) / (staffWithYears.length || 1);

    const stats = {
      total: totalStaff,
      active: activeStaff,
      inactive: inactiveStaff,
      byPosition,
      byDepartment,
      avgYearsOfService: Math.round(avgYearsOfService * 10) / 10,
    };

    sendSuccess(res, 200, 'Staff statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
