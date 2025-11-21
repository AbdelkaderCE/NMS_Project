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
    sendTokenResponse(user, 200, res, 'Login successful');
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
    const user = await User.findById(req.user.id);

    sendSuccess(res, 200, 'User retrieved successfully', user);
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

    sendTokenResponse(user, 200, res, 'Password updated successfully');
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

    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to get token from model, create cookie and send response
 */
const sendTokenResponse = (user, statusCode, res, message) => {
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

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      data: {
        token,
        user,
      },
    });
};
