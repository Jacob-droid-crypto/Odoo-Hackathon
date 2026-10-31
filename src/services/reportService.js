const { prisma, getIsDbConnected } = require('../config/db');
const inMemoryStore = require('./inMemoryStore');
const logger = require('../utils/logger');
const { roundCurrency } = require('../utils/billingCalculator');
const { getCurrencyConfig } = require('../utils/currency');
const {
  ROLES,
  SUBSCRIPTION_STATUSES,
  INVOICE_STATUSES,
  PAYMENT_STATUSES
} = require('../constants/roles');

class ReportService {
  constructor() {
    this.currency = getCurrencyConfig();
  }

  /**
   * Escape CSV cell values according to RFC 4180
   */
  escapeCsv(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }

  /**
   * Convert an array of row objects to CSV string
   */
  generateCsv(headers, rows) {
    const headerLine = headers.map(h => this.escapeCsv(h.label)).join(',');
    const dataLines = rows.map(row => {
      return headers.map(h => this.escapeCsv(row[h.key] ?? '')).join(',');
    });
    return [headerLine, ...dataLines].join('\r\n');
  }

  // ===========================================================================
  // 1. REVENUE REPORT
  // ===========================================================================

  async getRevenueReport(query = {}) {
    let payments = [];
    const startDate = query.startDate ? new Date(query.startDate) : new Date(0);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    endDate.setHours(23, 59, 59, 999);

    if (getIsDbConnected() && prisma) {
      try {
        payments = await prisma.payment.findMany({
          where: {
            status: PAYMENT_STATUSES.COMPLETED,
            paymentDate: { gte: startDate, lte: endDate }
          },
          include: {
            customer: true,
            invoice: true
          },
          orderBy: { paymentDate: 'desc' }
        });
      } catch (err) {
        logger.warn('Prisma getRevenueReport failed, falling back:', err.message);
      }
    }

    if (!payments.length) {
      payments = Array.from(inMemoryStore.payments.values())
        .filter(p => {
          if (p.status !== PAYMENT_STATUSES.COMPLETED) return false;
          const d = new Date(p.paymentDate || p.createdAt);
          return d >= startDate && d <= endDate;
        })
        .map(p => ({
          ...p,
          customer: inMemoryStore.users.get(p.customerId),
          invoice: inMemoryStore.invoices.get(p.invoiceId)
        }))
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
    }

    const rows = payments.map(p => {
      const cust = p.customer;
      return {
        paymentNumber: p.paymentNumber || 'N/A',
        paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : 'N/A',
        customerName: cust ? (cust.companyName || `${cust.firstName} ${cust.lastName}`) : 'N/A',
        email: cust?.email || 'N/A',
        invoiceNumber: p.invoice?.invoiceNumber || 'N/A',
        paymentMethod: p.paymentMethod || 'N/A',
        amount: roundCurrency(parseFloat(p.amount || 0)),
        status: p.status || 'COMPLETED'
      };
    });

    const totalRevenue = roundCurrency(rows.reduce((sum, r) => sum + r.amount, 0));
    const averagePayment = rows.length > 0 ? roundCurrency(totalRevenue / rows.length) : 0;

    const headers = [
      { key: 'paymentNumber', label: 'Payment #' },
      { key: 'paymentDate', label: 'Payment Date' },
      { key: 'customerName', label: 'Customer Name' },
      { key: 'email', label: 'Email' },
      { key: 'invoiceNumber', label: 'Invoice #' },
      { key: 'paymentMethod', label: 'Method' },
      { key: 'amount', label: `Amount (${this.currency.code})` },
      { key: 'status', label: 'Status' }
    ];

    return {
      reportType: 'Revenue Report',
      period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      summary: { totalRevenue, paymentCount: rows.length, averagePayment, currency: this.currency.code },
      headers,
      rows,
      csv: this.generateCsv(headers, rows)
    };
  }

  // ===========================================================================
  // 2. SUBSCRIPTION REPORT
  // ===========================================================================

