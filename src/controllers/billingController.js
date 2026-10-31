const billingEngineService = require('../services/billingEngineService');
const taxDiscountService = require('../services/taxDiscountService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Run recurring billing engine cycle
 * POST /api/billing/run
 */
const runBillingEngine = async (req, res, next) => {
  try {
    const report = await billingEngineService.runBillingCycle(req.body);
    return sendSuccess(res, 'Billing engine run completed', report, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * List subscriptions due for billing
 * GET /api/billing/due-subscriptions
 */
const getDueSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await billingEngineService.getDueSubscriptions();
    return sendSuccess(res, 'Due subscriptions retrieved successfully', subscriptions, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * List configured tax rates
 * GET /api/billing/tax-rates
 */
const getTaxRates = async (req, res, next) => {
  try {
    const rates = await taxDiscountService.getAllTaxRules(req.query);
    return sendSuccess(res, 'Tax rates retrieved successfully', rates, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * Create a new tax rate
 * POST /api/billing/tax-rates
 */
const createTaxRate = async (req, res, next) => {
  try {
    const rule = await taxDiscountService.createTaxRule(req.body);
    return sendSuccess(res, 'Tax rate created successfully', rule, 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * List discount rules
 * GET /api/billing/discounts
 */
const getDiscountRules = async (req, res, next) => {
  try {
    const discounts = await taxDiscountService.getAllDiscountRules(req.query);
    return sendSuccess(res, 'Discount rules retrieved successfully', discounts, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * Create a new discount rule
 * POST /api/billing/discounts
 */
const createDiscountRule = async (req, res, next) => {
  try {
    const rule = await taxDiscountService.createDiscountRule(req.body);
    return sendSuccess(res, 'Discount rule created successfully', rule, 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * Calculate pricing preview (Subtotal, Discount, Tax, Final Amount)
 * POST /api/billing/calculate
 */
const calculatePricingPreview = async (req, res, next) => {
  try {
    const calculation = await taxDiscountService.calculatePreview(req.body);
    return sendSuccess(res, 'Billing calculation completed successfully', calculation, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * Billing & Subscription Analytics for Member 4 & Executive Dashboard
 * GET /api/billing/analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    const metrics = await billingEngineService.getBillingAnalytics();
    return sendSuccess(res, 'Billing analytics retrieved successfully', metrics, 200);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  runBillingEngine,
  getDueSubscriptions,
  getTaxRates,
  createTaxRate,
  getDiscountRules,
  createDiscountRule,
  calculatePricingPreview,
  getAnalytics
};
