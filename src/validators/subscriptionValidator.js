const { z } = require('zod');
const { SUBSCRIPTION_STATUSES } = require('../constants/roles');

const subscriptionStatusEnum = z.enum([
  SUBSCRIPTION_STATUSES.DRAFT,
  SUBSCRIPTION_STATUSES.QUOTATION,
  SUBSCRIPTION_STATUSES.CONFIRMED,
  SUBSCRIPTION_STATUSES.ACTIVE,
  SUBSCRIPTION_STATUSES.PAUSED,
  SUBSCRIPTION_STATUSES.CLOSED
]);

const createSubscriptionSchema = z.object({
  customerId: z.string().trim().min(1, 'Customer ID is required'),
  planId: z.string().trim().min(1, 'Plan ID is required'),
  productId: z.string().trim().optional(),
  variantId: z.string().trim().optional(),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
  startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  paymentTerms: z.string().trim().optional().default('Net 30'),
  autoRenew: z.boolean().optional().default(true),
  notes: z.string().trim().optional(),
  status: subscriptionStatusEnum.optional().default(SUBSCRIPTION_STATUSES.DRAFT),
  discountCode: z.string().trim().optional()
});

const updateSubscriptionSchema = z.object({
  planId: z.string().trim().optional(),
  quantity: z.coerce.number().int().min(1).optional(),
  paymentTerms: z.string().trim().optional(),
  autoRenew: z.boolean().optional(),
  notes: z.string().trim().optional()
});

const updateSubscriptionStatusSchema = z.object({
  status: subscriptionStatusEnum,
  reason: z.string().trim().optional()
});

module.exports = {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  updateSubscriptionStatusSchema
};
