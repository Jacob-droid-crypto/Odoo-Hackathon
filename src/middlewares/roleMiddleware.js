const { sendError } = require('../utils/apiResponse');

/**
 * Reusable Role-Based Authorization Middleware
 * Usage:
 *   router.get('/admin-only', authenticate, authorize('ADMIN'), handler);
 *   router.get('/staff-or-admin', authenticate, authorize('ADMIN', 'STAFF'), handler);
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required before authorization check', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required role(s): ${allowedRoles.join(', ')}`,
        403
      );
    }

    return next();
  };
};

module.exports = {
  authorize
};
