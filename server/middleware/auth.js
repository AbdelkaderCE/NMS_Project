import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Staff from '../models/Staff.js';
import ErrorResponse from '../utils/errorResponse.js';
import { sendError } from '../utils/responseHandler.js';

/**
 * Protect routes - Verify JWT token
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return sendError(res, 401, 'Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return sendError(res, 401, 'User not found');
    }

    // Check if user is active
    if (!req.user.isActive) {
      return sendError(res, 401, 'User account is deactivated');
    }

    // Attach staff info with position and assignedClasses for staff users
    if (req.user.role === 'staff') {
      const staffInfo = await Staff.findOne({ user: req.user._id })
        .select('position assignedClasses firstName lastName employeeId');
      
      if (staffInfo) {
        req.user.staffInfo = staffInfo;
      }
    }

    next();
  } catch (error) {
    return sendError(res, 401, 'Not authorized to access this route');
  }
};

/**
 * Grant access to specific roles
 * @param  {...any} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Not authorized to access this route');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `User role '${req.user.role}' is not authorized to access this route`
      );
    }
    
    next();
  };
};
