const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const {
  ROLES,
  PRODUCT_TYPES,
  BILLING_INTERVALS,
  SUBSCRIPTION_STATUSES,
  INVOICE_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS
} = require('../constants/roles');

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
    this.subscriptions = new Map();
    this.subscriptionLines = new Map();
    this.invoices = new Map();
    this.invoiceLines = new Map();
    this.payments = new Map();
    this.taxRules = new Map();
    this.discountRules = new Map();
    this.subscriptionCounter = 1;
    this.invoiceCounter = 1;
    this.paymentCounter = 1;
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

    // Seed Tax Rules
    const tax1Id = 'tax-rule-001';
    this.taxRules.set(tax1Id, {
      id: tax1Id,
      name: 'Standard GST (18%)',
      ratePercentage: 18.00,
      description: 'Standard 18% GST / VAT for SaaS subscriptions',
      isDefault: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const tax2Id = 'tax-rule-002';
    this.taxRules.set(tax2Id, {
      id: tax2Id,
      name: 'Reduced VAT (5%)',
      ratePercentage: 5.00,
      description: 'Concessional 5% tax rate',
      isDefault: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const tax3Id = 'tax-rule-003';
    this.taxRules.set(tax3Id, {
      id: tax3Id,
      name: 'Zero Tax (0%)',
      ratePercentage: 0.00,
      description: 'Zero-rated export or exempt services',
      isDefault: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Seed Discount Rules
    const disc1Id = 'disc-rule-001';
    this.discountRules.set(disc1Id, {
      id: disc1Id,
      code: 'BRIGHT10',
      description: '10% promotional discount for new subscriptions',
      type: 'PERCENTAGE',
      value: 10.00,
      minPurchase: null,
      minQuantity: null,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      maxUses: 1000,
      usedCount: 0,
      targetType: 'SUBSCRIPTION',
      targetProductId: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const disc2Id = 'disc-rule-002';
    this.discountRules.set(disc2Id, {
      id: disc2Id,
      code: 'WELCOME100',
      description: 'Flat ₹100 welcome credit',
      type: 'FIXED',
      value: 100.00,
      minPurchase: 500.00,
      minQuantity: null,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      maxUses: 500,
      usedCount: 0,
      targetType: 'SUBSCRIPTION',
      targetProductId: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  generateId() {
    return crypto.randomUUID();
  }

  generateSubscriptionNumber() {
    const year = new Date().getFullYear();
    const seq = String(this.subscriptionCounter++).padStart(4, '0');
    return `SUB-${year}-${seq}`;
  }

  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const seq = String(this.invoiceCounter++).padStart(4, '0');
    return `INV-${year}-${seq}`;
  }

  generatePaymentNumber() {
    const year = new Date().getFullYear();
    const seq = String(this.paymentCounter++).padStart(4, '0');
    return `PAY-${year}-${seq}`;
  }

  seedAnalyticsDemoData() {
    if (this.subscriptions.size > 0 && this.payments.size > 0) {
      return { message: 'Demo data already present' };
    }

    const bcrypt = require('bcryptjs');
    const pwdHash = bcrypt.hashSync('Customer@Brightloop123!', 10);
    const now = new Date();

    // 1. Additional Demo Customers
    const demoCustomers = [
      { id: 'cust-wayne-001', email: 'bruce@waynecorp.com', firstName: 'Bruce', lastName: 'Wayne', companyName: 'Wayne Enterprises', phone: '+1-555-0201' },
      { id: 'cust-stark-002', email: 'tony@starkindustries.com', firstName: 'Tony', lastName: 'Stark', companyName: 'Stark Industries', phone: '+1-555-0202' },
      { id: 'cust-diana-003', email: 'diana@themyscira.org', firstName: 'Diana', lastName: 'Prince', companyName: 'Themyscira Global', phone: '+1-555-0203' },
      { id: 'cust-parker-004', email: 'peter@dailybugle.com', firstName: 'Peter', lastName: 'Parker', companyName: 'Daily Bugle Media', phone: '+1-555-0204' }
    ];

    demoCustomers.forEach((cust, idx) => {
      if (!this.users.has(cust.id)) {
        const createdDaysAgo = (idx + 1) * 25;
        const createdAt = new Date(now.getTime() - createdDaysAgo * 86400000);
        this.users.set(cust.id, {
          ...cust,
          role: ROLES.CUSTOMER,
          passwordHash: pwdHash,
          isActive: true,
          resetPasswordToken: null,
          resetPasswordExpires: null,
          createdAt,
          updatedAt: createdAt
        });
      }
    });

    const planMonthly = this.plans.get('plan-monthly-001');
    const planYearly = this.plans.get('plan-yearly-002');
    const planWeekly = this.plans.get('plan-weekly-004');

    // 2. Demo Subscriptions
    const subDefs = [
      {
        id: 'sub-demo-001',
        subNum: 'SUB-2026-0101',
        customerId: 'customer-user-001',
        planId: 'plan-monthly-001',
        plan: planMonthly,
        quantity: 2,
        unitPrice: 1200.00,
        totalAmount: 2400.00,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
        daysAgo: 90,
        nextBillingDays: 5
      },
      {
        id: 'sub-demo-002',
        subNum: 'SUB-2026-0102',
        customerId: 'cust-wayne-001',
        planId: 'plan-yearly-002',
        plan: planYearly,
        quantity: 5,
        unitPrice: 12000.00,
        totalAmount: 60000.00,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
        daysAgo: 180,
        nextBillingDays: 185
      },
      {
        id: 'sub-demo-003',
        subNum: 'SUB-2026-0103',
        customerId: 'cust-stark-002',
        planId: 'plan-monthly-001',
        plan: planMonthly,
        quantity: 10,
        unitPrice: 1200.00,
        totalAmount: 12000.00,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
        daysAgo: 60,
        nextBillingDays: 3
      },
      {
        id: 'sub-demo-004',
        subNum: 'SUB-2026-0104',
        customerId: 'cust-diana-003',
        planId: 'plan-weekly-004',
        plan: planWeekly,
        quantity: 3,
        unitPrice: 80.00,
        totalAmount: 240.00,
        status: SUBSCRIPTION_STATUSES.PAUSED,
        daysAgo: 45,
        nextBillingDays: 10
      },
      {
        id: 'sub-demo-005',
        subNum: 'SUB-2026-0105',
        customerId: 'cust-parker-004',
        planId: 'plan-monthly-001',
        plan: planMonthly,
        quantity: 1,
        unitPrice: 1200.00,
        totalAmount: 1200.00,
        status: SUBSCRIPTION_STATUSES.CLOSED,
        daysAgo: 120,
        nextBillingDays: null
      }
    ];

    subDefs.forEach(s => {
      const startDate = new Date(now.getTime() - s.daysAgo * 86400000);
      const nextBillingDate = s.nextBillingDays !== null ? new Date(now.getTime() + s.nextBillingDays * 86400000) : null;
      this.subscriptions.set(s.id, {
        id: s.id,
        subscriptionNumber: s.subNum,
        customerId: s.customerId,
        planId: s.planId,
        quantity: s.quantity,
        unitPrice: s.unitPrice,
        totalAmount: s.totalAmount,
        status: s.status,
        startDate,
        expiryDate: null,
        nextBillingDate,
        lastBillingDate: startDate,
        paymentTerms: 'Net 30',
        autoRenew: true,
        notes: 'Pre-seeded demo subscription',
        createdAt: startDate,
        updatedAt: startDate
      });
    });

    // 3. Demo Invoices & Successful Payments
    const invoiceDefs = [
      {
        id: 'inv-demo-001',
        invNum: 'INV-2026-0101',
        subId: 'sub-demo-001',
        custId: 'customer-user-001',
        status: INVOICE_STATUSES.PAID,
        amount: 2400.00,
        paid: 2400.00,
        daysAgo: 60,
        paymentMethod: 'UPI'
      },
      {
        id: 'inv-demo-002',
        invNum: 'INV-2026-0102',
        subId: 'sub-demo-001',
        custId: 'customer-user-001',
        status: INVOICE_STATUSES.PAID,
        amount: 2400.00,
        paid: 2400.00,
        daysAgo: 30,
        paymentMethod: 'UPI'
      },
      {
        id: 'inv-demo-003',
        invNum: 'INV-2026-0103',
        subId: 'sub-demo-002',
        custId: 'cust-wayne-001',
        status: INVOICE_STATUSES.PAID,
        amount: 60000.00,
        paid: 60000.00,
        daysAgo: 180,
        paymentMethod: 'BANK_TRANSFER'
      },
      {
        id: 'inv-demo-004',
        invNum: 'INV-2026-0104',
        subId: 'sub-demo-003',
        custId: 'cust-stark-002',
        status: INVOICE_STATUSES.PAID,
        amount: 12000.00,
        paid: 12000.00,
        daysAgo: 60,
        paymentMethod: 'CREDIT_CARD'
      },
      {
        id: 'inv-demo-005',
        invNum: 'INV-2026-0105',
        subId: 'sub-demo-003',
        custId: 'cust-stark-002',
        status: INVOICE_STATUSES.PAID,
        amount: 12000.00,
        paid: 12000.00,
        daysAgo: 10,
        paymentMethod: 'CARD'
      },
      {
        id: 'inv-demo-006',
        invNum: 'INV-2026-0106',
        subId: 'sub-demo-004',
        custId: 'cust-diana-003',
        status: INVOICE_STATUSES.PAID,
        amount: 240.00,
        paid: 240.00,
        daysAgo: 40,
        paymentMethod: 'CASH'
      },
      {
        id: 'inv-demo-007',
        invNum: 'INV-2026-0107',
        subId: 'sub-demo-001',
        custId: 'customer-user-001',
        status: INVOICE_STATUSES.PARTIALLY_PAID,
        amount: 2400.00,
        paid: 1000.00,
        daysAgo: 5,
        paymentMethod: 'UPI'
      },
      {
        id: 'inv-demo-008',
        invNum: 'INV-2026-0108',
        subId: 'sub-demo-005',
        custId: 'cust-parker-004',
        status: INVOICE_STATUSES.OVERDUE,
        amount: 1200.00,
        paid: 0.00,
        daysAgo: 45,
        dueDaysAgo: 15,
        paymentMethod: null
      },
      {
        id: 'inv-demo-009',
        invNum: 'INV-2026-0109',
        subId: 'sub-demo-003',
        custId: 'cust-stark-002',
        status: INVOICE_STATUSES.CONFIRMED,
        amount: 12000.00,
        paid: 0.00,
        daysAgo: 2,
        paymentMethod: null
      }
    ];

    invoiceDefs.forEach((inv, idx) => {
      const issuedDate = new Date(now.getTime() - inv.daysAgo * 86400000);
      const dueDate = inv.dueDaysAgo !== undefined
        ? new Date(now.getTime() - inv.dueDaysAgo * 86400000)
        : new Date(issuedDate.getTime() + 15 * 86400000);
      const outstanding = Math.max(0, inv.amount - inv.paid);

      this.invoices.set(inv.id, {
        id: inv.id,
        invoiceNumber: inv.invNum,
        subscriptionId: inv.subId,
        customerId: inv.custId,
        status: inv.status,
        subtotal: inv.amount,
        taxTotal: 0.00,
        discountTotal: 0.00,
        totalAmount: inv.amount,
        paidAmount: inv.paid,
        outstandingAmount: outstanding,
        issuedDate,
        dueDate,
        paidAt: inv.paid > 0 ? issuedDate : null,
        notes: 'Pre-seeded demo invoice',
        createdAt: issuedDate,
        updatedAt: issuedDate
      });

      // If paid or partially paid, create Payment record
      if (inv.paid > 0 && inv.paymentMethod) {
        const payId = `pay-demo-${String(idx + 1).padStart(3, '0')}`;
        const payNum = `PAY-2026-${String(idx + 1).padStart(4, '0')}`;
        this.payments.set(payId, {
          id: payId,
          paymentNumber: payNum,
          invoiceId: inv.id,
          customerId: inv.custId,
          amount: inv.paid,
          paymentMethod: inv.paymentMethod,
          status: PAYMENT_STATUSES.COMPLETED,
          paymentDate: issuedDate,
          referenceNote: `Demo payment via ${inv.paymentMethod}`,
          createdAt: issuedDate,
          updatedAt: issuedDate
        });
      }
    });

    return {
      success: true,
      seeded: {
        customers: demoCustomers.length,
        subscriptions: subDefs.length,
        invoices: invoiceDefs.length,
        payments: Array.from(this.payments.values()).length
      }
    };
  }
}

const inMemoryStore = new InMemoryStore();
module.exports = inMemoryStore;
