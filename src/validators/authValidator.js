const { z } = require('zod');

// Password complexity regex: > 8 chars, >= 1 uppercase, >= 1 lowercase, >= 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{9,}$/;

const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z
    .string()
    .min(9, 'Password must be more than 8 characters long')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, and one special character'
    ),
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  companyName: z.string().trim().optional(),
  phone: z.string().trim().optional()
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

const createStaffSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z
    .string()
    .min(9, 'Password must be more than 8 characters long')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, and one special character'
    ),
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  phone: z.string().trim().optional()
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address format')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(9, 'Password must be more than 8 characters long')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, and one special character'
    )
});

module.exports = {
  registerSchema,
  loginSchema,
  createStaffSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
