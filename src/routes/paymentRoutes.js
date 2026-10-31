const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { recordPaymentSchema } = require('../validators/paymentValidator');

router.use(authenticate);

/**
 * @route   POST /api/payments
 * @desc    Record a payment against an invoice
 * @access  Authenticated (CUSTOMER paying own invoice, or ADMIN/STAFF recording payment)
 */
router.post(
  '/',
  validate(recordPaymentSchema),
  paymentController.recordPayment
);

/**
 * @route   GET /api/payments
 * @desc    List all payments with filters and pagination
 * @access  Authenticated (ADMIN & STAFF see all, CUSTOMER sees own)
 */
router.get(
  '/',
  paymentController.listPayments
);

/**
 * @route   GET /api/payments/invoice/:invoiceId
 * @desc    Get all payments for a specific invoice
 * @access  Authenticated (ADMIN, STAFF, or Owner CUSTOMER)
 */
router.get(
  '/invoice/:invoiceId',
  paymentController.getPaymentsByInvoice
);

/**
 * @route   GET /api/payments/customer/:customerId
 * @desc    Get all payments for a specific customer
 * @access  Authenticated (ADMIN, STAFF, or matching CUSTOMER)
 */
router.get(
  '/customer/:customerId',
  paymentController.getPaymentsByCustomer
);

/**
 * @route   GET /api/payments/:id
 * @desc    Get single payment by ID
 * @access  Authenticated (ADMIN, STAFF, or Owner CUSTOMER)
 */
router.get(
  '/:id',
  paymentController.getPaymentById
);

module.exports = router;
