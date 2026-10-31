const { prisma, getIsDbConnected } = require('../config/db');
const inMemoryStore = require('./inMemoryStore');
const logger = require('../utils/logger');
const invoiceService = require('./invoiceService');
const { roundCurrency } = require('../utils/billingCalculator');
const { SUBSCRIPTION_STATUSES, INVOICE_STATUSES, PAYMENT_STATUSES } = require('../constants/roles');

class BillingEngineService {
  /**
   * Find all active subscriptions that are due for billing
   */
  async getDueSubscriptions() {
    const now = new Date();

    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.subscription.findMany({
          where: {
            status: SUBSCRIPTION_STATUSES.ACTIVE,
            nextBillingDate: {
              lte: now
            }
          },
          include: {
            customer: {
              select: { id: true, email: true, firstName: true, lastName: true, companyName: true }
            },
            plan: true
          },
          orderBy: { nextBillingDate: 'asc' }
        });
      } catch (err) {
        logger.warn('Prisma getDueSubscriptions failed, checking inMemoryStore:', err.message);
      }
    }

    return Array.from(inMemoryStore.subscriptions.values())
      .filter(sub => {
        if (sub.status !== SUBSCRIPTION_STATUSES.ACTIVE) return false;
        if (!sub.nextBillingDate) return false;
        return new Date(sub.nextBillingDate) <= now;
      })
      .map(sub => ({
        ...sub,
        customer: inMemoryStore.users.get(sub.customerId),
        plan: inMemoryStore.plans.get(sub.planId)
      }))
      .sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate));
  }

  /**
   * Run the recurring billing cycle
   * Generates invoices automatically for all due subscriptions
   */
  async runBillingCycle(options = {}) {
    logger.info('Starting recurring billing cycle run...');
    const dueSubscriptions = await this.getDueSubscriptions();

    const generatedInvoices = [];
    const skippedSubscriptions = [];
    const errors = [];

    for (const sub of dueSubscriptions) {
      try {
        const invoice = await invoiceService.generateInvoiceForSubscription(sub.id, options);
        generatedInvoices.push({
          subscriptionId: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          customerEmail: sub.customer ? sub.customer.email : 'N/A',
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: invoice.totalAmount,
          dueDate: invoice.dueDate
        });
      } catch (err) {
        if (err.statusCode === 409) {
          // Already invoiced for this period (duplicate prevention)
          skippedSubscriptions.push({
            subscriptionId: sub.id,
            subscriptionNumber: sub.subscriptionNumber,
            reason: err.message
          });
        } else {
          logger.error(`Error generating invoice for subscription ${sub.subscriptionNumber}:`, err.message);
          errors.push({
            subscriptionId: sub.id,
            subscriptionNumber: sub.subscriptionNumber,
            error: err.message
          });
        }
      }
    }

    const totalInvoiced = roundCurrency(
      generatedInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0)
    );

    const report = {
      runTimestamp: new Date().toISOString(),
      dueSubscriptionsFound: dueSubscriptions.length,
      invoicesGeneratedCount: generatedInvoices.length,
      skippedCount: skippedSubscriptions.length,
      errorCount: errors.length,
      totalInvoiced,
      generatedInvoices,
      skippedSubscriptions,
      errors
    };

    logger.info(`Billing cycle completed: ${generatedInvoices.length} invoices generated, ${skippedSubscriptions.length} skipped, ${errors.length} errors.`);
    return report;
  }

  /**
   * Comprehensive Analytics & Reporting Metrics for Member 4
   */
  async getBillingAnalytics() {
    const now = new Date();

    let allSubscriptions = [];
    let allInvoices = [];
    let allPayments = [];

    if (getIsDbConnected() && prisma) {
      try {
        const [subs, invs, pays] = await Promise.all([
          prisma.subscription.findMany(),
          prisma.invoice.findMany(),
          prisma.payment.findMany({ where: { status: PAYMENT_STATUSES.COMPLETED } })
        ]);
        allSubscriptions = subs;
        allInvoices = invs;
        allPayments = pays;
      } catch (err) {
        logger.warn('Prisma getBillingAnalytics failed, using inMemoryStore:', err.message);
      }
    }

    if (allSubscriptions.length === 0) {
      allSubscriptions = Array.from(inMemoryStore.subscriptions.values());
      allInvoices = Array.from(inMemoryStore.invoices.values());
      allPayments = Array.from(inMemoryStore.payments.values())
        .filter(p => p.status === PAYMENT_STATUSES.COMPLETED);
    }

    // 1. Total Revenue from recorded payments
    const totalRevenue = roundCurrency(
      allPayments.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0)
    );

    // 2. Total Invoiced Amount
    const totalInvoiced = roundCurrency(
      allInvoices
        .filter(inv => inv.status !== INVOICE_STATUSES.CANCELLED)
        .reduce((acc, inv) => acc + parseFloat(inv.totalAmount || 0), 0)
    );

    // 3. Outstanding Unpaid Amount
    const outstandingAmount = roundCurrency(
      allInvoices
        .filter(inv => inv.status !== INVOICE_STATUSES.PAID && inv.status !== INVOICE_STATUSES.CANCELLED)
        .reduce((acc, inv) => {
          const out = inv.outstandingAmount !== undefined ? parseFloat(inv.outstandingAmount) : (parseFloat(inv.totalAmount) - parseFloat(inv.paidAmount || 0));
          return acc + Math.max(0, out);
        }, 0)
    );

    // 4. Overdue Invoices
    const overdueInvoices = allInvoices.filter(inv => {
      const isUnpaid = inv.status !== INVOICE_STATUSES.PAID && inv.status !== INVOICE_STATUSES.CANCELLED;
      const isPastDue = new Date(inv.dueDate) < now;
      return isUnpaid && isPastDue;
    });

    // 5. Subscription Status breakdown
    const subscriptionsByStatus = {
      [SUBSCRIPTION_STATUSES.DRAFT]: 0,
      [SUBSCRIPTION_STATUSES.QUOTATION]: 0,
      [SUBSCRIPTION_STATUSES.CONFIRMED]: 0,
      [SUBSCRIPTION_STATUSES.ACTIVE]: 0,
      [SUBSCRIPTION_STATUSES.PAUSED]: 0,
      [SUBSCRIPTION_STATUSES.CLOSED]: 0
    };
    for (const sub of allSubscriptions) {
      if (subscriptionsByStatus[sub.status] !== undefined) {
        subscriptionsByStatus[sub.status]++;
      }
    }

    // 6. Invoice Status breakdown
    const invoicesByStatus = {
      [INVOICE_STATUSES.DRAFT]: 0,
      [INVOICE_STATUSES.UNPAID]: 0,
      [INVOICE_STATUSES.CONFIRMED]: 0,
      [INVOICE_STATUSES.PARTIALLY_PAID]: 0,
      [INVOICE_STATUSES.PAID]: 0,
      [INVOICE_STATUSES.OVERDUE]: 0,
      [INVOICE_STATUSES.CANCELLED]: 0
    };
    for (const inv of allInvoices) {
      if (invoicesByStatus[inv.status] !== undefined) {
        invoicesByStatus[inv.status]++;
      }
    }

    return {
      financialSummary: {
        totalRevenue,
        totalInvoiced,
        outstandingAmount,
        currency: 'INR (₹)'
      },
      counts: {
        totalSubscriptions: allSubscriptions.length,
        activeSubscriptions: subscriptionsByStatus[SUBSCRIPTION_STATUSES.ACTIVE] || 0,
        pausedSubscriptions: subscriptionsByStatus[SUBSCRIPTION_STATUSES.PAUSED] || 0,
        closedSubscriptions: subscriptionsByStatus[SUBSCRIPTION_STATUSES.CLOSED] || 0,
        totalInvoices: allInvoices.length,
        overdueInvoicesCount: overdueInvoices.length,
        totalPaymentsRecorded: allPayments.length
      },
      subscriptionsByStatus,
      invoicesByStatus,
      generatedAt: new Date().toISOString()
    };
  }
}

const billingEngineService = new BillingEngineService();
module.exports = billingEngineService;
