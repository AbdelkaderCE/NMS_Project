import express from 'express';
import {
  getAuditLogs,
  getResourceAuditLogs,
  getUserAuditLogs,
  getAuditStats,
} from '../controllers/auditLogController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize(ROLES.ADMIN));

// Statistics
router.get('/stats', getAuditStats);

// Get logs for specific resource
router.get('/resource/:resourceType/:resourceId', getResourceAuditLogs);

// Get logs for specific user
router.get('/user/:userId', getUserAuditLogs);

// Get all logs with filters
router.get('/', getAuditLogs);

export default router;
