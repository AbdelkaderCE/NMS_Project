import EnrollmentRequest from '../models/EnrollmentRequest.js';
import Child from '../models/Child.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Group from '../models/Group.js';
import Staff from '../models/Staff.js';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/responseHandler.js';
import { getPaginationParams, buildPagination } from '../utils/helpers.js';
import { notifyEnrollmentRequest } from '../utils/notificationHelper.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Helper function to find best group for child assignment
 * Considers available capacity and returns group with most capacity
 */
const findBestGroupForChild = async (classId) => {
  try {
    const groups = await Group.find({ class: classId, isActive: true });
    
    if (groups.length === 0) {
      return null;
    }

    // Get children count for each group
    let bestGroup = null;
    let maxAvailableCapacity = -1;

    for (const group of groups) {
      const childrenCount = await Child.countDocuments({ assignedGroup: group._id });
      const availableCapacity = group.maxCapacity - childrenCount;
      
      // Select group with available capacity (prefer one with more space)
      if (availableCapacity > 0 && availableCapacity > maxAvailableCapacity) {
        maxAvailableCapacity = availableCapacity;
        bestGroup = group;
      }
    }

    return bestGroup;
  } catch (error) {
    console.error('Error finding best group:', error);
    return null;
  }
};

/**
 * @desc    Submit enrollment request (public or parent)
 * @route   POST /api/enrollment-requests
 * @access  Public or Private
 */
