const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const planRoutes = require('./planRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const paymentRoutes = require('./paymentRoutes');
const billingRoutes = require('./billingRoutes');
const { getIsDbConnected } = require('../config/db');

/**
 * System Health & Connectivity Check
 * GET /api/health
 */
router.get('/health', (req, res) => {
  const isConnected = getIsDbConnected();
  res.status(200).json({
    status: 'UP',
    service: 'Subscription Management System API',
    version: '1.0.0',
    database: {
      provider: 'PostgreSQL',
      orm: 'Prisma',
      connected: isConnected,
      mode: isConnected ? 'PostgreSQL Active' : 'In-Memory Testing Mode (PostgreSQL Configured)'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * API Root Information & Catalog
 * GET /api
 */
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Brightloop Subscription Management System API',
    version: '1.0.0',
    documentation: '/API_DOCUMENTATION.md',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password'
      },
      users: {
        createStaff: 'POST /api/users/staff (ADMIN only)',
        listUsers: 'GET /api/users (ADMIN & STAFF)',
        getUserById: 'GET /api/users/:id'
      },
      products: {
        create: 'POST /api/products (ADMIN only)',
        list: 'GET /api/products',
        getById: 'GET /api/products/:id',
        update: 'PUT /api/products/:id (ADMIN only)',
        delete: 'DELETE /api/products/:id (ADMIN only)'
      },
      productVariants: {
        create: 'POST /api/products/:productId/variants (ADMIN only)',
        list: 'GET /api/products/:productId/variants',
        getById: 'GET /api/products/:productId/variants/:variantId',
        update: 'PUT /api/products/:productId/variants/:variantId (ADMIN only)',
        delete: 'DELETE /api/products/:productId/variants/:variantId (ADMIN only)'
      },
      subscriptionPlans: {
        create: 'POST /api/plans (ADMIN only)',
        list: 'GET /api/plans',
        getById: 'GET /api/plans/:id',
        update: 'PUT /api/plans/:id (ADMIN only)',
        delete: 'DELETE /api/plans/:id (ADMIN only)'
      },
      subscriptions: {
        create: 'POST /api/subscriptions',
        list: 'GET /api/subscriptions',
        getById: 'GET /api/subscriptions/:id',
        update: 'PUT /api/subscriptions/:id',
        updateStatus: 'PATCH /api/subscriptions/:id/status',
        activate: 'POST /api/subscriptions/:id/activate',
        pause: 'POST /api/subscriptions/:id/pause',
        resume: 'POST /api/subscriptions/:id/resume',
        close: 'POST /api/subscriptions/:id/close',
        renew: 'POST /api/subscriptions/:id/renew'
      },
      invoices: {
        generate: 'POST /api/invoices/generate (ADMIN & STAFF)',
        list: 'GET /api/invoices',
        getById: 'GET /api/invoices/:id',
        getBySubscription: 'GET /api/invoices/subscription/:subscriptionId'
      },
      payments: {
        record: 'POST /api/payments',
        list: 'GET /api/payments',
        getById: 'GET /api/payments/:id',
        getByInvoice: 'GET /api/payments/invoice/:invoiceId',
        getByCustomer: 'GET /api/payments/customer/:customerId'
      },
      billing: {
        runEngine: 'POST /api/billing/run (ADMIN & STAFF)',
        dueSubscriptions: 'GET /api/billing/due-subscriptions (ADMIN & STAFF)',
        taxRates: 'GET & POST /api/billing/tax-rates',
        discounts: 'GET & POST /api/billing/discounts',
        calculatePreview: 'POST /api/billing/calculate',
        analytics: 'GET /api/billing/analytics (ADMIN & STAFF)'
      }
    }
  });
});

// Mount module routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/plans', planRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/billing', billingRoutes);

module.exports = router;
