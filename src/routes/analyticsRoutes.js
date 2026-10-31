const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { ROLES } = require('../constants/roles');

// All analytics endpoints require ADMIN or STAFF authorization
const requireStaffOrAdmin = [authenticate, authorize(ROLES.ADMIN, ROLES.STAFF)];

// 1. Dashboard Overview
router.get('/dashboard', requireStaffOrAdmin, (req, res) => analyticsController.getDashboardSummary(req, res));

// 2. Revenue Analytics
router.get('/revenue', requireStaffOrAdmin, (req, res) => analyticsController.getRevenueAnalytics(req, res));
router.get('/revenue/monthly', requireStaffOrAdmin, (req, res) => analyticsController.getMonthlyRevenue(req, res));
router.get('/revenue/summary', requireStaffOrAdmin, (req, res) => analyticsController.getRevenueSummary(req, res));

// 3. Subscription Analytics
router.get('/subscriptions', requireStaffOrAdmin, (req, res) => analyticsController.getSubscriptionAnalytics(req, res));
router.get('/subscriptions/status', requireStaffOrAdmin, (req, res) => analyticsController.getSubscriptionStatus(req, res));
router.get('/subscriptions/trends', requireStaffOrAdmin, (req, res) => analyticsController.getSubscriptionTrends(req, res));

// 4. Invoices Analytics
router.get('/invoices', requireStaffOrAdmin, (req, res) => analyticsController.getInvoiceAnalytics(req, res));
router.get('/invoices/status', requireStaffOrAdmin, (req, res) => analyticsController.getInvoiceStatus(req, res));
router.get('/invoices/outstanding', requireStaffOrAdmin, (req, res) => analyticsController.getOutstandingInvoices(req, res));

// 5. Payment Analytics
router.get('/payments', requireStaffOrAdmin, (req, res) => analyticsController.getPaymentAnalytics(req, res));
router.get('/payments/methods', requireStaffOrAdmin, (req, res) => analyticsController.getPaymentMethods(req, res));

// 6. Customer Analytics
router.get('/customers', requireStaffOrAdmin, (req, res) => analyticsController.getCustomerAnalytics(req, res));
router.get('/customers/growth', requireStaffOrAdmin, (req, res) => analyticsController.getCustomerGrowth(req, res));
router.get('/customers/top', requireStaffOrAdmin, (req, res) => analyticsController.getTopCustomers(req, res));

// 7. Demo Data Seeder (Helper for Live Demonstrations)
router.post('/seed-demo', requireStaffOrAdmin, (req, res) => analyticsController.seedDemoData(req, res));

module.exports = router;
