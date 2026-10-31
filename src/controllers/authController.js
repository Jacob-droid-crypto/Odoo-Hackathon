const crypto = require('crypto');
const userService = require('../services/userService');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Register a new customer
 * POST /api/auth/register
 */
const registerCustomer = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, companyName, phone } = req.body;

    const passwordHash = await hashPassword(password);
    const user = await userService.createCustomer({
      email,
      passwordHash,
      firstName,
      lastName,
      companyName,
      phone
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });

    return sendSuccess(
      res,
      'Customer account registered successfully',
      { token, user },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login customer, staff, or admin
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userService.findByEmail(email);
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account is deactivated. Please contact support.', 403);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });

    const userProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyName: user.companyName,
      phone: user.phone
    };

    return sendSuccess(
      res,
      'Login successful',
      { token, user: userProfile },
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user's profile
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userService.findById(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, 'Profile retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset link/token
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userService.findByEmail(email);

    if (!user) {
      // Return success even if email not found for security enumeration prevention
      return sendSuccess(
        res,
        'If that email address is registered, a password reset link has been dispatched.'
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour validity

    await userService.saveResetToken(email, resetToken, expires);

    return sendSuccess(
      res,
      'If that email address is registered, a password reset link has been dispatched.',
      {
        resetToken,
        resetUrl: `/reset-password?token=${resetToken}`,
        expiresAt: expires
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with valid token
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const newPasswordHash = await hashPassword(newPassword);

    await userService.resetPasswordWithToken(token, newPasswordHash);

    return sendSuccess(res, 'Password has been reset successfully. You may now login with your new credentials.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCustomer,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword
};
