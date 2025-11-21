import { sendError } from '../utils/responseHandler.js';

/**
 * Not Found Middleware - Handles 404 errors
 */
const notFound = (req, res, next) => {
  sendError(res, 404, `Route not found - ${req.originalUrl}`);
};

export default notFound;
