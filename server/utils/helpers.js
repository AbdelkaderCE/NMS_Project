import { PAGINATION } from './constants.js';

/**
 * Build pagination metadata
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} totalItems - Total number of items
 */
export const buildPagination = (page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
    totalItems,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Get pagination parameters from request query
 * @param {Object} query - Request query object
 */
export const getPaginationParams = (query) => {
  const page = parseInt(query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(
    parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Format date to string
 * @param {Date} date - Date object
 * @param {String} format - Date format
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return null;
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'YYYY-MM-DD HH:mm:ss':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    default:
      return `${year}-${month}-${day}`;
  }
};

/**
 * Generate random string
 * @param {Number} length - Length of string
 */
export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Calculate age from date of birth
 * @param {Date} dateOfBirth - Date of birth
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Sanitize object - remove undefined and null values
 * @param {Object} obj - Object to sanitize
 */
export const sanitizeObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined && value !== null)
  );
};
