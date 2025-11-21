import express from 'express';
import {
  getDashboardOverview,
  getEnrollmentStats,
  getAttendanceAnalytics,
  getRevenueAnalytics,
  getStaffAnalytics,
  getActivitySummary,
  getParentEngagement,
  getQuickStats,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Quick stats for all users
router.get('/quick-stats', getQuickStats);

// Dashboard overview (Admin, Staff)
router.get(
  '/overview',
  authorize(ROLES.ADMIN, ROLES.STAFF),
  getDashboardOverview
);

// Enrollment statistics (Admin, Staff)
router.get(
  '/enrollment',
  authorize(ROLES.ADMIN, ROLES.STAFF),
  getEnrollmentStats
);

// Attendance analytics (Admin, Staff)
router.get(
  '/attendance',
  authorize(ROLES.ADMIN, ROLES.STAFF),
  getAttendanceAnalytics
);

// Revenue analytics (Admin only)
router.get(
  '/revenue',
  authorize(ROLES.ADMIN),
  getRevenueAnalytics
);

// Staff analytics (Admin only)
router.get(
  '/staff',
  authorize(ROLES.ADMIN),
  getStaffAnalytics
);

// Activity summary (Admin, Staff)
router.get(
  '/activities',
  authorize(ROLES.ADMIN, ROLES.STAFF),
  getActivitySummary
);

// Parent engagement (Admin, Staff)
router.get(
  '/parent-engagement',
  authorize(ROLES.ADMIN, ROLES.STAFF),
  getParentEngagement
);

export default router;
