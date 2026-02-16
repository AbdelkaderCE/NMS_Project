import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import crypto from 'crypto';

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    let { firstName, lastName, name, email, password, phone, role, address } = req.body;

    // Handle 'name' field if provided instead of firstName/lastName
    if (name && !firstName && !lastName) {
      const nameParts = name.trim().split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || nameParts[0];
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'User with this email already exists');
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone: phone || '+0000000000',
      role,
      address,
    });

    // Generate token and send response
    sendTokenResponse(user, 201, res, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      return sendError(res, 401, 'Your account has been deactivated. Please contact admin.');
    }

    // Validate password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token and send response
    await sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / Clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // 10 seconds
      httpOnly: true,
    });

    sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user already has staffInfo attached by protect middleware
    const userObj = req.user.toObject ? req.user.toObject() : { ...req.user };
    
    // If staffInfo exists, include it in the response
    if (req.user.staffInfo) {
      userObj.staffInfo = req.user.staffInfo.toObject ? req.user.staffInfo.toObject() : req.user.staffInfo;
    }

    sendSuccess(res, 200, 'User retrieved successfully', userObj);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (with optional role filter)
 * @route   GET /api/auth/users
 * @access  Private (Admin/Staff)
 */
export const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    
    const filter = {};
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter).select('-password');

    sendSuccess(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get contacts list for messaging (role-aware filtering)
 * @route   GET /api/auth/contacts
 * @access  Private (Any authenticated user)
 */
export const getContacts = async (req, res, next) => {
  try {
    const requesterRole = req.user?.role;
    let filter = {};

    // Role-aware filtering: parents can only see staff/admin; staff/admin can see all
    if (requesterRole === 'parent') {
      filter = { role: { $in: ['staff', 'admin'] } };
    } else if (requesterRole === 'staff' || requesterRole === 'admin') {
      // Allow staff/admin to see everyone
      filter = {};
    } else {
      // fallback: only return admins and staff
      filter = { role: { $in: ['staff', 'admin'] } };
    }

    const users = await User.find(filter).select('-password');
    sendSuccess(res, 200, 'Contacts retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user by ID (Admin only)
 * @route   PUT /api/auth/users/:id
 * @access  Private (Admin/Staff)
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      address: req.body.address,
      avatar: req.body.avatar,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, 200, 'User updated successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID (admin/staff or self)
 * @route   GET /api/auth/users/:id
 * @access  Private (Admin/Staff) or Self
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Allow self-access regardless of role
    const isSelf = req.user.id === id;

    if (!isSelf && !(req.user.role === 'admin' || req.user.role === 'staff')) {
      return sendError(res, 403, `User role '${req.user.role}' is not authorized to access this profile`);
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // If staff, include position
    if (user.role === 'staff') {
      try {
        const { default: Staff } = await import('../models/Staff.js');
        const staffRecord = await Staff.findOne({ user: user._id }).select('position employmentStatus schedule qualifications');
        if (staffRecord) {
          user._doc.staffInfo = staffRecord; // Attach for response
        }
      } catch (e) {
        console.error('Error populating staff info:', e.message);
      }
    }

    sendSuccess(res, 200, 'User profile retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      address: req.body.address,
      avatar: req.body.avatar,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    sendSuccess(res, 200, 'Profile updated successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/password
 * @access  Private
 */
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    await sendTokenResponse(user, 200, res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set another user's password (admin or staff manager)
 * @route   PUT /api/auth/users/:id/password
 * @access  Private (Admin, Staff Manager)
 */
export const setUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return sendError(res, 400, 'New password must be at least 6 characters');
    }

    const user = await User.findById(id).select('+password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    user.password = newPassword;
    await user.save();

    // Do not return token; just confirmation
    sendSuccess(res, 200, 'User password updated successfully', { userId: user._id });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return sendError(res, 404, 'No user found with this email');
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    
    // In production, send email with resetUrl
    // For now, return the token in response (ONLY FOR DEVELOPMENT)
    const message = `Password reset token: ${resetToken}\nReset URL: ${resetUrl}`;

    sendSuccess(res, 200, 'Password reset token generated', {
      resetToken, // Remove this in production
      message: 'Password reset email sent',
    });
  } catch (error) {
    // Clear reset token fields if error
    if (req.body.email) {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
      }
    }
    
    next(error);
  }
};

/**
 * @desc    Reset password
 * @route   PUT /api/auth/reset-password/:resetToken
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 400, 'Invalid or expired token');
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to get token from model, create cookie and send response
 */
const sendTokenResponse = async (user, statusCode, res, message) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
  };

  // Remove password from output
  user.password = undefined;

  // If user is staff, fetch their position
  let userObj = user.toObject();
  if (user.role === 'staff') {
    try {
      const { default: Staff } = await import('../models/Staff.js');
      const staffRecord = await Staff.findOne({ user: user._id }).select('position');
      if (staffRecord) {
        userObj.position = staffRecord.position;
      }
    } catch (error) {
      console.error('Error fetching staff position:', error);
    }
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      data: {
        token,
        user: userObj,
      },
    });
};

/**
 * @desc    Reset parent password by admin/staff
 * @route   PUT /api/auth/reset-parent-password/:userId
 * @access  Private (Admin, Staff)
 */
export const resetParentPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return sendError(res, 404, 'Parent not found');
    }

    if (user.role !== 'parent') {
      return sendError(res, 400, 'User is not a parent');
    }

    // Generate new temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    user.password = tempPassword; // Will be hashed by pre-save middleware
    await user.save();

    sendSuccess(res, 200, 'Parent password reset successfully', { 
      parentName: `${user.firstName} ${user.lastName}`,
      parentEmail: user.email,
      tempPassword 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete parent account (only if no linked children)
 * @route   DELETE /api/auth/parents/:userId
 * @access  Private (Admin, Staff)
 */
export const deleteParent = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return sendError(res, 404, 'Parent not found');
    }

    if (user.role !== 'parent') {
      return sendError(res, 400, 'User is not a parent');
    }

    // Check if parent is linked to any children
    const linkedChildrenCount = await (await import('../models/Child.js')).default.countDocuments({ 'parents.parent': user._id });
    if (linkedChildrenCount > 0) {
      return sendError(res, 400, 'Cannot delete parent with linked children');
    }

    await user.deleteOne();
    sendSuccess(res, 200, 'Parent deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete any user with cascade cleanup
 * @route   DELETE /api/auth/users/:id
 * @access  Private (Admin, Staff)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Parent cascade: remove parent reference from children; ensure each child retains at least one parent
    if (user.role === 'parent') {
      const { default: Child } = await import('../models/Child.js');
      const children = await Child.find({ 'parents.parent': user._id });
      for (const child of children) {
        child.parents = child.parents.filter(p => p.parent.toString() !== user._id.toString());
        if (child.parents.length === 0) {
          // Abort: would orphan child
          return sendError(res, 400, `Cannot delete parent; child ${child.firstName} ${child.lastName} would be left without any parent.`);
        }
        await child.save();
      }
    }

    // Staff updates: remove from groups instructors arrays and mark staff profile inactive
    if (user.role === 'staff') {
      const { default: Group } = await import('../models/Group.js');
      const { default: Staff } = await import('../models/Staff.js');
      await Group.updateMany({ instructors: user._id }, { $pull: { instructors: user._id } });
      await Staff.updateOne({ user: user._id }, { $set: { employmentStatus: 'inactive' } });
    }

    // Soft delete: deactivate user instead of removing record
    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    // Audit log
    await req.audit?.log({
      action: 'DEACTIVATE',
      resourceType: 'User',
      resourceId: user._id,
      resourceName: `${user.firstName} ${user.lastName}`,
      description: `Deactivated user account for ${user.firstName} ${user.lastName} (${user.role})`,
    });

    sendSuccess(res, 200, 'User deactivated successfully', { userId: user._id, isActive: user.isActive });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reactivate a user
 * @route   PUT /api/auth/users/:id/activate
 * @access  Private (Admin, Staff)
 */
export const activateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    // If staff, set employmentStatus active
    if (user.role === 'staff') {
      const { default: Staff } = await import('../models/Staff.js');
      await Staff.updateOne({ user: user._id }, { $set: { employmentStatus: 'active' } });
    }

    // Audit log
    await req.audit?.log({
      action: 'ACTIVATE',
      resourceType: 'User',
      resourceId: user._id,
      resourceName: `${user.firstName} ${user.lastName}`,
      description: `Activated user account for ${user.firstName} ${user.lastName} (${user.role})`,
    });

    sendSuccess(res, 200, 'User activated successfully', { userId: user._id, isActive: user.isActive });
  } catch (error) {
    next(error);
  }
};
