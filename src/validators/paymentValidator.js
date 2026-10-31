const { z } = require('zod');
const { PAYMENT_METHODS } = require('../constants/roles');

const paymentMethodEnum = z.enum([
  PAYMENT_METHODS.CREDIT_CARD,
  PAYMENT_METHODS.CARD,
  PAYMENT_METHODS.UPI,
  PAYMENT_METHODS.BANK_TRANSFER,
  PAYMENT_METHODS.STRIPE,
  PAYMENT_METHODS.CASH,
  PAYMENT_METHODS.OTHER,
  'Credit Card',
  'Card',
  'UPI',
  'Bank Transfer',
  'Cash',
  'Other'
]);

const recordPaymentSchema = z.object({
  invoiceId: z.string().trim().min(1, 'Invoice ID is required'),
  amount: z.coerce.number().positive('Payment amount must be greater than zero'),
  paymentMethod: paymentMethodEnum.optional().default(PAYMENT_METHODS.CREDIT_CARD),
  referenceNote: z.string().trim().optional(),
  paymentDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional()
});

module.exports = {
  recordPaymentSchema
};
