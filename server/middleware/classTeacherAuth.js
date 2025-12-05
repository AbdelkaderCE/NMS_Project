import ErrorResponse from '../utils/errorResponse.js';
import { sendError } from '../utils/responseHandler.js';
import Staff from '../models/Staff.js';
import Child from '../models/Child.js';

/**
 * Middleware to verify if a teacher has access to a specific child
 * Checks if the child is in one of the teacher's assigned classes
 * 
 * Supports child ID from:
 * - URL params: :childId or :id
 * - Request body: child field
 * 
 * Usage: 
 * - router.get('/api/children/:childId/details', classTeacherAuth, getChildDetails)
 * - router.post('/api/attendance', classTeacherAuth, createAttendance) // Uses req.body.child
 */
export const classTeacherAuth = async (req, res, next) => {
  try {
    // Only apply to teacher/assistant roles
    if (req.user.role !== 'staff' || !req.user.staffInfo) {
      return next(); // Not staff, let other authorization handle it
    }

    const position = req.user.staffInfo.position;
    if (!['teacher', 'assistant', 'special_educator'].includes(position)) {
      return next(); // Not a teacher role, pass through
    }

    // Get the childId from params or body
    const childId = req.params.childId || req.params.id || req.body.child;
    if (!childId) {
      return next(); // No child ID to validate, pass through
    }

    // Get child and populate assigned class and group
    const child = await Child.findById(childId).populate('assignedClass assignedGroup');
    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    // Get teacher's assigned classes (which are actually Groups)
    const staffInfo = await Staff.findOne({ user: req.user.id })
      .populate('assignedClasses');
    
    if (!staffInfo || !staffInfo.assignedClasses || staffInfo.assignedClasses.length === 0) {
      return sendError(res, 403, 'You have no assigned classes');
    }

    // Check if child's assigned group is in teacher's assigned groups
    const assignedGroupId = child.assignedGroup?._id?.toString();
    let hasAccess = false;
    
    // First check if child is in one of teacher's assigned groups
    if (assignedGroupId) {
      hasAccess = staffInfo.assignedClasses.some(
        group => group._id.toString() === assignedGroupId
      );
    }
    
    // Also check if child's assigned class matches one of the teacher's class assignments
    if (!hasAccess) {
      const assignedClassId = child.assignedClass?._id?.toString();
      if (assignedClassId) {
        const teacherClassIds = staffInfo.assignedClasses
          .map(group => group.class?.toString())
          .filter(Boolean);
        hasAccess = teacherClassIds.includes(assignedClassId);
      }
    }

    if (!hasAccess) {
      return sendError(res, 403, 'This child is not in any of your assigned classes or groups');
    }

    // Attach child to request for use in controller
    req.childData = child;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to filter children list to only teacher's assigned classes
 * Applied to GET /api/children endpoint
 * 
 * Usage: router.get('/api/children', teacherClassFilter, getChildren)
 */
export const teacherClassFilter = async (req, res, next) => {
  try {
    // Only apply to teacher/assistant roles
    if (req.user.role !== 'staff' || !req.user.staffInfo) {
      return next(); // Let other roles pass through
    }

    const position = req.user.staffInfo.position;
    if (!['teacher', 'assistant', 'special_educator'].includes(position)) {
      return next(); // Not a teacher, pass through
    }

    // Get teacher's assigned groups (stored in assignedClasses field)
    const staffInfo = await Staff.findOne({ user: req.user.id })
      .populate('assignedClasses'); // This actually populates Groups
    
    if (!staffInfo || !staffInfo.assignedClasses || staffInfo.assignedClasses.length === 0) {
      // Teacher has no assigned groups, attach empty filter
      req.teacherAssignedGroupIds = [];
      req.teacherAssignedClassIds = [];
      req.isTeacherWithoutClasses = true;
      return next();
    }

    // Extract group IDs and their class IDs
    const groupIds = staffInfo.assignedClasses.map(group => group._id);
    const classIds = [...new Set(staffInfo.assignedClasses.map(group => group.class).filter(Boolean))];
    
    req.teacherAssignedGroupIds = groupIds;
    req.teacherAssignedClassIds = classIds;
    next();
  } catch (error) {
    next(error);
  }
};

export default classTeacherAuth;
