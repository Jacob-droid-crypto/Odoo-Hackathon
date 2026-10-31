const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { ROLES, PRODUCT_TYPES, BILLING_INTERVALS } = require('../constants/roles');

/**
 * High-speed in-memory data store for testing and fallback when PostgreSQL server is offline.
 * Pre-seeded with default Brightloop accounts, products, and plans.
 */
class InMemoryStore {
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.variants = new Map();
    this.plans = new Map();
    this.initDefaultData();
  }

  async initDefaultData() {
    // Default password: Admin@Brightloop123!
    const defaultPasswordHash = bcrypt.hashSync('Admin@Brightloop123!', 10);
    const staffPasswordHash = bcrypt.hashSync('Staff@Brightloop123!', 10);
    const customerPasswordHash = bcrypt.hashSync('Customer@Brightloop123!', 10);

    // Seed Admin
    const adminId = 'admin-user-001';
    this.users.set(adminId, {
      id: adminId,
      email: 'admin@brightloop.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: ROLES.ADMIN,
      companyName: 'Brightloop Software',
      phone: '+1-555-0100',
      isActive: true,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Seed Staff
    const staffId = 'staff-user-001';
    this.users.set(staffId, {
      id: staffId,
      email: 'staff@brightloop.com',
      passwordHash: staffPasswordHash,
      firstName: 'Sarah',
      lastName: 'Staff',
      role: ROLES.STAFF,
      companyName: 'Brightloop Operations',
      phone: '+1-555-0101',
      isActive: true,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Seed Customer
    const customerId = 'customer-user-001';
    this.users.set(customerId, {
      id: customerId,
      email: 'customer@acme.com',
      passwordHash: customerPasswordHash,
      firstName: 'Alice',
      lastName: 'Acme',
      role: ROLES.CUSTOMER,
      companyName: 'Acme Retail Corp',
      phone: '+1-555-0102',
      isActive: true,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Seed Products
    const prod1Id = 'prod-software-001';
    this.products.set(prod1Id, {
      id: prod1Id,
      name: 'Brightloop ERP Business Software',
      type: PRODUCT_TYPES.SOFTWARE,
      salesPrice: 1200.00,
      costPrice: 400.00,
      notes: 'Flagship enterprise cloud subscription',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const prod2Id = 'prod-addon-002';
    this.products.set(prod2Id, {
      id: prod2Id,
      name: 'Advanced Analytics Add-on',
      type: PRODUCT_TYPES.ADDON,
      salesPrice: 250.00,
      costPrice: 50.00,
      notes: 'Predictive revenue forecasting and custom reporting',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Seed Product Variant (as described in problem statement: "where choosing the Odoo brand adds 560 to the price")
    const var1Id = 'var-brand-odoo-001';
    this.variants.set(var1Id, {
      id: var1Id,
      productId: prod1Id,
      variantName: 'Brand: Odoo Integration',
      attributeName: 'Brand',
      attributeValue: 'Odoo',
      priceExtra: 560.00,
      sku: 'BL-ERP-ODOO-560',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Seed Subscription Plans (daily, weekly, monthly, yearly)
    const planMonthlyId = 'plan-monthly-001';
    this.plans.set(planMonthlyId, {
      id: planMonthlyId,
      productId: prod1Id,
      name: 'Brightloop Monthly Professional',
      code: 'BL-ERP-MONTHLY',
      description: 'Standard monthly subscription plan billed every month',
      price: 1200.00,
      billingInterval: BILLING_INTERVALS.MONTHLY,
      intervalCount: 1,
      minQuantity: 1,
      startDate: new Date('2026-01-01'),
      endDate: null,
      autoClose: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenew: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const planYearlyId = 'plan-yearly-002';
    this.plans.set(planYearlyId, {
      id: planYearlyId,
      productId: prod1Id,
      name: 'Brightloop Yearly Enterprise',
      code: 'BL-ERP-YEARLY',
      description: 'Yearly subscription with discounted rate',
      price: 12000.00,
      billingInterval: BILLING_INTERVALS.YEARLY,
      intervalCount: 1,
      minQuantity: 5,
      startDate: new Date('2026-01-01'),
      endDate: null,
      autoClose: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenew: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const planDailyId = 'plan-daily-003';
    this.plans.set(planDailyId, {
      id: planDailyId,
      productId: prod2Id,
      name: 'Analytics Daily Pass',
      code: 'BL-ANALYTICS-DAILY',
      description: 'Daily usage plan for intensive audit periods',
      price: 15.00,
      billingInterval: BILLING_INTERVALS.DAILY,
      intervalCount: 1,
      minQuantity: 1,
      startDate: new Date('2026-01-01'),
      endDate: null,
      autoClose: true,
      allowEarlyClose: true,
      allowPause: false,
      allowRenew: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const planWeeklyId = 'plan-weekly-004';
    this.plans.set(planWeeklyId, {
      id: planWeeklyId,
      productId: prod2Id,
      name: 'Analytics Weekly Sprint',
      code: 'BL-ANALYTICS-WEEKLY',
      description: 'Weekly subscription for sprint projects',
      price: 80.00,
      billingInterval: BILLING_INTERVALS.WEEKLY,
      intervalCount: 1,
      minQuantity: 1,
      startDate: new Date('2026-01-01'),
      endDate: null,
      autoClose: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenew: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  generateId() {
    return crypto.randomUUID();
  }
}

const inMemoryStore = new InMemoryStore();
module.exports = inMemoryStore;
