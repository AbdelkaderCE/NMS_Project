import { Staff } from '../models/index.js';
import ErrorResponse from '../utils/errorResponse.js';

/**
 * Middleware to check if user is admin, manager, or receptionist
 * Managers and admins can approve/reject enrollment requests
 * Receptionists can view enrollment requests (read-only)
 */
export const isAdminOrManager = async (req, res, next) => {
  try {
    // Admin always has access
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if staff member exists and is a manager or receptionist
    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ user: req.user.id });
      
      if (!staff) {
        return next(new ErrorResponse('Staff record not found', 404));
      }

      if (staff.position !== 'manager' && staff.position !== 'receptionist') {
        return next(
          new ErrorResponse(
            'Access denied. Only managers, receptionists, and administrators can access enrollment requests',
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
      new ErrorResponse('Access denied. Only managers, receptionists, and administrators can access this resource', 403)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can modify enrollment requests (approve/reject)
 * Only admins and managers can approve/reject
 * Receptionists are read-only
 */
export const canModifyEnrollment = async (req, res, next) => {
  try {
    // Admin always has access
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if staff member is a manager (not receptionist)
    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ user: req.user.id });
      
      if (!staff) {
        return next(new ErrorResponse('Staff record not found', 404));
      }

      if (staff.position !== 'manager') {
        return next(
          new ErrorResponse(
            'Access denied. Only managers and administrators can approve or reject enrollment requests',
            403
          )
        );
      }

      return next();
    }

    // If not admin or staff, deny access
    return next(
      new ErrorResponse('Access denied. Only managers and administrators can modify enrollment requests', 403)
    );
  } catch (error) {
    next(error);
  }
};
