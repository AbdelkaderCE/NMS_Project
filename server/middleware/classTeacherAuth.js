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

    // Get teacher's assigned classes (assignedClasses field contains Class IDs)
    const staffInfo = await Staff.findOne({ user: req.user.id });
    
    if (!staffInfo || !staffInfo.assignedClasses || staffInfo.assignedClasses.length === 0) {
      return sendError(res, 403, 'You have no assigned classes');
    }

    // assignedClasses contains Class IDs directly
    const teacherClassIds = staffInfo.assignedClasses.map(id => id.toString());
    const childClassId = child.assignedClass?._id?.toString();
    
    // Check if child's class is in teacher's assigned classes
    const hasAccess = childClassId && teacherClassIds.includes(childClassId);

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

    // Get teacher's assigned classes (stored in assignedClasses field as Class IDs)
    const staffInfo = await Staff.findOne({ user: req.user.id });
    
    if (!staffInfo || !staffInfo.assignedClasses || staffInfo.assignedClasses.length === 0) {
      // Teacher has no assigned classes, attach empty filter
      req.teacherAssignedGroupIds = [];
      req.teacherAssignedClassIds = [];
      req.isTeacherWithoutClasses = true;
      return next();
    }

    // assignedClasses contains Class IDs directly
    const classIds = staffInfo.assignedClasses;
    
    // Find all groups that belong to these classes
    const Group = (await import('../models/Group.js')).default;
    const groups = await Group.find({ class: { $in: classIds } }).select('_id');
    const groupIds = groups.map(g => g._id);
    
    req.teacherAssignedGroupIds = groupIds;
    req.teacherAssignedClassIds = classIds;
    next();
  } catch (error) {
    next(error);
  }
};

export default classTeacherAuth;
