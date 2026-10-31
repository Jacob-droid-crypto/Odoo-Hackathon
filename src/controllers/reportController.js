const reportService = require('../services/reportService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Controller for Reports and CSV Exports
 */
class ReportController {
  handleExport(res, report, filename) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(report.csv);
  }

  /**
   * Revenue Report (JSON or CSV)
   * GET /api/reports/revenue
   */
  async getRevenueReport(req, res) {
    try {
      const report = await reportService.getRevenueReport(req.query);
      if (req.query.format === 'csv' || req.query.export === 'csv') {
        const dateStr = new Date().toISOString().split('T')[0];
        return this.handleExport(res, report, `revenue-report-${dateStr}.csv`);
      }
      return sendSuccess(res, 'Revenue report retrieved successfully', report);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Subscription Report (JSON or CSV)
   * GET /api/reports/subscriptions
   */
  async getSubscriptionReport(req, res) {
    try {
      const report = await reportService.getSubscriptionReport(req.query);
      if (req.query.format === 'csv' || req.query.export === 'csv') {
        const dateStr = new Date().toISOString().split('T')[0];
        return this.handleExport(res, report, `subscriptions-report-${dateStr}.csv`);
      }
      return sendSuccess(res, 'Subscription report retrieved successfully', report);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Invoice Report (JSON or CSV)
   * GET /api/reports/invoices
   */
  async getInvoiceReport(req, res) {
    try {
      const report = await reportService.getInvoiceReport(req.query);
      if (req.query.format === 'csv' || req.query.export === 'csv') {
        const dateStr = new Date().toISOString().split('T')[0];
        return this.handleExport(res, report, `invoices-report-${dateStr}.csv`);
      }
      return sendSuccess(res, 'Invoice report retrieved successfully', report);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Payment Report (JSON or CSV)
   * GET /api/reports/payments
   */
  async getPaymentReport(req, res) {
    try {
      const report = await reportService.getPaymentReport(req.query);
      if (req.query.format === 'csv' || req.query.export === 'csv') {
        const dateStr = new Date().toISOString().split('T')[0];
        return this.handleExport(res, report, `payments-report-${dateStr}.csv`);
      }
      return sendSuccess(res, 'Payment report retrieved successfully', report);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Customer Report (JSON or CSV)
   * GET /api/reports/customers
   */
  async getCustomerReport(req, res) {
    try {
      const report = await reportService.getCustomerReport(req.query);
      if (req.query.format === 'csv' || req.query.export === 'csv') {
        const dateStr = new Date().toISOString().split('T')[0];
        return this.handleExport(res, report, `customers-report-${dateStr}.csv`);
      }
      return sendSuccess(res, 'Customer report retrieved successfully', report);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}

const reportController = new ReportController();
module.exports = reportController;
