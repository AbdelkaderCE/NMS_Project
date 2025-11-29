import Child from '../models/Child.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/responseHandler.js';
import { getPaginationParams, buildPagination } from '../utils/helpers.js';
import { ROLES } from '../utils/constants.js';

/**
 * @desc    Create a new child
 * @route   POST /api/children
 * @access  Private (Admin, Staff)
 */
export const createChild = async (req, res, next) => {
  try {
    const childData = req.body;

    // Validate that at least one parent exists
    if (!childData.parents || childData.parents.length === 0) {
      return sendError(res, 400, 'At least one parent is required');
    }

    // Validate all parent users exist (allow any role for flexibility)
    for (const parentInfo of childData.parents) {
      const parent = await User.findById(parentInfo.parent);
      
      if (!parent) {
        return sendError(res, 404, `Parent with ID ${parentInfo.parent} not found`);
      }
      
      // Allow admin and staff to be assigned as guardians, not just parents
      // This is useful for testing and when actual parent accounts don't exist yet
    }

    // Create child
    const child = await Child.create(childData);
    
    // Populate parent, class, and group details
    await child.populate([
      { path: 'parents.parent', select: 'firstName lastName email phone' },
      { path: 'assignedClass', select: 'name ageRange color' },
      { path: 'assignedGroup', select: 'name maxCapacity' },
    ]);

    // Audit log
    await req.audit?.log({
      action: 'CREATE',
      resourceType: 'Child',
      resourceId: child._id,
      resourceName: `${child.firstName} ${child.lastName}`,
      description: `Created child profile for ${child.firstName} ${child.lastName}`,
    });

    sendSuccess(res, 201, 'Child created successfully', child);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all children
 * @route   GET /api/children
 * @access  Private (Admin, Staff) or Parent (own children only)
 */
export const getChildren = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, search, classGroup } = req.query;

    let query = {};

    // If user is a parent, only show their children
    if (req.user.role === ROLES.PARENT) {
      query['parents.parent'] = req.user.id;
    }

    // If user is staff, check their position and apply filters
    if (req.user.role === 'staff') {
      // If staff doesn't have staffInfo, deny access (old accounts without Staff record)
      if (!req.user.staffInfo) {
        return sendPaginatedResponse(res, 200, 'No access - staff profile not found', [], {
          page,
          limit,
          totalPages: 0,
          totalItems: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
      
      const position = req.user.staffInfo.position;
      
      // Teachers and assistants only see children in their assigned groups
      if (position === 'teacher' || position === 'assistant') {
        const assignedGroups = req.user.staffInfo.assignedClasses || [];
        
        if (assignedGroups.length > 0) {
          query.assignedGroup = { $in: assignedGroups };
        } else {
          // If no groups assigned, show nothing
          return sendPaginatedResponse(res, 200, 'No children found', [], {
            page,
            limit,
            totalPages: 0,
            totalItems: 0,
            hasNextPage: false,
            hasPrevPage: false
          });
        }
      }
      // Manager, nurse, receptionist see all children (or filtered by other rules)
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by class group
    if (classGroup) {
      query.classGroup = classGroup;
    }

    // Search by name
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count for pagination
    const totalItems = await Child.countDocuments(query);

    // Get children with pagination
    const children = await Child.find(query)
      .populate('parents.parent', 'firstName lastName email phone')
      .populate('assignedClass', 'name ageRange color')
      .populate('assignedGroup', 'name maxCapacity')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = buildPagination(page, limit, totalItems);

    sendPaginatedResponse(res, 200, 'Children retrieved successfully', children, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get children by parentId (explicit parameter)
 * @route   GET /api/children/parent/:parentId
 * @access  Private (Admin/Staff) or Parent (own children only)
 */
export const getChildrenByParent = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const parentId = req.params.parentId;

    // If requester is a parent, ensure they only access their own children
    if (req.user.role === ROLES.PARENT && req.user.id !== parentId) {
      return sendError(res, 403, 'Not authorized to view other parent\'s children');
    }

    const query = { 'parents.parent': parentId };
    const totalItems = await Child.countDocuments(query);
    const children = await Child.find(query)
      .populate('parents.parent', 'firstName lastName email phone')
      .populate('assignedClass', 'name ageRange color')
      .populate('assignedGroup', 'name maxCapacity')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const pagination = buildPagination(page, limit, totalItems);
    sendPaginatedResponse(res, 200, 'Children by parent retrieved successfully', children, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single child by ID
 * @route   GET /api/children/:id
 * @access  Private (Admin, Staff) or Parent (own child only)
 */
export const getChildById = async (req, res, next) => {
  try {
    const child = await Child.findById(req.params.id)
      .populate('parents.parent', 'firstName lastName email phone avatar');

    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    // If user is a parent, check if they own this child
    if (req.user.role === ROLES.PARENT) {
      const isParent = child.parents.some(
        (p) => p.parent._id.toString() === req.user.id
      );

      if (!isParent) {
        return sendError(res, 403, 'Not authorized to access this child');
      }
    }

    sendSuccess(res, 200, 'Child retrieved successfully', child);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update child
 * @route   PUT /api/children/:id
 * @access  Private (Admin, Staff)
 */
export const updateChild = async (req, res, next) => {
  try {
    let child = await Child.findById(req.params.id);

    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    // If updating parents, validate them
    if (req.body.parents) {
      for (const parentInfo of req.body.parents) {
        const parent = await User.findById(parentInfo.parent);
        
        if (!parent) {
          return sendError(res, 404, `Parent with ID ${parentInfo.parent} not found`);
        }
        
        if (parent.role !== ROLES.PARENT) {
          return sendError(res, 400, `User ${parent.email} is not a parent`);
        }
      }
    }

    child = await Child.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('parents.parent', 'firstName lastName email phone');

    // Audit log
    await req.audit?.log({
      action: 'UPDATE',
      resourceType: 'Child',
      resourceId: child._id,
      resourceName: `${child.firstName} ${child.lastName}`,
      description: `Updated child profile for ${child.firstName} ${child.lastName}`,
    });

    sendSuccess(res, 200, 'Child updated successfully', child);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete child
 * @route   DELETE /api/children/:id
 * @access  Private (Admin only)
 */
export const deleteChild = async (req, res, next) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    await child.deleteOne();

    // Audit log
    await req.audit?.log({
      action: 'DELETE',
      resourceType: 'Child',
      resourceId: child._id,
      resourceName: `${child.firstName} ${child.lastName}`,
      description: `Deleted child profile for ${child.firstName} ${child.lastName}`,
    });

    sendSuccess(res, 200, 'Child deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add parent to child
 * @route   POST /api/children/:id/parents
 * @access  Private (Admin, Staff)
 */
export const addParentToChild = async (req, res, next) => {
  try {
    const { parent, relationship, isPrimary } = req.body;

    const child = await Child.findById(req.params.id);

    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    // Validate parent exists and has parent role
    const parentUser = await User.findById(parent);
    
    if (!parentUser) {
      return sendError(res, 404, 'Parent user not found');
    }
    
    if (parentUser.role !== ROLES.PARENT) {
      return sendError(res, 400, `User ${parentUser.email} is not a parent`);
    }

    // Check if parent already exists
    const parentExists = child.parents.some(
      (p) => p.parent.toString() === parent
    );

    if (parentExists) {
      return sendError(res, 400, 'Parent already associated with this child');
    }

    // If setting as primary, unset other primary parents
    if (isPrimary) {
      child.parents.forEach((p) => {
        p.isPrimary = false;
      });
    }

    // Add parent
    child.parents.push({ parent, relationship, isPrimary });
    await child.save();

    await child.populate('parents.parent', 'firstName lastName email phone');

    sendSuccess(res, 200, 'Parent added successfully', child);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove parent from child
 * @route   DELETE /api/children/:id/parents/:parentId
 * @access  Private (Admin, Staff)
 */
export const removeParentFromChild = async (req, res, next) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    // Check if child has only one parent
    if (child.parents.length === 1) {
      return sendError(res, 400, 'Cannot remove the only parent. Child must have at least one parent.');
    }

    // Remove parent
    child.parents = child.parents.filter(
      (p) => p.parent.toString() !== req.params.parentId
    );

    await child.save();
    await child.populate('parents.parent', 'firstName lastName email phone');

    sendSuccess(res, 200, 'Parent removed successfully', child);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update child medical info
 * @route   PUT /api/children/:id/medical
 * @access  Private (Admin, Staff)
 */
export const updateMedicalInfo = async (req, res, next) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    child.medicalInfo = {
      ...child.medicalInfo,
      ...req.body,
    };

    await child.save();
    await child.populate('parents.parent', 'firstName lastName email phone');

    sendSuccess(res, 200, 'Medical information updated successfully', child);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add emergency contact
 * @route   POST /api/children/:id/emergency-contacts
 * @access  Private (Admin, Staff)
 */
export const addEmergencyContact = async (req, res, next) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    // If setting as primary, unset other primary contacts
    if (req.body.isPrimary) {
      child.emergencyContacts.forEach((contact) => {
        contact.isPrimary = false;
      });
    }

    child.emergencyContacts.push(req.body);
    await child.save();

    sendSuccess(res, 200, 'Emergency contact added successfully', child);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove emergency contact
 * @route   DELETE /api/children/:id/emergency-contacts/:contactId
 * @access  Private (Admin, Staff)
 */
export const removeEmergencyContact = async (req, res, next) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    child.emergencyContacts = child.emergencyContacts.filter(
      (contact) => contact._id.toString() !== req.params.contactId
    );

    await child.save();

    sendSuccess(res, 200, 'Emergency contact removed successfully', child);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get children statistics
 * @route   GET /api/children/stats
 * @access  Private (Admin, Staff)
 */
export const getChildrenStats = async (req, res, next) => {
  try {
    const totalChildren = await Child.countDocuments();
    const activeChildren = await Child.countDocuments({ status: 'active' });
    const inactiveChildren = await Child.countDocuments({ status: 'inactive' });
    const graduatedChildren = await Child.countDocuments({ status: 'graduated' });

    // Group by class
    const byClass = await Child.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$classGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Age distribution
    const ageDistribution = await Child.aggregate([
      { $match: { status: 'active' } },
      {
        $project: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                365 * 24 * 60 * 60 * 1000,
              ],
            },
          },
        },
      },
      { $group: { _id: '$age', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const stats = {
      total: totalChildren,
      active: activeChildren,
      inactive: inactiveChildren,
      graduated: graduatedChildren,
      byClass,
      ageDistribution,
    };

    sendSuccess(res, 200, 'Children statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
