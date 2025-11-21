import { body, param } from 'express-validator';
import { STAFF_POSITION } from '../utils/constants.js';

/**
 * Validation rules for creating staff
 */
export const createStaffValidation = [
  body('user')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('employeeId')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required'),
  
  body('position')
    .notEmpty()
    .withMessage('Position is required')
    .isIn(Object.values(STAFF_POSITION))
    .withMessage(`Position must be one of: ${Object.values(STAFF_POSITION).join(', ')}`),
  
  body('department')
    .optional()
    .trim(),
  
  body('hireDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid hire date format'),
  
  body('employmentType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'temporary'])
    .withMessage('Invalid employment type'),
  
  body('salary.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary amount must be a positive number'),
  
  body('salary.payFrequency')
    .optional()
    .isIn(['hourly', 'weekly', 'bi-weekly', 'monthly', 'annually'])
    .withMessage('Invalid pay frequency'),
];

/**
 * Validation rules for updating staff
 */
export const updateStaffValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid staff ID'),
  
  body('employeeId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Employee ID cannot be empty'),
  
  body('position')
    .optional()
    .isIn(Object.values(STAFF_POSITION))
    .withMessage(`Position must be one of: ${Object.values(STAFF_POSITION).join(', ')}`),
  
  body('employmentType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'temporary'])
    .withMessage('Invalid employment type'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

/**
 * Validation rules for qualification
 */
export const qualificationValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid staff ID'),
  
  body('degree')
    .trim()
    .notEmpty()
    .withMessage('Degree is required'),
  
  body('institution')
    .trim()
    .notEmpty()
    .withMessage('Institution is required'),
  
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Invalid year'),
  
  body('field')
    .optional()
    .trim(),
];

/**
 * Validation rules for certification
 */
export const certificationValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid staff ID'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Certification name is required'),
  
  body('issuedBy')
    .optional()
    .trim(),
  
  body('issuedDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid issued date format'),
  
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date format')
    .custom((value, { req }) => {
      if (req.body.issuedDate && value) {
        if (new Date(value) <= new Date(req.body.issuedDate)) {
          throw new Error('Expiry date must be after issued date');
        }
      }
      return true;
    }),
];

/**
 * Validation rules for schedule
 */
export const scheduleValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid staff ID'),
  
  body('workDays')
    .optional()
    .isArray()
    .withMessage('Work days must be an array'),
  
  body('workDays.*')
    .optional()
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid work day'),
  
  body('startTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:MM format'),
  
  body('endTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:MM format'),
];

/**
 * Validation rules for performance rating
 */
export const performanceRatingValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid staff ID'),
  
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comments cannot exceed 500 characters'),
];

/**
 * Validation rules for termination
 */
export const terminationValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid staff ID'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
];

/**
 * Validation rules for ID parameters
 */
export const staffIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid staff ID'),
];

export const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

export const qualificationIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid staff ID'),
  param('qualificationId')
    .isMongoId()
    .withMessage('Invalid qualification ID'),
];

export const certificationIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid staff ID'),
  param('certificationId')
    .isMongoId()
    .withMessage('Invalid certification ID'),
];
