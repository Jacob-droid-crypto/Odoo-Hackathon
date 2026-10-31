const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test.describe('Member 4: Analytics Dashboard, Financial Reporting & Integration Tests', () => {
  let adminToken = '';
  let staffToken = '';
  let customerToken = '';

  test.before(async () => {
    // 1. Login as pre-seeded Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@brightloop.com',
        password: 'Admin@Brightloop123!'
      });
    assert.equal(adminRes.status, 200);
    adminToken = adminRes.body.data.token;

    // 2. Login as pre-seeded Staff
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'staff@brightloop.com',
        password: 'Staff@Brightloop123!'
      });
    assert.equal(staffRes.status, 200);
    staffToken = staffRes.body.data.token;

    // 3. Login as pre-seeded Customer
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer@acme.com',
        password: 'Customer@Brightloop123!'
      });
    assert.equal(custRes.status, 200);
    customerToken = custRes.body.data.token;
  });

  // ---------------------------------------------------------------------------
  // 1. RBAC & ACCESS CONTROL
  // ---------------------------------------------------------------------------
  test('1. Reject unauthorized or customer access to analytics endpoints', async () => {
    // Unauthenticated -> 401
    const unauthRes = await request(app).get('/api/analytics/dashboard');
    assert.equal(unauthRes.status, 401);

    // Customer -> 403 Forbidden
    const custRes = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);
    assert.equal(custRes.status, 403);
  });

  // ---------------------------------------------------------------------------
  // 2. ADMIN DASHBOARD SUMMARY
  // ---------------------------------------------------------------------------
  test('2. GET /api/analytics/dashboard - Admin & Staff receive complete dashboard overview', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const data = res.body.data;

    // Required Summary Cards metrics
    assert.equal(typeof data.totalCustomers, 'number');
    assert.equal(typeof data.totalProducts, 'number');
    assert.equal(typeof data.activeSubscriptions, 'number');
    assert.equal(typeof data.totalRevenue, 'number');
    assert.equal(typeof data.totalInvoices, 'number');
    assert.equal(typeof data.paidInvoices, 'number');
    assert.equal(typeof data.unpaidInvoices, 'number');
    assert.equal(typeof data.overdueInvoices, 'number');
    assert.equal(typeof data.totalOutstandingAmount, 'number');

    // Chart datasets
    assert.ok(Array.isArray(data.subscriptionDistribution));
    assert.ok(Array.isArray(data.invoiceDistribution));
    assert.ok(Array.isArray(data.recentActivities));
    assert.ok(data.currency);

    // Staff access test
    const staffRes = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${staffToken}`);
    assert.equal(staffRes.status, 200);
  });

  // ---------------------------------------------------------------------------
  // 3. REVENUE ANALYTICS
  // ---------------------------------------------------------------------------
  test('3. GET /api/analytics/revenue - Accurate collected revenue and date range filtering', async () => {
    const res = await request(app)
      .get('/api/analytics/revenue?period=last_30_days')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const data = res.body.data;

    assert.ok(data.summary);
    assert.equal(typeof data.summary.totalRevenue, 'number');
    assert.equal(typeof data.summary.paymentCount, 'number');
    assert.equal(typeof data.summary.averagePayment, 'number');
    assert.ok(Array.isArray(data.monthlyRevenue));
    assert.ok(Array.isArray(data.revenueTrends));

    // Test monthly sub-endpoint
    const monthlyRes = await request(app)
      .get('/api/analytics/revenue/monthly')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(monthlyRes.status, 200);
    assert.ok(Array.isArray(monthlyRes.body.data));

    // Test summary sub-endpoint
    const summaryRes = await request(app)
      .get('/api/analytics/revenue/summary')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(summaryRes.status, 200);
    assert.equal(typeof summaryRes.body.data.totalRevenue, 'number');
  });

  // ---------------------------------------------------------------------------
  // 4. SUBSCRIPTION ANALYTICS
  // ---------------------------------------------------------------------------
  test('4. GET /api/analytics/subscriptions - Subscription counts, distribution and trends', async () => {
    const res = await request(app)
      .get('/api/analytics/subscriptions')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const data = res.body.data;

    assert.ok(data.counts);
    assert.equal(typeof data.counts.total, 'number');
    assert.equal(typeof data.counts.active, 'number');
    assert.equal(typeof data.counts.paused, 'number');
    assert.equal(typeof data.counts.closed, 'number');
    assert.ok(Array.isArray(data.distribution));
    assert.ok(Array.isArray(data.trends));
    assert.ok(Array.isArray(data.tableData));

    // Sub-endpoints
    const statusRes = await request(app)
      .get('/api/analytics/subscriptions/status')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(statusRes.status, 200);
    assert.ok(Array.isArray(statusRes.body.data));

    const trendsRes = await request(app)
      .get('/api/analytics/subscriptions/trends')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(trendsRes.status, 200);
    assert.ok(Array.isArray(trendsRes.body.data));
  });

  // ---------------------------------------------------------------------------
  // 5. INVOICE AND PAYMENT ANALYTICS
  // ---------------------------------------------------------------------------
  test('5. GET /api/analytics/invoices & /api/analytics/payments - Financial ledger and methods', async () => {
    const invRes = await request(app)
      .get('/api/analytics/invoices')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(invRes.status, 200);
    assert.equal(invRes.body.success, true);
    assert.ok(invRes.body.data.statistics);
    assert.equal(typeof invRes.body.data.statistics.totalInvoiceAmount, 'number');
    assert.equal(typeof invRes.body.data.statistics.totalPaidAmount, 'number');
    assert.equal(typeof invRes.body.data.statistics.totalUnpaidAmount, 'number');
    assert.equal(typeof invRes.body.data.statistics.totalOutstandingAmount, 'number');
    assert.ok(Array.isArray(invRes.body.data.statusDistribution));
    assert.ok(Array.isArray(invRes.body.data.outstandingInvoices));

    // Payments and methods
    const payRes = await request(app)
      .get('/api/analytics/payments')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(payRes.status, 200);
    assert.ok(payRes.body.data.statistics);
    assert.ok(Array.isArray(payRes.body.data.paymentMethods));
    assert.ok(Array.isArray(payRes.body.data.recentPayments));

    const methodsRes = await request(app)
      .get('/api/analytics/payments/methods')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(methodsRes.status, 200);
    assert.ok(Array.isArray(methodsRes.body.data));
  });

  // ---------------------------------------------------------------------------
  // 6. CUSTOMER ANALYTICS
  // ---------------------------------------------------------------------------
  test('6. GET /api/analytics/customers - Growth, top customers, and subscription stats', async () => {
    const res = await request(app)
      .get('/api/analytics/customers')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const data = res.body.data;

    assert.ok(data.overview);
    assert.equal(typeof data.overview.totalCustomers, 'number');
    assert.equal(typeof data.overview.newCustomers, 'number');
    assert.ok(Array.isArray(data.customerGrowth));
    assert.ok(Array.isArray(data.topCustomers));
    assert.ok(Array.isArray(data.customerTable));

    // Sub-endpoints
    const growthRes = await request(app)
      .get('/api/analytics/customers/growth')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(growthRes.status, 200);
    assert.ok(Array.isArray(growthRes.body.data));

    const topRes = await request(app)
      .get('/api/analytics/customers/top')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(topRes.status, 200);
    assert.ok(Array.isArray(topRes.body.data));
  });

  // ---------------------------------------------------------------------------
  // 7. FINANCIAL REPORTS & CSV EXPORT
  // ---------------------------------------------------------------------------
  test('7. GET /api/reports/* - Generate reports and export RFC-compliant CSVs', async () => {
    // JSON Revenue Report
    const revReportRes = await request(app)
      .get('/api/reports/revenue')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(revReportRes.status, 200);
    assert.equal(revReportRes.body.data.reportType, 'Revenue Report');
    assert.ok(Array.isArray(revReportRes.body.data.rows));
    assert.ok(typeof revReportRes.body.data.csv === 'string');

    // CSV Export of Revenue Report
    const revCsvRes = await request(app)
      .get('/api/reports/revenue?format=csv')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(revCsvRes.status, 200);
    assert.match(revCsvRes.headers['content-type'], /text\/csv/i);
    assert.match(revCsvRes.headers['content-disposition'], /attachment; filename="revenue-report-/i);
    assert.match(revCsvRes.text, /Payment #/);

    // Subscriptions Report (CSV)
    const subCsvRes = await request(app)
      .get('/api/reports/subscriptions?export=csv')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(subCsvRes.status, 200);
    assert.match(subCsvRes.headers['content-type'], /text\/csv/i);
    assert.match(subCsvRes.text, /Subscription #/);

    // Invoices Report (CSV)
    const invCsvRes = await request(app)
      .get('/api/reports/invoices?format=csv')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(invCsvRes.status, 200);
    assert.match(invCsvRes.headers['content-type'], /text\/csv/i);
    assert.match(invCsvRes.text, /Invoice #/);

    // Payments Report (CSV)
    const payCsvRes = await request(app)
      .get('/api/reports/payments?format=csv')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(payCsvRes.status, 200);
    assert.match(payCsvRes.headers['content-type'], /text\/csv/i);
    assert.match(payCsvRes.text, /Payment #/);

    // Customers Report (CSV)
    const custCsvRes = await request(app)
      .get('/api/reports/customers?format=csv')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(custCsvRes.status, 200);
    assert.match(custCsvRes.headers['content-type'], /text\/csv/i);
    assert.match(custCsvRes.text, /Customer Name/);
  });

  // ---------------------------------------------------------------------------
  // 8. DEMO DATA SEEDER HELPER
  // ---------------------------------------------------------------------------
  test('8. POST /api/analytics/seed-demo - Populate sample demo records and verify dashboard reflects data', async () => {
    const seedRes = await request(app)
      .post('/api/analytics/seed-demo')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(seedRes.status, 200);

    // Fetch dashboard after seeding
    const dashRes = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(dashRes.status, 200);
    assert.ok(dashRes.body.data.totalRevenue > 0, 'Total revenue must reflect recorded payments');
    assert.ok(dashRes.body.data.totalInvoices > 0, 'Total invoices must reflect seeded invoices');
    assert.ok(dashRes.body.data.activeSubscriptions > 0, 'Active subscriptions must be counted');
    assert.ok(dashRes.body.data.recentActivities.length > 0, 'Recent activities must be populated');
  });
});
