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

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/').get(getClasses).post(authorize('admin'), createClass);

router
  .route('/:id')
  .get(getClass)
  .put(authorize('admin'), updateClass)
  .delete(authorize('admin'), deleteClass);

router.route('/:id/children').get(getClassChildren);

export default router;
