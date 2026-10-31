const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/apiResponse');

/**
 * Reusable JWT Authentication Middleware
 * Validates 'Authorization: Bearer <token>' header and attaches user payload to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token required. Format: Bearer <token>', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Authentication token missing', 401);
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired. Please login again.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token. Please authenticate.', 401);
    }
    return sendError(res, 'Authentication failed', 401);
  }
};

module.exports = {
  authenticate
};
