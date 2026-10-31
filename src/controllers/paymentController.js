const paymentService = require('../services/paymentService');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

/**
 * Record a payment against an invoice
 * POST /api/payments
 */
const recordPayment = async (req, res, next) => {
  try {
    const result = await paymentService.recordPayment(req.body, req.user);
    return sendSuccess(res, 'Payment recorded successfully', result, 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * List all payments with filtering and pagination
 * GET /api/payments
 */
const listPayments = async (req, res, next) => {
  try {
    const result = await paymentService.getPayments(req.query, req.user);
    return sendPaginated(res, 'Payments retrieved successfully', result.items, result.pagination);
  } catch (error) {
    return next(error);
  }
};

/**
 * Get single payment by ID
 * GET /api/payments/:id
 */
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id, req.user);
    return sendSuccess(res, 'Payment retrieved successfully', payment, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * Get payments for a specific invoice
 * GET /api/payments/invoice/:invoiceId
 */
const getPaymentsByInvoice = async (req, res, next) => {
  try {
    const payments = await paymentService.getPaymentsByInvoiceId(req.params.invoiceId);
    return sendSuccess(res, 'Invoice payments retrieved successfully', payments, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * Get payments for a customer
 * GET /api/payments/customer/:customerId
 */
const getPaymentsByCustomer = async (req, res, next) => {
  try {
    const payments = await paymentService.getPaymentsByCustomerId(req.params.customerId);
    return sendSuccess(res, 'Customer payments retrieved successfully', payments, 200);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  recordPayment,
  listPayments,
  getPaymentById,
  getPaymentsByInvoice,
  getPaymentsByCustomer
};
