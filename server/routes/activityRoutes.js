import express from 'express';
import {
  createActivity,
  getAllActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  getActivitiesByChild,
  getActivitiesByStaff,
  getActivityStats,
  getTodayActivities,
} from '../controllers/activityController.js';
import {
  createActivityValidation,
  updateActivityValidation,
  activityQueryValidation,
  statsQueryValidation,
  activityIdValidation,
  childIdValidation,
  staffIdValidation,
} from '../validators/activityValidators.js';
import { validate } from '../middleware/validate.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Statistics (Admin, Staff only)
router.get(
  '/stats',
  authorize(ROLES.ADMIN, ROLES.STAFF),
  statsQueryValidation,
  validate,
  getActivityStats
);

// Today's activities
router.get(
  '/today',
  getTodayActivities
);

// Get activities by child
router.get(
  '/child/:childId',
  childIdValidation,
  activityQueryValidation,
  validate,
  getActivitiesByChild
);

// Get activities by staff (Admin, Staff only)
router.get(
  '/staff/:staffId',
  authorize(ROLES.ADMIN, ROLES.STAFF),
  staffIdValidation,
  activityQueryValidation,
  validate,
  getActivitiesByStaff
);

// CRUD operations
router
  .route('/')
  .get(
    activityQueryValidation,
    validate,
    getAllActivities
  ) // Parents see only their children's activities
  .post(
    authorize(ROLES.ADMIN, ROLES.STAFF),
    createActivityValidation,
    validate,
    createActivity
  );

router
  .route('/:id')
  .get(
    activityIdValidation,
    validate,
    getActivityById
  ) // Parents can view their own children's activities
  .put(
    authorize(ROLES.ADMIN, ROLES.STAFF),
    updateActivityValidation,
    validate,
    updateActivity
  )
  .delete(
    authorize(ROLES.ADMIN),
    activityIdValidation,
    validate,
    deleteActivity
  );

export default router;
