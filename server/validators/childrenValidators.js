import { body, param } from 'express-validator';
import { CHILD_STATUS } from '../utils/constants.js';

/**
 * Validation rules for creating a child
 */
export const createChildValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      if (birthDate >= today) {
        throw new Error('Date of birth must be in the past');
      }
      return true;
    }),
  
  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('parents')
    .isArray({ min: 1 })
    .withMessage('At least one parent is required'),
  
  body('parents.*.parent')
    .notEmpty()
    .withMessage('Parent ID is required')
    .isMongoId()
    .withMessage('Invalid parent ID'),
  
  body('parents.*.relationship')
    .notEmpty()
    .withMessage('Relationship is required')
    .isIn(['mother', 'father', 'guardian', 'other'])
    .withMessage('Invalid relationship type'),
  
  body('parents.*.isPrimary')
    .optional()
    .isBoolean()
    .withMessage('isPrimary must be a boolean'),
  
  body('status')
    .optional()
    .isIn(Object.values(CHILD_STATUS))
    .withMessage(`Status must be one of: ${Object.values(CHILD_STATUS).join(', ')}`),
  
  body('classGroup')
    .optional()
    .trim(),
  
  body('specialNeeds')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special needs cannot exceed 500 characters'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

/**
 * Validation rules for updating a child
 */
export const updateChildValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid child ID'),
  
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('status')
    .optional()
    .isIn(Object.values(CHILD_STATUS))
    .withMessage(`Status must be one of: ${Object.values(CHILD_STATUS).join(', ')}`),
];

/**
 * Validation rules for medical info
 */
export const medicalInfoValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid child ID'),
  
  body('bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''])
    .withMessage('Invalid blood type'),
  
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  
  body('allergies.*.name')
    .optional()
    .notEmpty()
    .withMessage('Allergy name is required'),
  
  body('allergies.*.severity')
    .optional()
    .isIn(['mild', 'moderate', 'severe'])
    .withMessage('Severity must be mild, moderate, or severe'),
  
  body('medications')
    .optional()
    .isArray()
    .withMessage('Medications must be an array'),
  
  body('doctorPhone')
    .optional()
    .isMobilePhone()
    .withMessage('Invalid doctor phone number'),
];

/**
 * Validation rules for adding parent
 */
export const addParentValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid child ID'),
  
  body('parent')
    .notEmpty()
    .withMessage('Parent ID is required')
    .isMongoId()
    .withMessage('Invalid parent ID'),
  
  body('relationship')
    .notEmpty()
    .withMessage('Relationship is required')
    .isIn(['mother', 'father', 'guardian', 'other'])
    .withMessage('Invalid relationship type'),
  
  body('isPrimary')
    .optional()
    .isBoolean()
    .withMessage('isPrimary must be a boolean'),
];

/**
 * Validation rules for emergency contact
 */
export const emergencyContactValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid child ID'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Contact name is required'),
  
  body('relationship')
    .trim()
    .notEmpty()
    .withMessage('Relationship is required'),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Invalid phone number'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  
  body('isPrimary')
    .optional()
    .isBoolean()
    .withMessage('isPrimary must be a boolean'),
];

/**
 * Validation rules for ID parameters
 */
export const childIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid child ID'),
];

export const parentIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid child ID'),
  param('parentId')
    .isMongoId()
    .withMessage('Invalid parent ID'),
];

export const contactIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid child ID'),
  param('contactId')
    .isMongoId()
    .withMessage('Invalid contact ID'),
];

// Parent param validation for /children/parent/:parentId
export const parentParamValidation = [
  param('parentId')
    .isMongoId()
    .withMessage('Invalid parent ID'),
];
