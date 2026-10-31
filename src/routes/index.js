const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const planRoutes = require('./planRoutes');
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
      }
    }
  });
});

// Mount module routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/plans', planRoutes);

module.exports = router;
