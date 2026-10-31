const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  updateSubscriptionStatusSchema
} = require('../validators/subscriptionValidator');

// All subscription endpoints require authentication
router.use(authenticate);

/**
 * @route   POST /api/subscriptions
 * @desc    Create a new subscription
 * @access  Authenticated (ADMIN, STAFF, CUSTOMER)
 */
router.post(
  '/',
  validate(createSubscriptionSchema),
  subscriptionController.createSubscription
);

/**
 * @route   GET /api/subscriptions
 * @desc    List all subscriptions with search and filter
 * @access  Authenticated (ADMIN & STAFF see all, CUSTOMER sees own)
 */
router.get(
  '/',
  subscriptionController.listSubscriptions
);

/**
 * @route   GET /api/subscriptions/:id
 * @desc    Get subscription details
 * @access  Authenticated (Owner CUSTOMER, or ADMIN/STAFF)
 */
router.get(
  '/:id',
  subscriptionController.getSubscriptionById
);

/**
 * @route   PUT /api/subscriptions/:id
 * @desc    Update subscription plan, quantity, details
 * @access  ADMIN, STAFF
 */
router.put(
  '/:id',
  authorize('ADMIN', 'STAFF'),
  validate(updateSubscriptionSchema),
  subscriptionController.updateSubscription
);

/**
 * @route   PATCH /api/subscriptions/:id/status
 * @desc    Transition subscription status (DRAFT, QUOTATION, CONFIRMED, ACTIVE, PAUSED, CLOSED)
 * @access  Authenticated (ADMIN, STAFF, or Owner CUSTOMER for allowed actions)
 */
router.patch(
  '/:id/status',
  validate(updateSubscriptionStatusSchema),
  subscriptionController.updateSubscriptionStatus
);

/**
 * @route   POST /api/subscriptions/:id/activate
 * @desc    Activate subscription and generate initial invoice
 * @access  ADMIN, STAFF
 */
router.post(
  '/:id/activate',
  authorize('ADMIN', 'STAFF'),
  subscriptionController.activateSubscription
);

/**
 * @route   POST /api/subscriptions/:id/pause
 * @desc    Pause active subscription
 * @access  Authenticated (ADMIN, STAFF, or Owner CUSTOMER)
 */
router.post(
  '/:id/pause',
  subscriptionController.pauseSubscription
);

/**
 * @route   POST /api/subscriptions/:id/resume
 * @desc    Resume paused subscription
 * @access  Authenticated (ADMIN, STAFF, or Owner CUSTOMER)
 */
router.post(
  '/:id/resume',
  subscriptionController.resumeSubscription
);

/**
 * @route   POST /api/subscriptions/:id/close
 * @desc    Close subscription permanently
 * @access  Authenticated (ADMIN, STAFF, or Owner CUSTOMER)
 */
router.post(
  '/:id/close',
  subscriptionController.closeSubscription
);

/**
 * @route   POST /api/subscriptions/:id/renew
 * @desc    Renew subscription and generate renewal invoice
 * @access  Authenticated (ADMIN, STAFF, or Owner CUSTOMER)
 */
router.post(
  '/:id/renew',
  subscriptionController.renewSubscription
);

module.exports = router;
