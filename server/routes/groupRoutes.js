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

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/').get(getGroups).post(authorize('admin', 'staff'), createGroup);

router
  .route('/:id')
  .get(getGroup)
  .put(authorize('admin', 'staff'), updateGroup)
  .delete(authorize('admin'), deleteGroup);

router.route('/:id/assign-child').post(authorize('admin', 'staff'), assignChildToGroup);

router.route('/:id/remove-child').post(authorize('admin', 'staff'), removeChildFromGroup);

export default router;