export const submitEnrollmentRequest = async (req, res, next) => {
  try {
    const { requestType, child, parentInfo, emergencyContacts, preferredClass, notes } = req.body;

    // Validate based on request type
    if (requestType === 'parent' && !req.user) {
      return sendError(res, 401, 'Authentication required for parent requests');
    }

    const requestData = {
      requestType,
      child,
      emergencyContacts,
      preferredClass,
      notes
    };

    if (requestType === 'public') {
      // Check if email already exists
      const existingUser = await User.findOne({ email: parentInfo.email });
      if (existingUser) {
        return sendError(res, 400, 'An account with this email already exists. Please login to submit enrollment request.');
      }
      requestData.parentInfo = parentInfo;
    } else {
      requestData.parentId = req.user.id;
    }

    const enrollmentRequest = await EnrollmentRequest.create(requestData);
    await enrollmentRequest.populate([
      { path: 'preferredClass', select: 'name ageRange' },
      { path: 'parentId', select: 'firstName lastName email phone' }
    ]);

    // Send notification to admin and staff
    try {
      const adminAndStaff = await User.find(
        { role: { $in: ['admin', 'staff'] } },
        '_id'
      );
      
      if (adminAndStaff.length > 0) {
        const io = req.app.get('io');
        const childName = `${child.firstName} ${child.lastName}`;
        const enrollmentData = {
          _id: enrollmentRequest._id,
          childName: childName,
          requestType: requestType,
          parentInfo: requestType === 'public' ? parentInfo : null,
          parentId: requestType === 'parent' ? req.user.id : null
        };
        
        await notifyEnrollmentRequest(enrollmentData, adminAndStaff, io);
      }
    } catch (notificationError) {
      console.error('Error sending enrollment notification:', notificationError);
      // Don't fail the request if notification fails
    }

    sendSuccess(res, 201, 'Enrollment request submitted successfully', enrollmentRequest);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all enrollment requests
 * @route   GET /api/enrollment-requests
 * @access  Admin, Staff
 */
export const getAllEnrollmentRequests = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);

    const query = {};
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { 'child.firstName': { $regex: search, $options: 'i' } },
        { 'child.lastName': { $regex: search, $options: 'i' } },
        { 'parentInfo.email': { $regex: search, $options: 'i' } },
        { 'parentInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const totalItems = await EnrollmentRequest.countDocuments(query);

    const requests = await EnrollmentRequest.find(query)
      .populate('preferredClass', 'name ageRange')
      .populate('parentId', 'firstName lastName email phone')
      .populate('reviewedBy', 'firstName lastName')
      .populate('createdChildId', 'firstName lastName')
      .populate('assignedClassId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = buildPagination(page, limit, totalItems);

    sendPaginatedResponse(res, 200, 'Enrollment requests retrieved successfully', requests, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single enrollment request
 * @route   GET /api/enrollment-requests/:id
 * @access  Admin, Staff, Parent (own requests only)
 */
export const getEnrollmentRequest = async (req, res, next) => {
  try {
    const request = await EnrollmentRequest.findById(req.params.id)
      .populate('preferredClass', 'name ageRange monthlyFee')
      .populate('parentId', 'firstName lastName email phone address')
      .populate('reviewedBy', 'firstName lastName')
      .populate('createdChildId')
      .populate('assignedClassId');

    if (!request) {
      return sendError(res, 404, 'Enrollment request not found');
    }

    // Parents can only see their own requests
    if (req.user.role === 'parent' && request.parentId && request.parentId._id.toString() !== req.user.id.toString()) {
      return sendError(res, 403, 'Access denied');
    }

    sendSuccess(res, 200, 'Enrollment request retrieved successfully', request);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept enrollment request
 * @route   POST /api/enrollment-requests/:id/accept
 * @access  Admin, Staff
 */
export const acceptEnrollmentRequest = async (req, res, next) => {
  try {
    const { classId, groupId } = req.body;

    const request = await EnrollmentRequest.findById(req.params.id)
      .populate('parentId')
      .populate('preferredClass');

    if (!request) {
      return sendError(res, 404, 'Enrollment request not found');
    }

    if (request.status !== 'pending') {
      return sendError(res, 400, `Request has already been ${request.status}`);
    }

    let parentUser;

    // If public request, create parent account
    if (request.requestType === 'public') {
      // Check if email already exists
      const existingUser = await User.findOne({ email: request.parentInfo.email });
      if (existingUser) {
        return sendError(res, 400, 'A parent account with this email already exists. Cannot accept this request.');
      }

      // Generate temporary password
      const tempPassword = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      parentUser = await User.create({
        firstName: request.parentInfo.firstName,
        lastName: request.parentInfo.lastName,
        email: request.parentInfo.email,
        phone: request.parentInfo.phone,
        password: hashedPassword,
        role: 'parent',
        address: request.parentInfo.address
      });

      request.createdParentId = parentUser._id;
      
      // Store temp password in response (should be emailed in production)
      parentUser.tempPassword = tempPassword;
    } else {
      parentUser = request.parentId;
    }

    // Determine class assignment
    let assignedClass;
    if (classId) {
      assignedClass = await Class.findById(classId);
      if (!assignedClass) {
        return sendError(res, 404, 'Specified class not found');
      }
    } else if (request.preferredClass) {
      assignedClass = request.preferredClass;
    } else {
      // Auto-assign based on age
      const childAgeInMonths = Math.floor(
        (Date.now() - new Date(request.child.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000) * 12
      );
      
      // Find all active classes
      const allClasses = await Class.find({ isActive: true });
      
      assignedClass = await Class.findOne({
        'ageRange.minMonths': { $lte: childAgeInMonths },
        'ageRange.maxMonths': { $gte: childAgeInMonths },
        isActive: true
      });
      
      if (!assignedClass) {
        const classInfo = allClasses.length > 0 
          ? `Available classes: ${allClasses.map(c => `${c.name} (${c.ageRange?.minMonths}-${c.ageRange?.maxMonths} months)`).join(', ')}`
          : 'No classes found in the system.';
        return sendError(res, 400, `No suitable class found for child (age: ${childAgeInMonths} months). ${classInfo} Please specify a class ID manually.`);
      }
    }

    if (!assignedClass) {
      return sendError(res, 400, 'No suitable class found for this child');
    }

    // Auto-assign to group if not specified
    let assignedGroup = null;
    if (!groupId) {
      assignedGroup = await findBestGroupForChild(assignedClass._id);
      if (!assignedGroup) {
        console.warn(`No available groups found for class ${assignedClass.name}, child will be assigned to class only`);
      }
    } else {
      // Verify group exists and belongs to class
      assignedGroup = await Group.findOne({
        _id: groupId,
        class: assignedClass._id
      });
      
      if (!assignedGroup) {
        return sendError(res, 400, 'Specified group does not belong to the assigned class');
      }
      
      // Check capacity
      const groupChildCount = await Child.countDocuments({ assignedGroup: groupId });
      if (groupChildCount >= assignedGroup.maxCapacity) {
        return sendError(res, 400, `Group has reached maximum capacity (${assignedGroup.maxCapacity} children)`);
      }
    }

    // Create child profile (ensure correct field names for class/group assignment)
    const child = await Child.create({
      firstName: request.child.firstName,
      lastName: request.child.lastName,
      dateOfBirth: request.child.dateOfBirth,
      gender: request.child.gender,
      medicalInfo: request.child.medicalInfo,
      dietaryRestrictions: request.child.dietaryRestrictions,
      photo: request.child.photo,
      emergencyContacts: request.emergencyContacts,
      parents: [{
        parent: parentUser._id,
        relationship: request.requestType === 'public' ? request.parentInfo.relationship : 'parent',
        isPrimary: true
      }],
      assignedClass: assignedClass._id,
      assignedGroup: assignedGroup?._id || null,
      status: 'active'
    });

    // Update request
    request.status = 'accepted';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.createdChildId = child._id;
    request.assignedClassId = assignedClass._id;
    await request.save();

    // Populate for response
    await request.populate([
      { path: 'reviewedBy', select: 'firstName lastName' },
      { path: 'createdChildId', select: 'firstName lastName' },
      { path: 'assignedClassId', select: 'name' }
    ]);

    const responseData = {
      request,
      parentEmail: parentUser.email,
      tempPassword: parentUser.tempPassword || null,
      assignedGroup: assignedGroup ? {
        _id: assignedGroup._id,
        name: assignedGroup.name,
        maxCapacity: assignedGroup.maxCapacity
      } : null
    };

    sendSuccess(res, 200, 'Enrollment request accepted successfully', responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject enrollment request
 * @route   POST /api/enrollment-requests/:id/reject
 * @access  Admin, Staff
 */
export const rejectEnrollmentRequest = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    const request = await EnrollmentRequest.findById(req.params.id);

    if (!request) {
      return sendError(res, 404, 'Enrollment request not found');
    }

    if (request.status !== 'pending') {
      return sendError(res, 400, `Request has already been ${request.status}`);
    }

    request.status = 'rejected';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason;
    await request.save();

    await request.populate([
      { path: 'reviewedBy', select: 'firstName lastName' }
    ]);

    sendSuccess(res, 200, 'Enrollment request rejected', request);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my enrollment requests (for parents)
 * @route   GET /api/enrollment-requests/my-requests
 * @access  Parent
 */
export const getMyEnrollmentRequests = async (req, res, next) => {
  try {
    const requests = await EnrollmentRequest.find({ parentId: req.user.id })
      .populate('preferredClass', 'name ageRange monthlyFee')
      .populate('reviewedBy', 'firstName lastName')
      .populate('createdChildId', 'firstName lastName')
      .populate('assignedClassId', 'name')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Your enrollment requests retrieved successfully', requests);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete enrollment request
 * @route   DELETE /api/enrollment-requests/:id
 * @access  Admin
 */
export const deleteEnrollmentRequest = async (req, res, next) => {
  try {
    const request = await EnrollmentRequest.findById(req.params.id);

    if (!request) {
      return sendError(res, 404, 'Enrollment request not found');
    }

    await request.deleteOne();

    sendSuccess(res, 200, 'Enrollment request deleted successfully');
  } catch (error) {
    next(error);
  }
};
