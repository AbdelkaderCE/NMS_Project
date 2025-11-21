import { body, param, query } from 'express-validator';
import { ATTENDANCE_STATUS } from '../utils/constants.js';

/**
 * Validation rules for creating attendance
 */
export const createAttendanceValidation = [
  body('child')
    .notEmpty()
    .withMessage('Child ID is required')
    .isMongoId()
    .withMessage('Invalid child ID'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('status')
    .optional()
    .isIn(Object.values(ATTENDANCE_STATUS))
    .withMessage(`Status must be one of: ${Object.values(ATTENDANCE_STATUS).join(', ')}`),
  
  body('recordedBy')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isMongoId()
    .withMessage('Invalid staff ID'),
  
  body('checkInTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid check-in time format'),
  
  body('checkOutTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid check-out time format')
    .custom((value, { req }) => {
      if (req.body.checkInTime && value) {
        if (new Date(value) <= new Date(req.body.checkInTime)) {
          throw new Error('Check-out time must be after check-in time');
        }
      }
      return true;
    }),
  
  body('temperature.value')
    .optional()
    .isFloat({ min: 30, max: 45 })
    .withMessage('Temperature must be between 30 and 45'),
  
  body('temperature.unit')
    .optional()
    .isIn(['celsius', 'fahrenheit'])
    .withMessage('Temperature unit must be celsius or fahrenheit'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

/**
 * Validation rules for updating attendance
 */
export const updateAttendanceValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid attendance ID'),
  
  body('status')
    .optional()
    .isIn(Object.values(ATTENDANCE_STATUS))
    .withMessage(`Status must be one of: ${Object.values(ATTENDANCE_STATUS).join(', ')}`),
  
  body('checkInTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid check-in time format'),
  
  body('checkOutTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid check-out time format'),
  
  body('temperature.value')
    .optional()
    .isFloat({ min: 30, max: 45 })
    .withMessage('Temperature must be between 30 and 45'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

/**
 * Validation rules for check-in
 */
export const checkInValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid attendance ID'),
  
  body('temperature.value')
    .optional()
    .isFloat({ min: 30, max: 45 })
    .withMessage('Temperature must be between 30 and 45'),
  
  body('temperature.unit')
    .optional()
    .isIn(['celsius', 'fahrenheit'])
    .withMessage('Temperature unit must be celsius or fahrenheit'),
];

/**
 * Validation rules for check-out
 */
export const checkOutValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid attendance ID'),
];

/**
 * Validation rules for getting attendance by child and date
 */
export const childDateValidation = [
  param('childId')
    .isMongoId()
    .withMessage('Invalid child ID'),
  
  param('date')
    .isISO8601()
    .withMessage('Invalid date format'),
];

/**
 * Validation rules for attendance query filters
 */
export const attendanceQueryValidation = [
  query('child')
    .optional()
    .isMongoId()
    .withMessage('Invalid child ID'),
  
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (req.query.startDate && value) {
        if (new Date(value) < new Date(req.query.startDate)) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  
  query('status')
    .optional()
    .isIn(Object.values(ATTENDANCE_STATUS))
    .withMessage(`Status must be one of: ${Object.values(ATTENDANCE_STATUS).join(', ')}`),
];

/**
 * Validation rules for stats query
 */
export const statsQueryValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
];

/**
 * Validation rules for ID parameter
 */
export const attendanceIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid attendance ID'),
];
