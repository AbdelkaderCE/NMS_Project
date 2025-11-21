import { body, param, query } from 'express-validator';
import { MESSAGE_STATUS } from '../utils/constants.js';

/**
 * Validation rules for sending message
 */
export const sendMessageValidation = [
  body('recipient')
    .notEmpty()
    .withMessage('Recipient is required')
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Subject must be between 3 and 200 characters'),
  
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters'),
];

/**
 * Validation rules for message query filters
 */
export const messageQueryValidation = [
  query('status')
    .optional()
    .isIn(Object.values(MESSAGE_STATUS))
    .withMessage(`Status must be one of: ${Object.values(MESSAGE_STATUS).join(', ')}`),
];

/**
 * Validation rules for ID parameter
 */
export const messageIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid message ID'),
];

/**
 * Validation rules for user ID parameter
 */
export const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
];
