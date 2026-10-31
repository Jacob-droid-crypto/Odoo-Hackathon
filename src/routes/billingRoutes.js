const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const {
  taxRateSchema,
  discountRuleSchema,
  calculatePreviewSchema
} = require('../validators/billingValidator');

/**
 * @route   POST /api/billing/calculate
 * @desc    Calculate pricing breakdown (Subtotal, Discount, Tax, Final Amount)
 * @access  Public / Authenticated (Frontend preview tool)
 */
router.post(
  '/calculate',
  validate(calculatePreviewSchema),
  billingController.calculatePricingPreview
);

// All subsequent billing engine endpoints require authentication
router.use(authenticate);

/**
 * @route   POST /api/billing/run
 * @desc    Trigger automated billing cycle for due subscriptions
 * @access  ADMIN, STAFF
 */
router.post(
  '/run',
  authorize('ADMIN', 'STAFF'),
  billingController.runBillingEngine
);

/**
 * @route   GET /api/billing/due-subscriptions
 * @desc    List subscriptions currently due for recurring billing
 * @access  ADMIN, STAFF
 */
router.get(
  '/due-subscriptions',
  authorize('ADMIN', 'STAFF'),
  billingController.getDueSubscriptions
);

/**
 * @route   GET /api/billing/tax-rates
 * @desc    Get configured tax rates
 * @access  Authenticated
 */
router.get(
  '/tax-rates',
  billingController.getTaxRates
);

/**
 * @route   POST /api/billing/tax-rates
 * @desc    Create/configure a new tax rate
 * @access  ADMIN only
 */
router.post(
  '/tax-rates',
  authorize('ADMIN'),
  validate(taxRateSchema),
  billingController.createTaxRate
);

/**
 * @route   GET /api/billing/discounts
 * @desc    Get configured discount rules
 * @access  Authenticated
 */
router.get(
  '/discounts',
  billingController.getDiscountRules
);

/**
 * @route   POST /api/billing/discounts
 * @desc    Create a new discount rule
 * @access  ADMIN only
 */
router.post(
  '/discounts',
  authorize('ADMIN'),
  validate(discountRuleSchema),
  billingController.createDiscountRule
);

/**
 * @route   GET /api/billing/analytics
 * @desc    Comprehensive financial and subscription metrics for Member 4 & Dashboard
 * @access  ADMIN, STAFF
 */
router.get(
  '/analytics',
  authorize('ADMIN', 'STAFF'),
  billingController.getAnalytics
);

module.exports = router;
