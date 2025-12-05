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
import { allowAdminOrStaffPositions } from '../middleware/staffPosition.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/').get(getGroups).post(authorize('admin', 'staff'), allowAdminOrStaffPositions('manager'), createGroup);

router
  .route('/:id')
  .get(getGroup)
  .put(authorize('admin', 'staff'), allowAdminOrStaffPositions('manager'), updateGroup)
  .delete(authorize('admin', 'staff'), allowAdminOrStaffPositions('manager'), deleteGroup);

router.route('/:id/assign-child').post(authorize('admin', 'staff'), allowAdminOrStaffPositions('manager'), assignChildToGroup);

router.route('/:id/remove-child').post(authorize('admin', 'staff'), allowAdminOrStaffPositions('manager'), removeChildFromGroup);

export default router;
