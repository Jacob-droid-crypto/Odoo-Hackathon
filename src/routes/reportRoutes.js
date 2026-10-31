const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { ROLES } = require('../constants/roles');

// Reports are accessible by ADMIN and STAFF
const requireStaffOrAdmin = [authenticate, authorize(ROLES.ADMIN, ROLES.STAFF)];

// 1. Revenue Report
router.get('/revenue', requireStaffOrAdmin, (req, res) => reportController.getRevenueReport(req, res));

// 2. Subscription Report
router.get('/subscriptions', requireStaffOrAdmin, (req, res) => reportController.getSubscriptionReport(req, res));

// 3. Invoice Report
router.get('/invoices', requireStaffOrAdmin, (req, res) => reportController.getInvoiceReport(req, res));

// 4. Payment Report
router.get('/payments', requireStaffOrAdmin, (req, res) => reportController.getPaymentReport(req, res));

// 5. Customer Report
router.get('/customers', requireStaffOrAdmin, (req, res) => reportController.getCustomerReport(req, res));

module.exports = router;
