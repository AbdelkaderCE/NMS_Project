import { Staff } from '../models/index.js';
import ErrorResponse from '../utils/errorResponse.js';

/**
 * Middleware to check if staff member is a teacher
 * This allows only teachers to mark attendance
 */
export const isTeacher = async (req, res, next) => {
  try {
    // Admin always has access
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if staff member exists and is a teacher or assistant
    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ user: req.user.id });
      
      if (!staff) {
        return next(new ErrorResponse('Staff record not found', 404));
      }

      if (staff.position !== 'teacher' && staff.position !== 'assistant') {
        return next(
          new ErrorResponse(
            'Access denied. Only teachers and assistants can mark attendance',
            403
          )
        );
      }

      // Attach staff info to request for later use
      req.staffInfo = staff;
      return next();
    }

    // If not admin or staff, deny access
    return next(
      new ErrorResponse('Access denied. Only teachers, assistants and admin can access this resource', 403)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to filter children by teacher's assigned groups
 * Teachers can only see children in their assigned groups
 */
export const filterByTeacherGroups = async (req, res, next) => {
  try {
    // Admin and non-teachers bypass this filter
    if (req.user.role === 'admin' || !req.staffInfo) {
      return next();
    }

    // Get teacher's assigned classes/groups
    const staff = req.staffInfo;
    
    // If teacher has assigned classes, add filter to query
    if (staff.assignedClasses && staff.assignedClasses.length > 0) {
      req.teacherFilter = {
        assignedClass: { $in: staff.assignedClasses }
      };
    }

    next();
  } catch (error) {
    next(error);
  }
};
