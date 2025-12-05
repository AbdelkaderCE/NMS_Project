import express from 'express';
import {
  submitAbsenceExcuse,
  getAllAbsenceExcuses,
  getPendingExcuses,
  getAbsenceExcuseById,
  reviewAbsenceExcuse,
  deleteAbsenceExcuse,
} from '../controllers/absenceExcuseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.route('/').post(submitAbsenceExcuse).get(getAllAbsenceExcuses);

router.get('/pending', getPendingExcuses);

router
  .route('/:id')
  .get(getAbsenceExcuseById)
  .delete(deleteAbsenceExcuse);

router.put('/:id/review', reviewAbsenceExcuse);

export default router;
