import express from 'express';
import {
  createClass,
  getClasses,
  getClass,
  updateClass,
  deleteClass,
  getClassChildren,
} from '../controllers/classController.js';
import { protect, authorize } from '../middleware/auth.js';
import { allowAdminOrStaffPositions } from '../middleware/staffPosition.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/').get(getClasses).post(authorize('admin', 'staff'), allowAdminOrStaffPositions('manager'), createClass);

router
  .route('/:id')
  .get(getClass)
  .put(authorize('admin', 'staff'), allowAdminOrStaffPositions('manager'), updateClass)
  .delete(authorize('admin', 'staff'), allowAdminOrStaffPositions('manager'), deleteClass);

router.route('/:id/children').get(getClassChildren);

export default router;
