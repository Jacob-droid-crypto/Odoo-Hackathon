const { z } = require('zod');
const { DISCOUNT_TYPES } = require('../constants/roles');

const taxRateSchema = z.object({
  name: z.string().trim().min(1, 'Tax rule name is required'),
  ratePercentage: z.coerce.number().min(0, 'Tax rate percentage must be >= 0').max(100, 'Tax rate percentage cannot exceed 100%'),
  description: z.string().trim().optional(),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true)
});

const discountRuleSchema = z.object({
  code: z.string().trim().min(1, 'Discount code is required'),
  description: z.string().trim().optional(),
  type: z.enum([DISCOUNT_TYPES.PERCENTAGE, DISCOUNT_TYPES.FIXED]).default(DISCOUNT_TYPES.PERCENTAGE),
  value: z.coerce.number().min(0, 'Discount value must be >= 0'),
  minPurchase: z.coerce.number().min(0).optional().nullable(),
  minQuantity: z.coerce.number().int().min(1).optional().nullable(),
  startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  maxUses: z.coerce.number().int().min(1).optional().nullable(),
  targetType: z.enum(['PRODUCT', 'SUBSCRIPTION', 'INVOICE']).optional().default('SUBSCRIPTION'),
  targetProductId: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional().default(true)
});

const calculatePreviewSchema = z.object({
  unitPrice: z.coerce.number().min(0, 'Unit price must be >= 0'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
  discountCode: z.string().trim().optional(),
  discountType: z.enum([DISCOUNT_TYPES.PERCENTAGE, DISCOUNT_TYPES.FIXED]).optional(),
  discountValue: z.coerce.number().min(0).optional(),
  taxRuleId: z.string().trim().optional(),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  productId: z.string().trim().optional()
});

module.exports = {
  taxRateSchema,
  discountRuleSchema,
  calculatePreviewSchema
};
