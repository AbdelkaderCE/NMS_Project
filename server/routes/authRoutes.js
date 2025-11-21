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
import { protect } from '../middleware/auth.js';

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
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.put('/password', updatePasswordValidation, validate, updatePassword);

export default router;
