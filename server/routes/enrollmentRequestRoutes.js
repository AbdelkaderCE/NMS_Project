import express from 'express';
import {
  submitEnrollmentRequest,
  getAllEnrollmentRequests,
  getEnrollmentRequest,
  acceptEnrollmentRequest,
  rejectEnrollmentRequest,
  getMyEnrollmentRequests,
  deleteEnrollmentRequest
} from '../controllers/enrollmentRequestController.js';
import { protect, authorize } from '../middleware/auth.js';
import { isAdminOrManager, canModifyEnrollment } from '../middleware/managerAuth.js';

const router = express.Router();

// Public or authenticated route
router.post('/', submitEnrollmentRequest);

// Parent routes
router.get('/my-requests', protect, authorize('parent'), getMyEnrollmentRequests);

// Admin/Manager/Receptionist routes (view access)
router.get('/', protect, authorize('admin', 'staff'), isAdminOrManager, getAllEnrollmentRequests);
router.get('/:id', protect, isAdminOrManager, getEnrollmentRequest);

// Admin/Manager only routes (modify access)
router.post('/:id/accept', protect, authorize('admin', 'staff'), canModifyEnrollment, acceptEnrollmentRequest);
router.post('/:id/reject', protect, authorize('admin', 'staff'), canModifyEnrollment, rejectEnrollmentRequest);
router.delete('/:id', protect, authorize('admin'), deleteEnrollmentRequest);

export default router;
