import { body, param, query } from 'express-validator';

/**
 * Activity types for validation
 */
const ACTIVITY_TYPES = [
  'learning',
  'play',
  'meal',
  'nap',
  'outdoor',
  'art',
  'music',
  'reading',
  'hygiene',
  'incident',
  'milestone',
  'other',
];

/**
 * Validation rules for creating activity
 */
export const createActivityValidation = [
  body('type')
    .notEmpty()
    .withMessage('Activity type is required')
    .isIn(ACTIVITY_TYPES)
    .withMessage(`Type must be one of: ${ACTIVITY_TYPES.join(', ')}`),
  
  body('title')
    .notEmpty()
    .withMessage('Activity title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Activity description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('child')
    .if(body => body.child && body.child !== 'null' && body.child !== '')
    .isMongoId()
    .withMessage('Invalid child ID'),
  
  body('group')
    .if(body => body.group && body.group !== 'null' && body.group !== '')
    .isMongoId()
    .withMessage('Invalid group ID'),
  
  body('class')
    .if(body => body.class && body.class !== 'null' && body.class !== '')
    .isMongoId()
    .withMessage('Invalid class ID'),
  
  body('performedBy')
    .optional()
    .isMongoId()
    .withMessage('Invalid staff ID'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (in minutes)'),
  
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('Each photo must be a valid URL'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string'),
];

/**
 * Validation rules for updating activity
 */
export const updateActivityValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid activity ID'),
  
  body('type')
    .optional()
    .isIn(ACTIVITY_TYPES)
    .withMessage(`Type must be one of: ${ACTIVITY_TYPES.join(', ')}`),
  
  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (in minutes)'),
];

/**
 * Validation rules for activity query filters
 */
export const activityQueryValidation = [
  query('child')
    .optional()
    .isMongoId()
    .withMessage('Invalid child ID'),
  
  query('performedBy')
    .optional()
    .isMongoId()
    .withMessage('Invalid staff ID'),
  
  query('type')
    .optional()
    .isIn(ACTIVITY_TYPES)
    .withMessage(`Type must be one of: ${ACTIVITY_TYPES.join(', ')}`),
  
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
  
  query('childId')
    .optional()
    .isMongoId()
    .withMessage('Invalid child ID'),
  
  query('staffId')
    .optional()
    .isMongoId()
    .withMessage('Invalid staff ID'),
];

/**
 * Validation rules for ID parameter
 */
export const activityIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid activity ID'),
];

/**
 * Validation rules for child ID parameter
 */
export const childIdValidation = [
  param('childId')
    .isMongoId()
    .withMessage('Invalid child ID'),
];

/**
 * Validation rules for staff ID parameter
 */
export const staffIdValidation = [
  param('staffId')
    .isMongoId()
    .withMessage('Invalid staff ID'),
];
