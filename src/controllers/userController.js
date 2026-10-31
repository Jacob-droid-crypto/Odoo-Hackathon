const userService = require('../services/userService');
const { hashPassword } = require('../utils/password');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const { ROLES } = require('../constants/roles');

/**
 * Create a staff account (ADMIN ONLY)
 * POST /api/users/staff
 */
const createStaff = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const passwordHash = await hashPassword(password);
    const staff = await userService.createStaff({
      email,
      passwordHash,
      firstName,
      lastName,
      phone
    });

    return sendSuccess(
      res,
      'Staff member account created successfully',
      { staff },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * List all users with filtering and pagination (ADMIN & STAFF)
 * GET /api/users
 */
const listUsers = async (req, res, next) => {
  try {
    const { role, search, page, limit } = req.query;
    const result = await userService.listUsers({ role, search, page, limit });

    return sendPaginated(
      res,
      'Users retrieved successfully',
      result.users,
      {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // CUSTOMER can only view their own user account
    if (req.user.role === ROLES.CUSTOMER && req.user.id !== id) {
      return sendError(res, 'Access denied. You can only view your own user profile.', 403);
    }

    const user = await userService.findById(id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, 'User retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStaff,
  listUsers,
  getUserById
};
