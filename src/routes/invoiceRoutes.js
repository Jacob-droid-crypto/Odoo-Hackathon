const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { generateInvoiceSchema } = require('../validators/invoiceValidator');

router.use(authenticate);

/**
 * @route   POST /api/invoices/generate
 * @desc    Generate invoice for a subscription
 * @access  ADMIN, STAFF
 */
router.post(
  '/generate',
  authorize('ADMIN', 'STAFF'),
  validate(generateInvoiceSchema),
  invoiceController.generateInvoice
);

/**
 * @route   GET /api/invoices
 * @desc    List all invoices with filters and search
 * @access  Authenticated (ADMIN & STAFF see all, CUSTOMER sees own)
 */
router.get(
  '/',
  invoiceController.listInvoices
);

/**
 * @route   GET /api/invoices/subscription/:subscriptionId
 * @desc    Get all invoices for a subscription
 * @access  Authenticated (ADMIN, STAFF, or Owner CUSTOMER)
 */
router.get(
  '/subscription/:subscriptionId',
  invoiceController.getInvoicesBySubscription
);

/**
 * @route   GET /api/invoices/:id
 * @desc    Get single invoice details with items and payments
 * @access  Authenticated (Owner CUSTOMER, or ADMIN/STAFF)
 */
router.get(
  '/:id',
  invoiceController.getInvoiceById
);

module.exports = router;
