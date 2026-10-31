const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate a signed JWT token
 */
const generateToken = (payload, expiresIn = env.JWT_EXPIRES_IN) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};
