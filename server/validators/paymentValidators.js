import { body, param, query } from 'express-validator';
import { PAYMENT_STATUS, PAYMENT_METHODS, PAYMENT_TYPES } from '../utils/constants.js';

/**
 * Validation rules for creating payment
 */
export const createPaymentValidation = [
  body('child')
    .notEmpty()
    .withMessage('Child ID is required')
    .isMongoId()
    .withMessage('Invalid child ID'),
  
  body('parent')
    .notEmpty()
    .withMessage('Parent ID is required')
    .isMongoId()
    .withMessage('Invalid parent ID'),
  
  body('type')
    .notEmpty()
    .withMessage('Payment type is required')
    .isIn(Object.values(PAYMENT_TYPES))
    .withMessage(`Type must be one of: ${Object.values(PAYMENT_TYPES).join(', ')}`),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.description')
    .notEmpty()
    .withMessage('Item description is required')
    .isLength({ max: 200 })
    .withMessage('Item description cannot exceed 200 characters'),
  
  body('items.*.amount')
    .isFloat({ min: 0 })
    .withMessage('Item amount must be a positive number'),
  
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Item quantity must be at least 1'),
  
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Invalid due date format'),
  
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a positive number'),
  
  body('tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax must be a positive number'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

/**
 * Validation rules for updating payment
 */
export const updatePaymentValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid payment ID'),
  
  body('status')
    .optional()
    .isIn(Object.values(PAYMENT_STATUS))
    .withMessage(`Status must be one of: ${Object.values(PAYMENT_STATUS).join(', ')}`),
  
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.description')
    .optional()
    .notEmpty()
    .withMessage('Item description is required'),
  
  body('items.*.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Item amount must be a positive number'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
  
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a positive number'),
  
  body('tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax must be a positive number'),
];

/**
 * Validation rules for marking as paid
 */
export const markAsPaidValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid payment ID'),
  
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage(`Payment method must be one of: ${Object.values(PAYMENT_METHODS).join(', ')}`),
  
  body('transactionId')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Transaction ID cannot exceed 100 characters'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

/**
 * Validation rules for refund
 */
export const refundPaymentValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid payment ID'),
  
  body('refundAmount')
    .notEmpty()
    .withMessage('Refund amount is required')
    .isFloat({ min: 0 })
    .withMessage('Refund amount must be a positive number'),
  
  body('reason')
    .notEmpty()
    .withMessage('Refund reason is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Refund reason must be between 5 and 500 characters'),
];

/**
 * Validation rules for payment query filters
 */
export const paymentQueryValidation = [
  query('child')
    .optional()
    .isMongoId()
    .withMessage('Invalid child ID'),
  
  query('parent')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent ID'),
  
  query('status')
    .optional()
    .custom((value) => {
      // Skip validation for empty strings (from axios empty arrays)
      if (value === '' || value === null || value === undefined) return true;
      return Object.values(PAYMENT_STATUS).includes(value);
    })
    .withMessage(`Status must be one of: ${Object.values(PAYMENT_STATUS).join(', ')}`),
  
  query('type')
    .optional()
    .isIn(Object.values(PAYMENT_TYPES))
    .withMessage(`Type must be one of: ${Object.values(PAYMENT_TYPES).join(', ')}`),
  
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
];

/**
 * Validation rules for ID parameter
 */
export const paymentIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid payment ID'),
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
 * Validation rules for parent ID parameter
 */
export const parentIdValidation = [
  param('parentId')
    .isMongoId()
    .withMessage('Invalid parent ID'),
];
