const { prisma, getIsDbConnected } = require('../config/db');
const inMemoryStore = require('./inMemoryStore');
const logger = require('../utils/logger');
const { roundCurrency } = require('../utils/billingCalculator');
const { getCurrencyConfig } = require('../utils/currency');
const {
  ROLES,
  SUBSCRIPTION_STATUSES,
  INVOICE_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS
} = require('../constants/roles');

class AnalyticsService {
  constructor() {
    this.currency = getCurrencyConfig();
  }

  /**
   * Parse date range filter into start and end Date objects
   */
  resolveDateRange(filter = {}) {
    const now = new Date();
    let startDate = null;
    let endDate = new Date(now.getTime());

    if (filter.startDate) {
      startDate = new Date(filter.startDate);
    }
    if (filter.endDate) {
      endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999);
    }

    if (!startDate && filter.period) {
      switch (filter.period.toLowerCase()) {
        case 'last_7_days':
        case '7days':
          startDate = new Date(now.getTime() - 7 * 86400000);
          break;
        case 'last_30_days':
        case '30days':
          startDate = new Date(now.getTime() - 30 * 86400000);
          break;
        case 'last_3_months':
        case '3months':
          startDate = new Date(now.getTime() - 90 * 86400000);
          break;
        case 'last_6_months':
        case '6months':
          startDate = new Date(now.getTime() - 180 * 86400000);
          break;
        case 'this_year':
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 86400000);
          break;
      }
    }

    if (!startDate) {
      startDate = new Date(now.getTime() - 30 * 86400000); // Default to last 30 days
    }

    return { startDate, endDate };
  }

  // ===========================================================================
  // 1. ADMIN DASHBOARD SUMMARY
  // ===========================================================================

  async getDashboardSummary() {
    const now = new Date();

    if (getIsDbConnected() && prisma) {
      try {
        const [
          totalCustomers,
          totalProducts,
          activeSubscriptions,
          allSubscriptions,
          paymentsAgg,
          invoices,
          recentSubs,
          recentInvs,
          recentPays,
          recentUsers
        ] = await Promise.all([
          prisma.user.count({ where: { role: ROLES.CUSTOMER } }),
          prisma.product.count({ where: { isActive: true } }),
          prisma.subscription.count({ where: { status: SUBSCRIPTION_STATUSES.ACTIVE } }),
          prisma.subscription.findMany({ select: { id: true, status: true, nextBillingDate: true, autoRenew: true } }),
          prisma.payment.aggregate({
            _sum: { amount: true },
            _count: { id: true },
            where: { status: PAYMENT_STATUSES.COMPLETED }
          }),
          prisma.invoice.findMany({
            select: {
              id: true,
              invoiceNumber: true,
              status: true,
              totalAmount: true,
              paidAmount: true,
              outstandingAmount: true,
              dueDate: true
            }
          }),
          prisma.subscription.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { customer: { select: { firstName: true, lastName: true, companyName: true } } }
          }),
          prisma.invoice.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { customer: { select: { firstName: true, lastName: true, companyName: true } } }
          }),
          prisma.payment.findMany({
            take: 5,
            orderBy: { paymentDate: 'desc' },
            include: { customer: { select: { firstName: true, lastName: true, companyName: true } } }
          }),
          prisma.user.findMany({
            where: { role: ROLES.CUSTOMER },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, firstName: true, lastName: true, companyName: true, email: true, createdAt: true }
          })
        ]);

        const totalRevenue = roundCurrency(parseFloat(paymentsAgg._sum.amount || 0));

        let paidInvoices = 0;
        let unpaidInvoices = 0;
        let partiallyPaidInvoices = 0;
        let overdueInvoices = 0;
        let totalOutstanding = 0;

        invoices.forEach(inv => {
          if (inv.status === INVOICE_STATUSES.CANCELLED) return;

          const total = parseFloat(inv.totalAmount || 0);
          const paid = parseFloat(inv.paidAmount || 0);
          const outstanding = inv.outstandingAmount !== undefined ? parseFloat(inv.outstandingAmount) : Math.max(0, total - paid);

          if (inv.status === INVOICE_STATUSES.PAID || outstanding <= 0) {
            paidInvoices++;
          } else if (new Date(inv.dueDate) < now) {
            overdueInvoices++;
            totalOutstanding += outstanding;
          } else if (paid > 0) {
            partiallyPaidInvoices++;
            totalOutstanding += outstanding;
          } else {
            unpaidInvoices++;
            totalOutstanding += outstanding;
          }
        });

        // Subscription distribution
        const subCounts = {
          ACTIVE: 0,
          PAUSED: 0,
          CLOSED: 0,
          DRAFT: 0,
          QUOTATION: 0,
          CONFIRMED: 0
        };
        let renewalDueCount = 0;
        const renewalThreshold = new Date(now.getTime() + 7 * 86400000);

        allSubscriptions.forEach(s => {
          if (subCounts[s.status] !== undefined) subCounts[s.status]++;
          if ((s.status === SUBSCRIPTION_STATUSES.ACTIVE || s.autoRenew) && s.nextBillingDate && new Date(s.nextBillingDate) <= renewalThreshold) {
            renewalDueCount++;
          }
        });

        const totalSubs = allSubscriptions.length;
        const subscriptionDistribution = Object.keys(subCounts).map(status => ({
          status,
          count: subCounts[status],
          percentage: totalSubs > 0 ? roundCurrency((subCounts[status] / totalSubs) * 100) : 0
        }));

        const invoiceDistribution = [
          { status: 'PAID', count: paidInvoices },
          { status: 'UNPAID', count: unpaidInvoices },
          { status: 'PARTIALLY_PAID', count: partiallyPaidInvoices },
          { status: 'OVERDUE', count: overdueInvoices }
        ];

        // Combine activities
        const recentActivities = this.formatRecentActivities({
          subscriptions: recentSubs,
          invoices: recentInvs,
          payments: recentPays,
          customers: recentUsers
        });

        return {
          totalCustomers,
          totalProducts,
          activeSubscriptions,
          totalRevenue,
          totalInvoices: invoices.filter(i => i.status !== INVOICE_STATUSES.CANCELLED).length,
          paidInvoices,
          unpaidInvoices,
          partiallyPaidInvoices,
          overdueInvoices,
          totalOutstandingAmount: roundCurrency(totalOutstanding),
          subscriptionsDueForRenewal: renewalDueCount,
          currency: this.currency.code,
          currencySymbol: this.currency.symbol,
          subscriptionDistribution,
          invoiceDistribution,
          recentActivities
        };
      } catch (err) {
        logger.warn('Prisma getDashboardSummary failed, falling back to inMemoryStore:', err.message);
      }
    }

    // Fallback using inMemoryStore
    return this.getDashboardSummaryFromMemory();
  }

  getDashboardSummaryFromMemory() {
    const now = new Date();

    const customers = Array.from(inMemoryStore.users.values()).filter(u => u.role === ROLES.CUSTOMER);
    const products = Array.from(inMemoryStore.products.values()).filter(p => p.isActive);
    const subscriptions = Array.from(inMemoryStore.subscriptions.values());
    const invoices = Array.from(inMemoryStore.invoices.values());
    const payments = Array.from(inMemoryStore.payments.values()).filter(p => p.status === PAYMENT_STATUSES.COMPLETED);

    // Total revenue from successful recorded payments
    const totalRevenue = roundCurrency(
      payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
    );

    let paidInvoices = 0;
    let unpaidInvoices = 0;
    let partiallyPaidInvoices = 0;
    let overdueInvoices = 0;
    let totalOutstanding = 0;

    invoices.forEach(inv => {
      if (inv.status === INVOICE_STATUSES.CANCELLED) return;

      const total = parseFloat(inv.totalAmount || 0);
      const paid = parseFloat(inv.paidAmount || 0);
      const outstanding = inv.outstandingAmount !== undefined ? parseFloat(inv.outstandingAmount) : Math.max(0, total - paid);

      if (inv.status === INVOICE_STATUSES.PAID || outstanding <= 0) {
        paidInvoices++;
      } else if (new Date(inv.dueDate) < now || inv.status === INVOICE_STATUSES.OVERDUE) {
        overdueInvoices++;
        totalOutstanding += outstanding;
      } else if (paid > 0 || inv.status === INVOICE_STATUSES.PARTIALLY_PAID) {
        partiallyPaidInvoices++;
        totalOutstanding += outstanding;
      } else {
        unpaidInvoices++;
        totalOutstanding += outstanding;
      }
    });

    const subCounts = {
      ACTIVE: 0,
      PAUSED: 0,
      CLOSED: 0,
      DRAFT: 0,
      QUOTATION: 0,
      CONFIRMED: 0
    };
    let renewalDueCount = 0;
    const renewalThreshold = new Date(now.getTime() + 7 * 86400000);

    subscriptions.forEach(s => {
      if (subCounts[s.status] !== undefined) subCounts[s.status]++;
      if ((s.status === SUBSCRIPTION_STATUSES.ACTIVE || s.autoRenew) && s.nextBillingDate && new Date(s.nextBillingDate) <= renewalThreshold) {
        renewalDueCount++;
      }
    });

    const totalSubs = subscriptions.length;
    const subscriptionDistribution = Object.keys(subCounts).map(status => ({
      status,
      count: subCounts[status],
      percentage: totalSubs > 0 ? roundCurrency((subCounts[status] / totalSubs) * 100) : 0
    }));

    const invoiceDistribution = [
      { status: 'PAID', count: paidInvoices },
      { status: 'UNPAID', count: unpaidInvoices },
      { status: 'PARTIALLY_PAID', count: partiallyPaidInvoices },
      { status: 'OVERDUE', count: overdueInvoices }
    ];

    const recentActivities = this.formatRecentActivities({
      subscriptions: subscriptions.slice(-5).reverse(),
      invoices: invoices.slice(-5).reverse(),
      payments: payments.slice(-5).reverse(),
      customers: customers.slice(-5).reverse()
    });

    return {
      totalCustomers: customers.length,
      totalProducts: products.length,
      activeSubscriptions: subCounts.ACTIVE || 0,
      totalRevenue,
      totalInvoices: invoices.filter(i => i.status !== INVOICE_STATUSES.CANCELLED).length,
      paidInvoices,
      unpaidInvoices,
      partiallyPaidInvoices,
      overdueInvoices,
      totalOutstandingAmount: roundCurrency(totalOutstanding),
      subscriptionsDueForRenewal: renewalDueCount,
      currency: this.currency.code,
      currencySymbol: this.currency.symbol,
      subscriptionDistribution,
      invoiceDistribution,
      recentActivities
    };
  }

  formatRecentActivities({ subscriptions = [], invoices = [], payments = [], customers = [] }) {
    const list = [];

    payments.forEach(p => {
      const cust = p.customer || (p.customerId ? inMemoryStore.users.get(p.customerId) : null);
      const custName = cust ? (cust.companyName || `${cust.firstName} ${cust.lastName}`) : 'Customer';
      list.push({
        id: `act-pay-${p.id}`,
        type: 'PAYMENT',
        title: 'Payment Received',
        description: `Payment of ${this.currency.symbol}${p.amount} recorded for ${custName}`,
        date: p.paymentDate || p.createdAt,
        status: p.status || 'COMPLETED',
        badgeColor: 'green'
      });
    });

    invoices.forEach(i => {
      const cust = i.customer || (i.customerId ? inMemoryStore.users.get(i.customerId) : null);
      const custName = cust ? (cust.companyName || `${cust.firstName} ${cust.lastName}`) : 'Customer';
      list.push({
        id: `act-inv-${i.id}`,
        type: 'INVOICE',
        title: 'Invoice Issued',
        description: `Invoice ${i.invoiceNumber || 'INV'} generated for ${custName} (${this.currency.symbol}${i.totalAmount})`,
        date: i.issuedDate || i.createdAt,
        status: i.status || 'ISSUED',
        badgeColor: i.status === 'PAID' ? 'green' : i.status === 'OVERDUE' ? 'red' : 'blue'
      });
    });

    subscriptions.forEach(s => {
      const cust = s.customer || (s.customerId ? inMemoryStore.users.get(s.customerId) : null);
      const custName = cust ? (cust.companyName || `${cust.firstName} ${cust.lastName}`) : 'Customer';
      list.push({
        id: `act-sub-${s.id}`,
        type: 'SUBSCRIPTION',
        title: 'Subscription Created',
        description: `Subscription ${s.subscriptionNumber || 'SUB'} for ${custName}`,
        date: s.createdAt || s.startDate,
        status: s.status || 'ACTIVE',
        badgeColor: s.status === 'ACTIVE' ? 'emerald' : 'orange'
      });
    });

    customers.forEach(c => {
      const name = c.companyName || `${c.firstName} ${c.lastName}`;
      list.push({
        id: `act-cust-${c.id}`,
        type: 'CUSTOMER',
        title: 'New Customer Registered',
        description: `${name} joined Brightloop platform`,
        date: c.createdAt,
        status: 'ACTIVE',
        badgeColor: 'purple'
      });
    });

    return list
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }

  // ===========================================================================
  // 2. REVENUE ANALYTICS
  // ===========================================================================

  async getRevenueAnalytics(filter = {}) {
    const { startDate, endDate } = this.resolveDateRange(filter);

    let payments = [];
    if (getIsDbConnected() && prisma) {
      try {
        payments = await prisma.payment.findMany({
          where: {
            status: PAYMENT_STATUSES.COMPLETED,
            paymentDate: { gte: startDate, lte: endDate }
          },
          orderBy: { paymentDate: 'asc' },
          include: { customer: { select: { firstName: true, lastName: true, companyName: true, email: true } } }
        });
      } catch (err) {
        logger.warn('Prisma getRevenueAnalytics failed, falling back:', err.message);
      }
    }

    if (!payments.length) {
      payments = Array.from(inMemoryStore.payments.values())
        .filter(p => {
          if (p.status !== PAYMENT_STATUSES.COMPLETED) return false;
          const pDate = new Date(p.paymentDate || p.createdAt);
          return pDate >= startDate && pDate <= endDate;
        })
        .map(p => ({
          ...p,
          customer: inMemoryStore.users.get(p.customerId)
        }))
        .sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));
    }

    // Revenue calculations
    const totalRevenue = roundCurrency(
      payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
    );
    const paymentCount = payments.length;
    const averagePayment = paymentCount > 0 ? roundCurrency(totalRevenue / paymentCount) : 0;

    // Monthly aggregation
    const monthlyMap = new Map();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    payments.forEach(p => {
      const d = new Date(p.paymentDate || p.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      const existing = monthlyMap.get(key) || { month: key, revenue: 0, count: 0, year: d.getFullYear(), monthIndex: d.getMonth() };
      existing.revenue = roundCurrency(existing.revenue + parseFloat(p.amount || 0));
      existing.count++;
      monthlyMap.set(key, existing);
    });

    const monthlyRevenue = Array.from(monthlyMap.values());

    // Daily / Time Series Trends
    const trendsMap = new Map();
    payments.forEach(p => {
      const d = new Date(p.paymentDate || p.createdAt);
      const dateKey = d.toISOString().split('T')[0];
      const existing = trendsMap.get(dateKey) || { date: dateKey, revenue: 0, count: 0 };
      existing.revenue = roundCurrency(existing.revenue + parseFloat(p.amount || 0));
      existing.count++;
      trendsMap.set(dateKey, existing);
    });

    const revenueTrends = Array.from(trendsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return {
      summary: {
        totalRevenue,
        paymentCount,
        averagePayment,
        period: filter.period || 'custom',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        currency: this.currency.code,
        currencySymbol: this.currency.symbol
      },
      monthlyRevenue,
      revenueTrends
    };
  }

  // ===========================================================================
  // 3. SUBSCRIPTION ANALYTICS
  // ===========================================================================

  async getSubscriptionAnalytics() {
    const now = new Date();
    let subs = [];

    if (getIsDbConnected() && prisma) {
      try {
        subs = await prisma.subscription.findMany({
          include: {
            customer: { select: { id: true, firstName: true, lastName: true, companyName: true, email: true } },
            plan: { select: { id: true, name: true, billingInterval: true, price: true, product: { select: { name: true } } } }
          },
          orderBy: { createdAt: 'desc' }
        });
      } catch (err) {
        logger.warn('Prisma getSubscriptionAnalytics failed, falling back:', err.message);
      }
    }

    if (!subs.length) {
      subs = Array.from(inMemoryStore.subscriptions.values()).map(s => {
        const cust = inMemoryStore.users.get(s.customerId);
        const plan = inMemoryStore.plans.get(s.planId);
        const prod = plan ? inMemoryStore.products.get(plan.productId) : null;
        return {
          ...s,
          customer: cust,
          plan: plan ? { ...plan, product: prod } : null
        };
      });
    }

    const counts = {
      total: subs.length,
      active: 0,
      paused: 0,
      closed: 0,
      draft: 0,
      quotation: 0,
      confirmed: 0,
      dueForRenewal: 0
    };

    const renewalThreshold = new Date(now.getTime() + 7 * 86400000);

    subs.forEach(s => {
      const st = (s.status || '').toLowerCase();
      if (counts[st] !== undefined) counts[st]++;
      if ((s.status === SUBSCRIPTION_STATUSES.ACTIVE || s.autoRenew) && s.nextBillingDate && new Date(s.nextBillingDate) <= renewalThreshold) {
        counts.dueForRenewal++;
      }
    });

    const distribution = [
      { status: 'ACTIVE', count: counts.active, color: '#10b981' },
      { status: 'PAUSED', count: counts.paused, color: '#f59e0b' },
      { status: 'CLOSED', count: counts.closed, color: '#ef4444' },
      { status: 'DRAFT', count: counts.draft, color: '#6b7280' },
      { status: 'CONFIRMED', count: counts.confirmed, color: '#3b82f6' }
    ].map(item => ({
      ...item,
      percentage: counts.total > 0 ? roundCurrency((item.count / counts.total) * 100) : 0
    }));

    // Trends by creation month
    const trendsMap = new Map();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    subs.forEach(s => {
      const d = new Date(s.createdAt || s.startDate || now);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      trendsMap.set(key, (trendsMap.get(key) || 0) + 1);
    });

    const trends = Array.from(trendsMap.entries()).map(([month, count]) => ({ month, count }));

    // Formatted table list
    const tableData = subs.map(s => ({
      id: s.id,
      subscriptionNumber: s.subscriptionNumber || 'N/A',
      customerName: s.customer ? (s.customer.companyName || `${s.customer.firstName} ${s.customer.lastName}`) : 'Unknown Customer',
      customerEmail: s.customer ? s.customer.email : 'N/A',
      productName: s.plan?.product?.name || 'Brightloop Software',
      planName: s.plan?.name || 'Standard Plan',
      billingInterval: s.plan?.billingInterval || 'MONTHLY',
      startDate: s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : 'N/A',
      nextBillingDate: s.nextBillingDate ? new Date(s.nextBillingDate).toISOString().split('T')[0] : 'N/A',
      totalAmount: s.totalAmount || s.plan?.price || 0,
      status: s.status
    }));

    return {
      counts,
      distribution,
      trends,
      tableData
    };
  }

  // ===========================================================================
  // 4. INVOICE AND PAYMENT ANALYTICS
  // ===========================================================================

  async getInvoiceAnalytics() {
    const now = new Date();
    let invoices = [];

    if (getIsDbConnected() && prisma) {
      try {
        invoices = await prisma.invoice.findMany({
          include: { customer: { select: { firstName: true, lastName: true, companyName: true, email: true } } },
          orderBy: { issuedDate: 'desc' }
        });
      } catch (err) {
        logger.warn('Prisma getInvoiceAnalytics failed, falling back:', err.message);
      }
    }

    if (!invoices.length) {
      invoices = Array.from(inMemoryStore.invoices.values()).map(inv => ({
        ...inv,
        customer: inMemoryStore.users.get(inv.customerId)
      }));
    }

    let totalInvoiceAmount = 0;
    let totalPaidAmount = 0;
    let totalUnpaidAmount = 0;
    let totalPartiallyPaidAmount = 0;
    let totalOverdueAmount = 0;

    const statusCounts = {
      PAID: 0,
      UNPAID: 0,
      PARTIALLY_PAID: 0,
      OVERDUE: 0,
      CONFIRMED: 0,
      DRAFT: 0,
      CANCELLED: 0
    };

    const outstandingInvoices = [];

    invoices.forEach(inv => {
      if (inv.status === INVOICE_STATUSES.CANCELLED) {
        statusCounts.CANCELLED++;
        return;
      }

      const total = parseFloat(inv.totalAmount || 0);
      const paid = parseFloat(inv.paidAmount || 0);
      const balance = inv.outstandingAmount !== undefined ? parseFloat(inv.outstandingAmount) : Math.max(0, total - paid);
      const isPastDue = new Date(inv.dueDate) < now;

      totalInvoiceAmount += total;
      totalPaidAmount += paid;

      if (inv.status === INVOICE_STATUSES.PAID || balance <= 0) {
        statusCounts.PAID++;
      } else if (isPastDue || inv.status === INVOICE_STATUSES.OVERDUE) {
        statusCounts.OVERDUE++;
        totalOverdueAmount += balance;
        totalUnpaidAmount += balance;
      } else if (paid > 0 || inv.status === INVOICE_STATUSES.PARTIALLY_PAID) {
        statusCounts.PARTIALLY_PAID++;
        totalPartiallyPaidAmount += balance;
        totalUnpaidAmount += balance;
      } else {
        statusCounts.UNPAID++;
        totalUnpaidAmount += balance;
      }

      if (balance > 0) {
        const cust = inv.customer;
        outstandingInvoices.push({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerName: cust ? (cust.companyName || `${cust.firstName} ${cust.lastName}`) : 'Customer',
          customerEmail: cust ? cust.email : 'N/A',
          invoiceDate: inv.issuedDate ? new Date(inv.issuedDate).toISOString().split('T')[0] : 'N/A',
          dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : 'N/A',
          totalAmount: roundCurrency(total),
          amountPaid: roundCurrency(paid),
          outstandingBalance: roundCurrency(balance),
          status: inv.status,
          isOverdue: isPastDue
        });
      }
    });

    const statusDistribution = [
      { status: 'PAID', count: statusCounts.PAID, color: '#10b981' },
      { status: 'UNPAID', count: statusCounts.UNPAID, color: '#3b82f6' },
      { status: 'PARTIALLY_PAID', count: statusCounts.PARTIALLY_PAID, color: '#f59e0b' },
      { status: 'OVERDUE', count: statusCounts.OVERDUE, color: '#ef4444' }
    ];

    return {
      statistics: {
        totalInvoiceAmount: roundCurrency(totalInvoiceAmount),
        totalPaidAmount: roundCurrency(totalPaidAmount),
        totalUnpaidAmount: roundCurrency(totalUnpaidAmount),
        totalOutstandingAmount: roundCurrency(totalUnpaidAmount),
        totalPartiallyPaidAmount: roundCurrency(totalPartiallyPaidAmount),
        totalOverdueAmount: roundCurrency(totalOverdueAmount),
        totalCount: invoices.filter(i => i.status !== INVOICE_STATUSES.CANCELLED).length,
        currency: this.currency.code,
        currencySymbol: this.currency.symbol
      },
      statusDistribution,
      outstandingInvoices: outstandingInvoices.sort((a, b) => (b.isOverdue ? 1 : 0) - (a.isOverdue ? 1 : 0))
    };
  }

  async getPaymentAnalytics() {
    let payments = [];

    if (getIsDbConnected() && prisma) {
      try {
        payments = await prisma.payment.findMany({
          include: {
            customer: { select: { firstName: true, lastName: true, companyName: true, email: true } },
            invoice: { select: { invoiceNumber: true, totalAmount: true } }
          },
          orderBy: { paymentDate: 'desc' }
        });
      } catch (err) {
        logger.warn('Prisma getPaymentAnalytics failed, falling back:', err.message);
      }
    }

    if (!payments.length) {
      payments = Array.from(inMemoryStore.payments.values()).map(p => ({
        ...p,
        customer: inMemoryStore.users.get(p.customerId),
        invoice: inMemoryStore.invoices.get(p.invoiceId)
      }));
    }

    const totalSuccessful = payments.filter(p => p.status === PAYMENT_STATUSES.COMPLETED);
    const totalRevenue = roundCurrency(
      totalSuccessful.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
    );

    // Group by normalized method: UPI, Cash, Bank Transfer, Card, Other
    const methodMap = {
      UPI: { method: 'UPI', count: 0, amount: 0, color: '#8b5cf6' },
      CARD: { method: 'Card', count: 0, amount: 0, color: '#3b82f6' },
      BANK_TRANSFER: { method: 'Bank Transfer', count: 0, amount: 0, color: '#10b981' },
      CASH: { method: 'Cash', count: 0, amount: 0, color: '#f59e0b' },
      OTHER: { method: 'Other', count: 0, amount: 0, color: '#6b7280' }
    };

    totalSuccessful.forEach(p => {
      const rawMethod = (p.paymentMethod || '').toUpperCase();
      let key = 'OTHER';

      if (rawMethod.includes('UPI')) key = 'UPI';
      else if (rawMethod.includes('CARD') || rawMethod.includes('STRIPE')) key = 'CARD';
      else if (rawMethod.includes('BANK')) key = 'BANK_TRANSFER';
      else if (rawMethod.includes('CASH')) key = 'CASH';

      methodMap[key].count++;
      methodMap[key].amount = roundCurrency(methodMap[key].amount + parseFloat(p.amount || 0));
    });

    const paymentMethods = Object.values(methodMap).map(m => ({
      ...m,
      percentage: totalRevenue > 0 ? roundCurrency((m.amount / totalRevenue) * 100) : 0
    }));

    const recentPayments = payments.slice(0, 15).map(p => {
      const cust = p.customer;
      return {
        id: p.id,
        paymentNumber: p.paymentNumber,
        customerName: cust ? (cust.companyName || `${cust.firstName} ${cust.lastName}`) : 'Customer',
        customerEmail: cust ? cust.email : 'N/A',
        invoiceNumber: p.invoice?.invoiceNumber || 'INV',
        amount: roundCurrency(parseFloat(p.amount || 0)),
        paymentMethod: p.paymentMethod,
        status: p.status,
        paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : 'N/A',
        referenceNote: p.referenceNote
      };
    });

    return {
      statistics: {
        totalSuccessfulPayments: totalSuccessful.length,
        totalTransactions: payments.length,
        totalCollectedAmount: totalRevenue,
        currency: this.currency.code,
        currencySymbol: this.currency.symbol
      },
      paymentMethods,
      recentPayments
    };
  }

  // ===========================================================================
  // 5. CUSTOMER ANALYTICS
  // ===========================================================================

  async getCustomerAnalytics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    let customers = [];
    let subscriptions = [];
    let payments = [];

    if (getIsDbConnected() && prisma) {
      try {
        [customers, subscriptions, payments] = await Promise.all([
          prisma.user.findMany({
            where: { role: ROLES.CUSTOMER },
            select: { id: true, email: true, firstName: true, lastName: true, companyName: true, phone: true, createdAt: true }
          }),
          prisma.subscription.findMany({
            select: { id: true, customerId: true, status: true, totalAmount: true }
          }),
          prisma.payment.findMany({
            where: { status: PAYMENT_STATUSES.COMPLETED },
            select: { id: true, customerId: true, amount: true }
          })
        ]);
      } catch (err) {
        logger.warn('Prisma getCustomerAnalytics failed, falling back:', err.message);
      }
    }

    if (!customers.length) {
      customers = Array.from(inMemoryStore.users.values()).filter(u => u.role === ROLES.CUSTOMER);
      subscriptions = Array.from(inMemoryStore.subscriptions.values());
      payments = Array.from(inMemoryStore.payments.values()).filter(p => p.status === PAYMENT_STATUSES.COMPLETED);
    }

    const newCustomersCount = customers.filter(c => new Date(c.createdAt) >= thirtyDaysAgo).length;

    // Subscriptions per customer
    const subsByCustomer = new Map();
    subscriptions.forEach(s => {
      const list = subsByCustomer.get(s.customerId) || [];
      list.push(s);
      subsByCustomer.set(s.customerId, list);
    });

    // Payments per customer
    const paymentsByCustomer = new Map();
    payments.forEach(p => {
      const existing = paymentsByCustomer.get(p.customerId) || 0;
      paymentsByCustomer.set(p.customerId, existing + parseFloat(p.amount || 0));
    });

    let withActiveSubs = 0;
    let withPausedSubs = 0;

    const customerRows = customers.map(c => {
      const userSubs = subsByCustomer.get(c.id) || [];
      const hasActive = userSubs.some(s => s.status === SUBSCRIPTION_STATUSES.ACTIVE);
      const hasPaused = userSubs.some(s => s.status === SUBSCRIPTION_STATUSES.PAUSED);

      if (hasActive) withActiveSubs++;
      if (hasPaused) withPausedSubs++;

      const totalPaid = roundCurrency(paymentsByCustomer.get(c.id) || 0);

      return {
        id: c.id,
        customerName: c.companyName || `${c.firstName} ${c.lastName}`,
        email: c.email,
        phone: c.phone || 'N/A',
        totalSubscriptions: userSubs.length,
        activeSubscriptions: userSubs.filter(s => s.status === SUBSCRIPTION_STATUSES.ACTIVE).length,
        totalAmountPaid: totalPaid,
        joinDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : 'N/A'
      };
    });

    // Top Customers ranked by actual payments received
    const topCustomers = [...customerRows]
      .sort((a, b) => b.totalAmountPaid - a.totalAmountPaid)
      .slice(0, 10);

    // Customer growth trends (monthly registration)
    const growthMap = new Map();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    customers.forEach(c => {
      const d = new Date(c.createdAt || now);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      growthMap.set(key, (growthMap.get(key) || 0) + 1);
    });

    const customerGrowth = Array.from(growthMap.entries()).map(([month, newRegistrations]) => ({
      month,
      newRegistrations
    }));

    return {
      overview: {
        totalCustomers: customers.length,
        newCustomers: newCustomersCount,
        customersWithActiveSubscriptions: withActiveSubs,
        customersWithPausedSubscriptions: withPausedSubs
      },
      customerGrowth,
      topCustomers,
      customerTable: customerRows
    };
  }
}

const analyticsService = new AnalyticsService();
module.exports = analyticsService;
