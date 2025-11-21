import express from 'express';
import {
  createAttendance,
  getAllAttendance,
  getAttendanceById,
  getAttendanceByChildAndDate,
  updateAttendance,
  deleteAttendance,
  checkInChild,
  checkOutChild,
  getAttendanceStats,
  getTodayAttendance,
} from '../controllers/attendanceController.js';
import {
  createAttendanceValidation,
  updateAttendanceValidation,
  checkInValidation,
  checkOutValidation,
  childDateValidation,
  attendanceQueryValidation,
  statsQueryValidation,
  attendanceIdValidation,
} from '../validators/attendanceValidators.js';
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
  getAttendanceStats
);

// Today's attendance (Admin, Staff only)
router.get(
  '/today',
  authorize(ROLES.ADMIN, ROLES.STAFF),
  getTodayAttendance
);

// Get attendance by child and date
router.get(
  '/child/:childId/date/:date',
  childDateValidation,
  validate,
  getAttendanceByChildAndDate
);

// Check-in and check-out
router.post(
  '/:id/check-in',
  checkInValidation,
  validate,
  checkInChild
);

router.post(
  '/:id/check-out',
  checkOutValidation,
  validate,
  checkOutChild
);

// CRUD operations
router
  .route('/')
  .get(
    attendanceQueryValidation,
    validate,
    getAllAttendance
  ) // Parents see only their children's attendance
  .post(
    authorize(ROLES.ADMIN, ROLES.STAFF),
    createAttendanceValidation,
    validate,
    createAttendance
  );

router
  .route('/:id')
  .get(
    attendanceIdValidation,
    validate,
    getAttendanceById
  ) // Parents can view their own children's attendance
  .put(
    authorize(ROLES.ADMIN, ROLES.STAFF),
    updateAttendanceValidation,
    validate,
    updateAttendance
  )
  .delete(
    authorize(ROLES.ADMIN),
    attendanceIdValidation,
    validate,
    deleteAttendance
  );

export default router;
