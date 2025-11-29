import express from 'express';
import {
  createChild,
  getChildren,
  getChildById,
  updateChild,
  deleteChild,
  addParentToChild,
  removeParentFromChild,
  updateMedicalInfo,
  addEmergencyContact,
  removeEmergencyContact,
  getChildrenStats,
  getChildrenByParent,
} from '../controllers/childrenController.js';
import {
  createChildValidation,
  updateChildValidation,
  medicalInfoValidation,
  addParentValidation,
  emergencyContactValidation,
  childIdValidation,
  parentIdValidation,
  contactIdValidation,
  parentParamValidation,
} from '../validators/childrenValidators.js';
import { validate } from '../middleware/validate.js';
import { allowStaffPositions } from '../middleware/staffPosition.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Statistics (Admin, Staff only)
router.get(
  '/stats',
  authorize(ROLES.ADMIN, ROLES.STAFF),
  getChildrenStats
);

// Get children by parent
router.get(
  '/parent/:parentId',
  parentParamValidation,
  validate,
  getChildrenByParent
);

// CRUD operations
router
  .route('/')
  .get(getChildren) // Parents see only their children
  .post(
    authorize(ROLES.ADMIN, ROLES.STAFF),
    // For staff, restrict to manager or receptionist positions only
    allowStaffPositions('manager', 'receptionist'),
    createChildValidation,
    validate,
    createChild
  );

router
  .route('/:id')
  .get(childIdValidation, validate, getChildById) // Parents can view their own children
  .put(
    authorize(ROLES.ADMIN, ROLES.STAFF),
    allowStaffPositions('manager', 'receptionist'),
    updateChildValidation,
    validate,
    updateChild
  )
  .delete(
    authorize(ROLES.ADMIN, ROLES.STAFF),
    allowStaffPositions('manager', 'receptionist'),
    childIdValidation,
    validate,
    deleteChild
  );

// Parent management
router
  .route('/:id/parents')
  .post(
    authorize(ROLES.ADMIN, ROLES.STAFF),
    addParentValidation,
    validate,
    addParentToChild
  );

router
  .route('/:id/parents/:parentId')
  .delete(
    authorize(ROLES.ADMIN, ROLES.STAFF),
    parentIdValidation,
    validate,
    removeParentFromChild
  );

// Medical information
router
  .route('/:id/medical')
  .put(
    authorize(ROLES.ADMIN, ROLES.STAFF),
    medicalInfoValidation,
    validate,
    updateMedicalInfo
  );

// Emergency contacts
router
  .route('/:id/emergency-contacts')
  .post(
    authorize(ROLES.ADMIN, ROLES.STAFF),
    emergencyContactValidation,
    validate,
    addEmergencyContact
  );

router
  .route('/:id/emergency-contacts/:contactId')
  .delete(
    authorize(ROLES.ADMIN, ROLES.STAFF),
    contactIdValidation,
    validate,
    removeEmergencyContact
  );

export default router;
