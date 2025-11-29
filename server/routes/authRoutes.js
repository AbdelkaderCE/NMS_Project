import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  getUsers,
  getContacts,
  updateUser,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  resetParentPassword,
  deleteParent,
  deleteUser,
  activateUser,
  getUserById,
  setUserPassword,
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
import { allowStaffPositions, allowAdminOrStaffPositions } from '../middleware/staffPosition.js';

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
// Allow admin, and for staff restrict to manager or receptionist when listing users (e.g., parents)
router.get('/users', authorize('admin', 'staff'), allowAdminOrStaffPositions('manager', 'receptionist'), getUsers);
// Contacts endpoint for messaging: available to any authenticated user, role-aware filtering
router.get('/contacts', getContacts);
// Edit user: allow admin or staff with manager position
router.put('/users/:id', authorize('admin', 'staff'), allowAdminOrStaffPositions('manager'), updateUser);
// View user profile by id: allow admin or staff with manager position, or self handled in controller
router.get('/users/:id', authorize('admin', 'staff'), allowAdminOrStaffPositions('manager'), getUserById);
// Set another user's password: admin or staff manager
router.put('/users/:id/password', authorize('admin', 'staff'), allowAdminOrStaffPositions('manager'), setUserPassword);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.put('/password', updatePasswordValidation, validate, updatePassword);
router.put('/reset-parent-password/:userId', resetParentPassword);
router.delete('/parents/:userId', deleteParent);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/activate', activateUser);

export default router;