  async getSubscriptionReport(query = {}) {
    let subs = [];
    const startDate = query.startDate ? new Date(query.startDate) : new Date(0);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    endDate.setHours(23, 59, 59, 999);
    const filterStatus = query.status ? query.status.toUpperCase() : null;

    if (getIsDbConnected() && prisma) {
      try {
        const where = {
          createdAt: { gte: startDate, lte: endDate }
        };
        if (filterStatus) where.status = filterStatus;

        subs = await prisma.subscription.findMany({
          where,
          include: {
            customer: true,
            plan: { include: { product: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
      } catch (err) {
        logger.warn('Prisma getSubscriptionReport failed, falling back:', err.message);
      }
    }

    if (!subs.length) {
      subs = Array.from(inMemoryStore.subscriptions.values())
        .filter(s => {
          const d = new Date(s.createdAt || s.startDate);
          if (d < startDate || d > endDate) return false;
          if (filterStatus && s.status !== filterStatus) return false;
          return true;
        })
        .map(s => {
          const plan = inMemoryStore.plans.get(s.planId);
          return {
            ...s,
            customer: inMemoryStore.users.get(s.customerId),
            plan: plan ? { ...plan, product: inMemoryStore.products.get(plan.productId) } : null
          };
        });
    }

    const rows = subs.map(s => {
      const cust = s.customer;
      return {
        subscriptionNumber: s.subscriptionNumber || 'N/A',
        customerName: cust ? (cust.companyName || `${cust.firstName} ${cust.lastName}`) : 'N/A',
        email: cust?.email || 'N/A',
        productName: s.plan?.product?.name || 'Brightloop ERP',
        planName: s.plan?.name || 'Standard Plan',
        billingInterval: s.plan?.billingInterval || 'MONTHLY',
        quantity: s.quantity || 1,
        totalAmount: roundCurrency(parseFloat(s.totalAmount || s.plan?.price || 0)),
        status: s.status,
        startDate: s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : 'N/A',
        nextBillingDate: s.nextBillingDate ? new Date(s.nextBillingDate).toISOString().split('T')[0] : 'N/A'
      };
    });

    const headers = [
      { key: 'subscriptionNumber', label: 'Subscription #' },
      { key: 'customerName', label: 'Customer' },
      { key: 'email', label: 'Email' },
      { key: 'productName', label: 'Product' },
      { key: 'planName', label: 'Plan' },
      { key: 'billingInterval', label: 'Interval' },
      { key: 'quantity', label: 'Qty' },
      { key: 'totalAmount', label: `Total Amount (${this.currency.code})` },
      { key: 'status', label: 'Status' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'nextBillingDate', label: 'Next Billing Date' }
    ];

    return {
      reportType: 'Subscription Report',
      period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      summary: { totalSubscriptions: rows.length, statusFilter: filterStatus || 'ALL' },
      headers,
      rows,
      csv: this.generateCsv(headers, rows)
    };
  }

  // ===========================================================================
  // 3. INVOICE REPORT
  // ===========================================================================

  async getInvoiceReport(query = {}) {
    let invoices = [];
    const startDate = query.startDate ? new Date(query.startDate) : new Date(0);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    endDate.setHours(23, 59, 59, 999);
    const filterStatus = query.status ? query.status.toUpperCase() : null;

    if (getIsDbConnected() && prisma) {
      try {
        const where = {
          issuedDate: { gte: startDate, lte: endDate }
        };
        if (filterStatus) where.status = filterStatus;

        invoices = await prisma.invoice.findMany({
          where,
          include: { customer: true },
          orderBy: { issuedDate: 'desc' }
        });
      } catch (err) {
        logger.warn('Prisma getInvoiceReport failed, falling back:', err.message);
      }
    }

    if (!invoices.length) {
      invoices = Array.from(inMemoryStore.invoices.values())
        .filter(i => {
          const d = new Date(i.issuedDate || i.createdAt);
          if (d < startDate || d > endDate) return false;
          if (filterStatus && i.status !== filterStatus) return false;
          return true;
        })
        .map(i => ({
          ...i,
          customer: inMemoryStore.users.get(i.customerId)
        }));
    }

    const rows = invoices.map(i => {
      const cust = i.customer;
      const total = parseFloat(i.totalAmount || 0);
      const paid = parseFloat(i.paidAmount || 0);
      const outstanding = i.outstandingAmount !== undefined ? parseFloat(i.outstandingAmount) : Math.max(0, total - paid);

      return {
        invoiceNumber: i.invoiceNumber,
        customerName: cust ? (cust.companyName || `${cust.firstName} ${cust.lastName}`) : 'N/A',
        email: cust?.email || 'N/A',
        issuedDate: i.issuedDate ? new Date(i.issuedDate).toISOString().split('T')[0] : 'N/A',
        dueDate: i.dueDate ? new Date(i.dueDate).toISOString().split('T')[0] : 'N/A',
        subtotal: roundCurrency(parseFloat(i.subtotal || 0)),
        taxTotal: roundCurrency(parseFloat(i.taxTotal || 0)),
        totalAmount: roundCurrency(total),
        paidAmount: roundCurrency(paid),
        outstandingBalance: roundCurrency(outstanding),
        status: i.status
      };
    });

    const headers = [
      { key: 'invoiceNumber', label: 'Invoice #' },
      { key: 'customerName', label: 'Customer' },
      { key: 'email', label: 'Email' },
      { key: 'issuedDate', label: 'Issue Date' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'subtotal', label: `Subtotal (${this.currency.code})` },
      { key: 'taxTotal', label: `Tax (${this.currency.code})` },
      { key: 'totalAmount', label: `Total (${this.currency.code})` },
      { key: 'paidAmount', label: `Paid (${this.currency.code})` },
      { key: 'outstandingBalance', label: `Outstanding (${this.currency.code})` },
      { key: 'status', label: 'Status' }
    ];

    const totalInvoiced = roundCurrency(rows.reduce((sum, r) => sum + r.totalAmount, 0));
    const totalOutstanding = roundCurrency(rows.reduce((sum, r) => sum + r.outstandingBalance, 0));

    return {
      reportType: 'Invoice Report',
      period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      summary: { totalInvoices: rows.length, totalInvoiced, totalOutstanding, currency: this.currency.code },
      headers,
      rows,
      csv: this.generateCsv(headers, rows)
    };
  }

  // ===========================================================================
  // 4. PAYMENT REPORT
  // ===========================================================================

  async getPaymentReport(query = {}) {
    let payments = [];
    const startDate = query.startDate ? new Date(query.startDate) : new Date(0);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    endDate.setHours(23, 59, 59, 999);
    const methodFilter = query.method ? query.method.toUpperCase() : null;

    if (getIsDbConnected() && prisma) {
      try {
        const where = {
          paymentDate: { gte: startDate, lte: endDate }
        };
        if (methodFilter) where.paymentMethod = methodFilter;

        payments = await prisma.payment.findMany({
          where,
          include: { customer: true, invoice: true },
          orderBy: { paymentDate: 'desc' }
        });
      } catch (err) {
        logger.warn('Prisma getPaymentReport failed, falling back:', err.message);
      }
    }

    if (!payments.length) {
      payments = Array.from(inMemoryStore.payments.values())
        .filter(p => {
          const d = new Date(p.paymentDate || p.createdAt);
          if (d < startDate || d > endDate) return false;
          if (methodFilter && (p.paymentMethod || '').toUpperCase() !== methodFilter) return false;
          return true;
        })
        .map(p => ({
          ...p,
          customer: inMemoryStore.users.get(p.customerId),
          invoice: inMemoryStore.invoices.get(p.invoiceId)
        }));
    }

    const rows = payments.map(p => {
      const cust = p.customer;
      return {
        paymentNumber: p.paymentNumber,
        paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : 'N/A',
        customerName: cust ? (cust.companyName || `${cust.firstName} ${cust.lastName}`) : 'N/A',
        email: cust?.email || 'N/A',
        invoiceNumber: p.invoice?.invoiceNumber || 'N/A',
        paymentMethod: p.paymentMethod || 'N/A',
        amount: roundCurrency(parseFloat(p.amount || 0)),
        status: p.status,
        referenceNote: p.referenceNote || 'N/A'
      };
    });

    const headers = [
      { key: 'paymentNumber', label: 'Payment #' },
      { key: 'paymentDate', label: 'Date' },
      { key: 'customerName', label: 'Customer' },
      { key: 'email', label: 'Email' },
      { key: 'invoiceNumber', label: 'Invoice #' },
      { key: 'paymentMethod', label: 'Method' },
      { key: 'amount', label: `Amount (${this.currency.code})` },
      { key: 'status', label: 'Status' },
      { key: 'referenceNote', label: 'Reference' }
    ];

    const totalCollected = roundCurrency(rows.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + r.amount, 0));

    return {
      reportType: 'Payment Report',
      period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      summary: { totalTransactions: rows.length, totalCollected, currency: this.currency.code },
      headers,
      rows,
      csv: this.generateCsv(headers, rows)
    };
  }

  // ===========================================================================
  // 5. CUSTOMER REPORT
  // ===========================================================================

  async getCustomerReport(query = {}) {
    let customers = [];
    let subscriptions = [];
    let payments = [];

    if (getIsDbConnected() && prisma) {
      try {
        [customers, subscriptions, payments] = await Promise.all([
          prisma.user.findMany({
            where: { role: ROLES.CUSTOMER },
            orderBy: { createdAt: 'desc' }
          }),
          prisma.subscription.findMany(),
          prisma.payment.findMany({ where: { status: PAYMENT_STATUSES.COMPLETED } })
        ]);
      } catch (err) {
        logger.warn('Prisma getCustomerReport failed, falling back:', err.message);
      }
    }

    if (!customers.length) {
      customers = Array.from(inMemoryStore.users.values()).filter(u => u.role === ROLES.CUSTOMER);
      subscriptions = Array.from(inMemoryStore.subscriptions.values());
      payments = Array.from(inMemoryStore.payments.values()).filter(p => p.status === PAYMENT_STATUSES.COMPLETED);
    }

    const subsByCustomer = new Map();
    subscriptions.forEach(s => {
      const list = subsByCustomer.get(s.customerId) || [];
      list.push(s);
      subsByCustomer.set(s.customerId, list);
    });

    const paymentsByCustomer = new Map();
    payments.forEach(p => {
      paymentsByCustomer.set(p.customerId, (paymentsByCustomer.get(p.customerId) || 0) + parseFloat(p.amount || 0));
    });

    const rows = customers.map(c => {
      const userSubs = subsByCustomer.get(c.id) || [];
      const totalPaid = roundCurrency(paymentsByCustomer.get(c.id) || 0);

      return {
        customerId: c.id,
        customerName: c.companyName || `${c.firstName} ${c.lastName}`,
        email: c.email,
        phone: c.phone || 'N/A',
        joinDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : 'N/A',
        totalSubscriptions: userSubs.length,
        activeSubscriptions: userSubs.filter(s => s.status === SUBSCRIPTION_STATUSES.ACTIVE).length,
        totalAmountPaid: totalPaid
      };
    });

    const headers = [
      { key: 'customerName', label: 'Customer Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'joinDate', label: 'Joined On' },
      { key: 'totalSubscriptions', label: 'Total Subs' },
      { key: 'activeSubscriptions', label: 'Active Subs' },
      { key: 'totalAmountPaid', label: `Total Spent (${this.currency.code})` }
    ];

    return {
      reportType: 'Customer Report',
      summary: { totalCustomers: rows.length, currency: this.currency.code },
      headers,
      rows,
      csv: this.generateCsv(headers, rows)
    };
  }
}

const reportService = new ReportService();
module.exports = reportService;
