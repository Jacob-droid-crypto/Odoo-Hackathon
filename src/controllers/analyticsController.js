const analyticsService = require('../services/analyticsService');
const inMemoryStore = require('../services/inMemoryStore');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Controller for Admin Analytics Dashboard & Visualizations
 */
class AnalyticsController {
  /**
   * Main Admin Dashboard Statistics & Overview
   * GET /api/analytics/dashboard
   */
  async getDashboardSummary(req, res) {
    try {
      const data = await analyticsService.getDashboardSummary();
      return sendSuccess(res, 'Dashboard analytics retrieved successfully', data);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Dedicated Revenue Analytics
   * GET /api/analytics/revenue
   */
  async getRevenueAnalytics(req, res) {
    try {
      const data = await analyticsService.getRevenueAnalytics(req.query);
      return sendSuccess(res, 'Revenue analytics retrieved successfully', data);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Monthly Revenue Breakdown
   * GET /api/analytics/revenue/monthly
   */
  async getMonthlyRevenue(req, res) {
    try {
      const data = await analyticsService.getRevenueAnalytics(req.query);
      return sendSuccess(res, 'Monthly revenue retrieved successfully', data.monthlyRevenue);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Revenue Summary (Total, count, average)
   * GET /api/analytics/revenue/summary
   */
  async getRevenueSummary(req, res) {
    try {
      const data = await analyticsService.getRevenueAnalytics(req.query);
      return sendSuccess(res, 'Revenue summary retrieved successfully', data.summary);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Dedicated Subscription Analytics
   * GET /api/analytics/subscriptions
   */
  async getSubscriptionAnalytics(req, res) {
    try {
      const data = await analyticsService.getSubscriptionAnalytics();
      return sendSuccess(res, 'Subscription analytics retrieved successfully', data);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Subscription Distribution by Status
   * GET /api/analytics/subscriptions/status
   */
  async getSubscriptionStatus(req, res) {
    try {
      const data = await analyticsService.getSubscriptionAnalytics();
      return sendSuccess(res, 'Subscription status distribution retrieved', data.distribution);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Subscription Creation Trends
   * GET /api/analytics/subscriptions/trends
   */
  async getSubscriptionTrends(req, res) {
    try {
      const data = await analyticsService.getSubscriptionAnalytics();
      return sendSuccess(res, 'Subscription trends retrieved', data.trends);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Invoices Statistics Overview
   * GET /api/analytics/invoices
   */
  async getInvoiceAnalytics(req, res) {
    try {
      const data = await analyticsService.getInvoiceAnalytics();
      return sendSuccess(res, 'Invoice analytics retrieved successfully', data);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Invoice Distribution by Status
   * GET /api/analytics/invoices/status
   */
  async getInvoiceStatus(req, res) {
    try {
      const data = await analyticsService.getInvoiceAnalytics();
      return sendSuccess(res, 'Invoice status distribution retrieved', data.statusDistribution);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Outstanding Balance & Overdue Invoices
   * GET /api/analytics/invoices/outstanding
   */
  async getOutstandingInvoices(req, res) {
    try {
      const data = await analyticsService.getInvoiceAnalytics();
      return sendSuccess(res, 'Outstanding invoices retrieved successfully', data.outstandingInvoices);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Payments Overview
   * GET /api/analytics/payments
   */
  async getPaymentAnalytics(req, res) {
    try {
      const data = await analyticsService.getPaymentAnalytics();
      return sendSuccess(res, 'Payment analytics retrieved successfully', data);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Payments Distribution by Method
   * GET /api/analytics/payments/methods
   */
  async getPaymentMethods(req, res) {
    try {
      const data = await analyticsService.getPaymentAnalytics();
      return sendSuccess(res, 'Payment methods distribution retrieved', data.paymentMethods);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Customer Overview
   * GET /api/analytics/customers
   */
  async getCustomerAnalytics(req, res) {
    try {
      const data = await analyticsService.getCustomerAnalytics();
      return sendSuccess(res, 'Customer analytics retrieved successfully', data);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Customer Growth Trends
   * GET /api/analytics/customers/growth
   */
  async getCustomerGrowth(req, res) {
    try {
      const data = await analyticsService.getCustomerAnalytics();
      return sendSuccess(res, 'Customer growth trends retrieved', data.customerGrowth);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Top Customers by Payments Received
   * GET /api/analytics/customers/top
   */
  async getTopCustomers(req, res) {
    try {
      const data = await analyticsService.getCustomerAnalytics();
      return sendSuccess(res, 'Top customers retrieved successfully', data.topCustomers);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Optional Helper to Seed Realistic Demo Data for Live Presentation
   * POST /api/analytics/seed-demo
   */
  async seedDemoData(req, res) {
    try {
      const result = inMemoryStore.seedAnalyticsDemoData();
      return sendSuccess(res, 'Demo data populated successfully', result);
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }
}

const analyticsController = new AnalyticsController();
module.exports = analyticsController;
