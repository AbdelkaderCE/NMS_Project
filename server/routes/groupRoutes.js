import express from 'express';
import {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  assignChildToGroup,
  removeChildFromGroup,
} from '../controllers/groupController.js';
import { protect, authorize } from '../middleware/auth.js';
import { allowStaffPositions } from '../middleware/staffPosition.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/').get(getGroups).post(authorize('admin', 'staff'), allowStaffPositions('manager'), createGroup);

router
  .route('/:id')
  .get(getGroup)
  .put(authorize('admin', 'staff'), allowStaffPositions('manager'), updateGroup)
  .delete(authorize('admin', 'staff'), allowStaffPositions('manager'), deleteGroup);

router.route('/:id/assign-child').post(authorize('admin', 'staff'), allowStaffPositions('manager'), assignChildToGroup);

router.route('/:id/remove-child').post(authorize('admin', 'staff'), allowStaffPositions('manager'), removeChildFromGroup);

export default router;
