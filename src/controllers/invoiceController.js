const invoiceService = require('../services/invoiceService');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

/**
 * Generate invoice for a subscription
 * POST /api/invoices/generate
 */
const generateInvoice = async (req, res, next) => {
  try {
    const { subscriptionId, ...options } = req.body;
    const invoice = await invoiceService.generateInvoiceForSubscription(subscriptionId, options);
    return sendSuccess(res, 'Invoice generated successfully', invoice, 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * List all invoices with filters, search, and pagination
 * GET /api/invoices
 */
const listInvoices = async (req, res, next) => {
  try {
    const result = await invoiceService.getInvoices(req.query, req.user);
    return sendPaginated(res, 'Invoices retrieved successfully', result.items, result.pagination);
  } catch (error) {
    return next(error);
  }
};

/**
 * Get invoice by ID
 * GET /api/invoices/:id
 */
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id, req.user);
    return sendSuccess(res, 'Invoice retrieved successfully', invoice, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * Get invoices for a specific subscription
 * GET /api/invoices/subscription/:subscriptionId
 */
const getInvoicesBySubscription = async (req, res, next) => {
  try {
    const invoices = await invoiceService.getInvoicesBySubscriptionId(req.params.subscriptionId);
    return sendSuccess(res, 'Subscription invoices retrieved successfully', invoices, 200);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  generateInvoice,
  listInvoices,
  getInvoiceById,
  getInvoicesBySubscription
};
