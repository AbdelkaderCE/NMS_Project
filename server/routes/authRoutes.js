import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  getUsers,
  updateUser,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  resetParentPassword,
  deleteParent,
  deleteUser,
  activateUser,
} from '../controllers/authController.js';
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  updatePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../validators/authValidators.js';
import { validate } from '../middleware/validate.js';
import { protect, authorize } from '../middleware/auth.js';
import { allowStaffPositions } from '../middleware/staffPosition.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.put('/reset-password/:resetToken', resetPasswordValidation, validate, resetPassword);

// Protected routes (require authentication)
router.use(protect); // All routes below this will require authentication

router.post('/logout', logout);
router.get('/me', getMe);
router.get('/users', authorize('admin', 'staff'), allowStaffPositions('manager', 'receptionist'), getUsers);
router.put('/users/:id', updateUser);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.put('/password', updatePasswordValidation, validate, updatePassword);
router.put('/reset-parent-password/:userId', resetParentPassword);
router.delete('/parents/:userId', deleteParent);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/activate', activateUser);

export default router;
