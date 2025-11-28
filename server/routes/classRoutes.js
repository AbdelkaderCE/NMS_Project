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
import { allowStaffPositions } from '../middleware/staffPosition.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/').get(getClasses).post(authorize('admin', 'staff'), allowStaffPositions('manager'), createClass);

router
  .route('/:id')
  .get(getClass)
  .put(authorize('admin', 'staff'), allowStaffPositions('manager'), updateClass)
  .delete(authorize('admin', 'staff'), allowStaffPositions('manager'), deleteClass);

router.route('/:id/children').get(getClassChildren);

export default router;
