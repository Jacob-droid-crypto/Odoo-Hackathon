const subscriptionService = require('../services/subscriptionService');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const { SUBSCRIPTION_STATUSES } = require('../constants/roles');

/**
 * Create a new subscription
 * POST /api/subscriptions
 */
const createSubscription = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      // If customer is creating, auto-assign their own ID unless admin/staff specifies otherwise
      customerId: (req.user && req.user.role === 'CUSTOMER') ? req.user.id : (req.body.customerId || (req.user ? req.user.id : null))
    };

    const subscription = await subscriptionService.createSubscription(data, req.user);
    return sendSuccess(res, 'Subscription created successfully', subscription, 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * List all subscriptions with filters, search, and pagination
 * GET /api/subscriptions
 */
const listSubscriptions = async (req, res, next) => {
  try {
    const result = await subscriptionService.getSubscriptions(req.query, req.user);
    return sendPaginated(res, 'Subscriptions retrieved successfully', result.items, result.pagination);
  } catch (error) {
    return next(error);
  }
};

/**
 * Get subscription by ID
 * GET /api/subscriptions/:id
 */
const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(req.params.id, req.user);
    return sendSuccess(res, 'Subscription retrieved successfully', subscription, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * Update subscription details (plan, quantity, payment terms, notes)
 * PUT /api/subscriptions/:id
 */
const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.updateSubscription(req.params.id, req.body, req.user);
    return sendSuccess(res, 'Subscription updated successfully', subscription, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * Update subscription lifecycle status
 * PATCH /api/subscriptions/:id/status
 */
const updateSubscriptionStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const subscription = await subscriptionService.updateSubscriptionStatus(req.params.id, status, reason, req.user);
    return sendSuccess(res, `Subscription status updated to '${subscription.status}' successfully`, subscription, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * Action: Activate subscription
 * POST /api/subscriptions/:id/activate
 */
const activateSubscription = async (req, res, next) => {
  try {
    const reason = (req.body && req.body.reason) ? req.body.reason : 'Activated via API action';
    const subscription = await subscriptionService.updateSubscriptionStatus(
      req.params.id,
      SUBSCRIPTION_STATUSES.ACTIVE,
      reason,
      req.user
    );
    return sendSuccess(res, 'Subscription activated successfully. Automatic invoice generated if due.', subscription, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * Action: Pause subscription
 * POST /api/subscriptions/:id/pause
 */
const pauseSubscription = async (req, res, next) => {
  try {
    const reason = (req.body && req.body.reason) ? req.body.reason : 'Paused by user/admin';
    const subscription = await subscriptionService.updateSubscriptionStatus(
      req.params.id,
      SUBSCRIPTION_STATUSES.PAUSED,
      reason,
      req.user
    );
    return sendSuccess(res, 'Subscription paused successfully', subscription, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * Action: Resume paused subscription
 * POST /api/subscriptions/:id/resume
 */
const resumeSubscription = async (req, res, next) => {
  try {
    const reason = (req.body && req.body.reason) ? req.body.reason : 'Resumed from pause';
    const subscription = await subscriptionService.updateSubscriptionStatus(
      req.params.id,
      SUBSCRIPTION_STATUSES.ACTIVE,
      reason,
      req.user
    );
    return sendSuccess(res, 'Subscription resumed successfully', subscription, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * Action: Close subscription
 * POST /api/subscriptions/:id/close
 */
const closeSubscription = async (req, res, next) => {
  try {
    const reason = (req.body && req.body.reason) ? req.body.reason : 'Closed subscription';
    const subscription = await subscriptionService.updateSubscriptionStatus(
      req.params.id,
      SUBSCRIPTION_STATUSES.CLOSED,
      reason,
      req.user
    );
    return sendSuccess(res, 'Subscription closed successfully', subscription, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * Action: Renew subscription
 * POST /api/subscriptions/:id/renew
 */
const renewSubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.renewSubscription(req.params.id, req.user);
    return sendSuccess(res, 'Subscription renewed successfully. Renewal invoice generated.', subscription, 200);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createSubscription,
  listSubscriptions,
  getSubscriptionById,
  updateSubscription,
  updateSubscriptionStatus,
  activateSubscription,
  pauseSubscription,
  resumeSubscription,
  closeSubscription,
  renewSubscription
};
