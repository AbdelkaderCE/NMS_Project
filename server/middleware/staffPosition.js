import { sendError } from '../utils/responseHandler.js';

// Middleware to allow only specific staff positions
export const allowStaffPositions = (...positions) => {
  return (req, res, next) => {
    // Only staff users have positions
    if (req.user?.role !== 'staff') {
      return sendError(res, 403, 'Only staff users can perform this action');
    }

    const userPosition = req.user?.staffInfo?.position;
    if (!userPosition) {
      return sendError(res, 403, 'Staff position not found');
    }

    if (!positions.includes(userPosition)) {
      return sendError(res, 403, `Position '${userPosition}' is not allowed to perform this action`);
    }

    next();
  };
};
