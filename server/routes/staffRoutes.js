import express from 'express';
import {
  createStaff,
  getAllStaff,
  getStaffById,
  getStaffByUserId,
  updateStaff,
  deleteStaff,
  addQualification,
  removeQualification,
  addCertification,
  removeCertification,
  updateSchedule,
  addPerformanceRating,
  terminateStaff,
  reactivateStaff,
  getStaffStats,
} from '../controllers/staffController.js';
import {
  createStaffValidation,
  updateStaffValidation,
  qualificationValidation,
  certificationValidation,
  scheduleValidation,
  performanceRatingValidation,
  terminationValidation,
  staffIdValidation,
  userIdValidation,
  qualificationIdValidation,
  certificationIdValidation,
} from '../validators/staffValidators.js';
import { validate } from '../middleware/validate.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create staff with user account (Admin only)
router.post(
  '/create-with-user',
  authorize(ROLES.ADMIN),
  async (req, res, next) => {
    try {
      const { firstName, lastName, email, password, phone, role, employeeId, position, ...otherData } = req.body;
      
      // Import User model
      const User = (await import('../models/User.js')).default;
      const Staff = (await import('../models/Staff.js')).default;
      
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }
      
      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        phone: phone || '+0000000000',
        role: 'staff'
      });
      
      // Build staff data - only include valid fields
      const staffData = {
        user: user._id,
        employeeId: employeeId || `EMP${Date.now().toString().slice(-6)}`,
        position,
      };
      
      // Add optional fields only if they exist and are valid
      if (otherData.department) staffData.department = otherData.department;
      if (otherData.hireDate) staffData.hireDate = otherData.hireDate;
      if (otherData.employmentType) staffData.employmentType = otherData.employmentType;
      if (otherData.employmentStatus) staffData.employmentStatus = otherData.employmentStatus;
      
      // Handle salary subdocument
      if (otherData.salary && typeof otherData.salary === 'object') {
        staffData.salary = otherData.salary;
      }
      
      // Handle emergencyContact subdocument - only if name exists
      if (otherData.emergencyContact && typeof otherData.emergencyContact === 'object' && otherData.emergencyContact.name) {
        staffData.emergencyContact = otherData.emergencyContact;
      }
      
      // Handle schedule subdocument
      if (otherData.schedule && typeof otherData.schedule === 'object') {
        staffData.schedule = otherData.schedule;
      }
      
      // Handle arrays - only if they're actual arrays
      if (Array.isArray(otherData.assignedClasses)) {
        staffData.assignedClasses = otherData.assignedClasses;
      }
      
      // Handle qualifications and certifications arrays
      if (Array.isArray(otherData.qualifications)) {
        staffData.qualifications = otherData.qualifications;
      }
      if (Array.isArray(otherData.certifications)) {
        staffData.certifications = otherData.certifications;
      }
      
      // Create staff profile
      const staff = await Staff.create(staffData);
      
      // Populate user data
      await staff.populate('user', 'firstName lastName email phone avatar');
      
      res.status(201).json({
        success: true,
        message: 'Staff member created successfully',
        data: staff
      });
    } catch (error) {
      next(error);
    }
  }
);

// Statistics (Admin only)
router.get(
  '/stats',
  authorize(ROLES.ADMIN),
  getStaffStats
);

// Get staff by user ID (Admin or own profile)
router.get(
  '/user/:userId',
  userIdValidation,
  validate,
  getStaffByUserId
);

// CRUD operations
router
  .route('/')
  .get(authorize(ROLES.ADMIN, ROLES.STAFF), getAllStaff)
  .post(
    authorize(ROLES.ADMIN),
    createStaffValidation,
    validate,
    createStaff
  );

router
  .route('/:id')
  .get(
    authorize(ROLES.ADMIN, ROLES.STAFF),
    staffIdValidation,
    validate,
    getStaffById
  )
  .put(
    authorize(ROLES.ADMIN),
    updateStaffValidation,
    validate,
    updateStaff
  )
  .delete(
    authorize(ROLES.ADMIN),
    staffIdValidation,
    validate,
    deleteStaff
  );

// Qualifications
router
  .route('/:id/qualifications')
  .post(
    authorize(ROLES.ADMIN),
    qualificationValidation,
    validate,
    addQualification
  );

router
  .route('/:id/qualifications/:qualificationId')
  .delete(
    authorize(ROLES.ADMIN),
    qualificationIdValidation,
    validate,
    removeQualification
  );

// Certifications
router
  .route('/:id/certifications')
  .post(
    authorize(ROLES.ADMIN),
    certificationValidation,
    validate,
    addCertification
  );

router
  .route('/:id/certifications/:certificationId')
  .delete(
    authorize(ROLES.ADMIN),
    certificationIdValidation,
    validate,
    removeCertification
  );

// Schedule
router
  .route('/:id/schedule')
  .put(
    authorize(ROLES.ADMIN),
    scheduleValidation,
    validate,
    updateSchedule
  );

// Performance ratings
router
  .route('/:id/performance')
  .post(
    authorize(ROLES.ADMIN),
    performanceRatingValidation,
    validate,
    addPerformanceRating
  );

// Termination and reactivation
router
  .route('/:id/terminate')
  .post(
    authorize(ROLES.ADMIN),
    terminationValidation,
    validate,
    terminateStaff
  );

router
  .route('/:id/reactivate')
  .post(
    authorize(ROLES.ADMIN),
    staffIdValidation,
    validate,
    reactivateStaff
  );

export default router;
