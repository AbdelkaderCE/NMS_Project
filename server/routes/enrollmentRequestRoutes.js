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

const router = express.Router();

// Public or authenticated route
router.post('/', submitEnrollmentRequest);

// Parent routes
router.get('/my-requests', protect, authorize('parent'), getMyEnrollmentRequests);

// Admin/Staff routes
router.get('/', protect, authorize('admin', 'staff'), getAllEnrollmentRequests);
router.get('/:id', protect, getEnrollmentRequest);
router.post('/:id/accept', protect, authorize('admin', 'staff'), acceptEnrollmentRequest);
router.post('/:id/reject', protect, authorize('admin', 'staff'), rejectEnrollmentRequest);
router.delete('/:id', protect, authorize('admin'), deleteEnrollmentRequest);

export default router;
