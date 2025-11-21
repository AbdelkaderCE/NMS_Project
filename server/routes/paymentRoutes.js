import express from 'express';
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  markAsPaid,
  refundPayment,
  getOverduePayments,
  getPaymentStats,
  getPaymentsByChild,
  getPaymentsByParent,
} from '../controllers/paymentController.js';
import {
  createPaymentValidation,
  updatePaymentValidation,
  markAsPaidValidation,
  refundPaymentValidation,
  paymentQueryValidation,
  statsQueryValidation,
  paymentIdValidation,
  childIdValidation,
  parentIdValidation,
} from '../validators/paymentValidators.js';
import { validate } from '../middleware/validate.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Statistics (Admin, Staff only)
router.get(
  '/stats',
  authorize(ROLES.ADMIN, ROLES.STAFF),
  statsQueryValidation,
  validate,
  getPaymentStats
);

// Overdue payments (Admin, Staff only)
router.get(
  '/overdue',
  authorize(ROLES.ADMIN, ROLES.STAFF),
  getOverduePayments
);

// Get payments by child
router.get(
  '/child/:childId',
  childIdValidation,
  validate,
  getPaymentsByChild
);

// Get payments by parent
router.get(
  '/parent/:parentId',
  parentIdValidation,
  validate,
  getPaymentsByParent
);

// Mark as paid and refund
router.post(
  '/:id/pay',
  markAsPaidValidation,
  validate,
  markAsPaid
);

router.post(
  '/:id/refund',
  authorize(ROLES.ADMIN),
  refundPaymentValidation,
  validate,
  refundPayment
);

// CRUD operations
router
  .route('/')
  .get(
    paymentQueryValidation,
    validate,
    getAllPayments
  ) // Parents see only their payments
  .post(
    authorize(ROLES.ADMIN, ROLES.STAFF),
    createPaymentValidation,
    validate,
    createPayment
  );

router
  .route('/:id')
  .get(
    paymentIdValidation,
    validate,
    getPaymentById
  ) // Parents can view their own payments
  .put(
    authorize(ROLES.ADMIN, ROLES.STAFF),
    updatePaymentValidation,
    validate,
    updatePayment
  )
  .delete(
    authorize(ROLES.ADMIN),
    paymentIdValidation,
    validate,
    deletePayment
  );

export default router;
