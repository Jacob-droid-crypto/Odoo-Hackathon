const { z } = require('zod');
const { DISCOUNT_TYPES } = require('../constants/roles');

const generateInvoiceSchema = z.object({
  subscriptionId: z.string().trim().min(1, 'Subscription ID is required'),
  billingPeriodStart: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  billingPeriodEnd: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  issuedDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  discountCode: z.string().trim().optional(),
  discountType: z.enum([DISCOUNT_TYPES.PERCENTAGE, DISCOUNT_TYPES.FIXED]).optional(),
  discountValue: z.coerce.number().min(0, 'Discount value cannot be negative').optional(),
  taxRatePercentage: z.coerce.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100%').optional(),
  description: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

module.exports = {
  generateInvoiceSchema
};
