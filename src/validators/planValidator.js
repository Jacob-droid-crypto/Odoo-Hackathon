const { z } = require('zod');
const { BILLING_INTERVALS } = require('../constants/roles');

const billingIntervalEnum = z.enum([
  BILLING_INTERVALS.DAILY,
  BILLING_INTERVALS.WEEKLY,
  BILLING_INTERVALS.MONTHLY,
  BILLING_INTERVALS.YEARLY
]);

const createPlanSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().trim().min(1, 'Plan name is required'),
  code: z.string().trim().min(1, 'Unique plan code is required (e.g. BS-MONTHLY)'),
  description: z.string().trim().optional(),
  price: z.coerce.number().min(0, 'Price must be >= 0'),
  billingInterval: billingIntervalEnum.default(BILLING_INTERVALS.MONTHLY),
  intervalCount: z.coerce.number().int().min(1, 'Interval count must be at least 1').default(1),
  minQuantity: z.coerce.number().int().min(1, 'Minimum quantity must be at least 1').default(1),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  autoClose: z.boolean().optional().default(false),
  allowEarlyClose: z.boolean().optional().default(true),
  allowPause: z.boolean().optional().default(true),
  allowRenew: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true)
});

const updatePlanSchema = z.object({
  productId: z.string().optional(),
  name: z.string().trim().min(1).optional(),
  code: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  price: z.coerce.number().min(0).optional(),
  billingInterval: billingIntervalEnum.optional(),
  intervalCount: z.coerce.number().int().min(1).optional(),
  minQuantity: z.coerce.number().int().min(1).optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  autoClose: z.boolean().optional(),
  allowEarlyClose: z.boolean().optional(),
  allowPause: z.boolean().optional(),
  allowRenew: z.boolean().optional(),
  isActive: z.boolean().optional()
});

module.exports = {
  createPlanSchema,
  updatePlanSchema
};
