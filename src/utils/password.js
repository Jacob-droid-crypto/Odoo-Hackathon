const bcrypt = require('bcryptjs');
const env = require('../config/env');

/**
 * Validate password according to Brightloop business requirements:
 * - More than 8 characters (min length 9)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one special character
 */
const validatePasswordComplexity = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: 'Password is required'
    };
  }

  if (password.length <= 8) {
    return {
      isValid: false,
      message: 'Password must be more than 8 characters long'
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  if (!hasUpperCase) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  const hasLowerCase = /[a-z]/.test(password);
  if (!hasLowerCase) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  if (!hasSpecialChar) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character'
    };
  }

  return { isValid: true };
};

/**
 * Hash password with bcrypt
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
};

/**
 * Compare plain text password with hashed password
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  validatePasswordComplexity,
  hashPassword,
  comparePassword
};
