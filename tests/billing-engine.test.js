const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test.describe('Member 3: Subscription Management & Billing Engine Tests', () => {
  let adminToken = '';
  let customerToken = '';
  let customerId = '';
  let planMonthlyId = '';
  let subscriptionId = '';
  let invoiceId = '';
  const timestamp = Date.now();

  test.before(async () => {
    // Login as pre-seeded Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@brightloop.com',
        password: 'Admin@Brightloop123!'
      });
    assert.equal(adminRes.status, 200);
    adminToken = adminRes.body.data.token;

    // Register a dedicated customer for this test suite
    const custRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `billing_cust_${timestamp}@brightloop.test`,
        password: 'Customer@Brightloop123!',
        firstName: 'Billing',
        lastName: 'Tester',
        companyName: 'BrightCorp Enterprises'
      });
    assert.equal(custRes.status, 201);
    customerToken = custRes.body.data.token;
    customerId = custRes.body.data.user.id;

    // Get the Monthly Professional Plan seeded in system
    const plansRes = await request(app)
      .get('/api/plans?billingInterval=MONTHLY')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(plansRes.status, 200);
    assert.ok(plansRes.body.data.length > 0);
    planMonthlyId = plansRes.body.data[0].id;
  });

  // ---------------------------------------------------------------------------
  // 1. CREATE SUBSCRIPTION
  // ---------------------------------------------------------------------------
  test('1. Create a new subscription in DRAFT status', async () => {
    const res = await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        customerId,
        planId: planMonthlyId,
        quantity: 2,
        paymentTerms: 'Net 30',
        notes: 'Enterprise rollout pilot'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    assert.match(res.body.data.subscriptionNumber, /^SUB-\d{4}-\d{4}$/);
    assert.equal(res.body.data.status, 'DRAFT');
    assert.equal(res.body.data.quantity, 2);
    assert.equal(parseFloat(res.body.data.unitPrice), 1200);
    assert.equal(parseFloat(res.body.data.totalAmount), 2400); // 1200 * 2
    assert.ok(res.body.data.nextBillingDate, 'Next billing date should be calculated');

    subscriptionId = res.body.data.id;
  });

  // ---------------------------------------------------------------------------
  // 2. VIEW & SEARCH SUBSCRIPTIONS
  // ---------------------------------------------------------------------------
  test('2. List and search subscriptions by customer/id', async () => {
    const res = await request(app)
      .get(`/api/subscriptions?search=${customerId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.length >= 1);
    const found = res.body.data.find(s => s.id === subscriptionId);
    assert.ok(found);
    assert.equal(found.status, 'DRAFT');
  });

  // ---------------------------------------------------------------------------
  // 3. EDIT SUBSCRIPTION DETAILS
  // ---------------------------------------------------------------------------
  test('3. Edit subscription quantity and verify amount recalculation', async () => {
    const res = await request(app)
      .put(`/api/subscriptions/${subscriptionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        quantity: 3,
        notes: 'Updated to 3 seats'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.quantity, 3);
    assert.equal(parseFloat(res.body.data.totalAmount), 3600); // 1200 * 3
  });

  // ---------------------------------------------------------------------------
  // 4. SUBSCRIPTION LIFECYCLE: DRAFT -> QUOTATION -> CONFIRMED -> ACTIVE
  // ---------------------------------------------------------------------------
  test('4. Transition status: DRAFT -> QUOTATION -> CONFIRMED', async () => {
    // DRAFT -> QUOTATION
    const quoteRes = await request(app)
      .patch(`/api/subscriptions/${subscriptionId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'QUOTATION', reason: 'Sent quote to customer' });
    assert.equal(quoteRes.status, 200);
    assert.equal(quoteRes.body.data.status, 'QUOTATION');

    // QUOTATION -> CONFIRMED
    const confirmRes = await request(app)
      .patch(`/api/subscriptions/${subscriptionId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CONFIRMED', reason: 'Customer approved quotation' });
    assert.equal(confirmRes.status, 200);
    assert.equal(confirmRes.body.data.status, 'CONFIRMED');
  });

  // ---------------------------------------------------------------------------
  // 5. ACTIVATE SUBSCRIPTION & AUTO-GENERATE INVOICE
  // ---------------------------------------------------------------------------
  test('5. Activate subscription and verify automatic invoice generation', async () => {
    const res = await request(app)
      .post(`/api/subscriptions/${subscriptionId}/activate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Contract executed' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'ACTIVE');

    // Query invoices for this subscription
    const invRes = await request(app)
      .get(`/api/invoices/subscription/${subscriptionId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(invRes.status, 200);
    assert.ok(invRes.body.data.length >= 1, 'Automatic invoice should have been generated');

    const inv = invRes.body.data[0];
    invoiceId = inv.id;
    assert.match(inv.invoiceNumber, /^INV-\d{4}-\d{4}$/);
    assert.equal(inv.status, 'UNPAID');
    assert.equal(parseFloat(inv.subtotal), 3600); // 1200 * 3
    assert.ok(parseFloat(inv.taxTotal) > 0, 'Tax total should be calculated');
    assert.equal(parseFloat(inv.paidAmount), 0);
    assert.equal(parseFloat(inv.outstandingAmount), parseFloat(inv.totalAmount));
  });

  // ---------------------------------------------------------------------------
  // 6. TAX & DISCOUNT CALCULATION FORMULA VERIFICATION
  // ---------------------------------------------------------------------------
  test('6. Verify Tax & Discount calculations via POST /api/billing/calculate', async () => {
    // Example from prompt:
    // Product price = 1,000, Quantity = 2 -> Subtotal = 2,000
    // Tax rate = 18% -> Tax amount = 360 -> Total = 2,360
    const calcRes1 = await request(app)
      .post('/api/billing/calculate')
      .send({
        unitPrice: 1000,
        quantity: 2,
        taxRate: 18
      });

    assert.equal(calcRes1.status, 200);
    assert.equal(calcRes1.body.data.subtotal, 2000);
    assert.equal(calcRes1.body.data.discountAmount, 0);
    assert.equal(calcRes1.body.data.taxableAmount, 2000);
    assert.equal(calcRes1.body.data.taxAmount, 360);
    assert.equal(calcRes1.body.data.totalAmount, 2360);

    // Prompt Section 7: Percentage Discount (10%)
    // Subtotal = 2,000, Discount 10% = 200, Taxable = 1,800, Tax 18% = 324, Total = 2,124
    const calcRes2 = await request(app)
      .post('/api/billing/calculate')
      .send({
        unitPrice: 1000,
        quantity: 2,
        discountType: 'PERCENTAGE',
        discountValue: 10,
        taxRate: 18
      });

    assert.equal(calcRes2.status, 200);
    assert.equal(calcRes2.body.data.subtotal, 2000);
    assert.equal(calcRes2.body.data.discountAmount, 200);
    assert.equal(calcRes2.body.data.taxableAmount, 1800);
    assert.equal(calcRes2.body.data.taxAmount, 324);
    assert.equal(calcRes2.body.data.totalAmount, 2124);

    // Prompt Section 7: Fixed Discount (100)
    // Subtotal = 2,000, Discount = 100, Taxable = 1,900, Tax 18% = 342, Total = 2,242
    const calcRes3 = await request(app)
      .post('/api/billing/calculate')
      .send({
        unitPrice: 1000,
        quantity: 2,
        discountType: 'FIXED',
        discountValue: 100,
        taxRate: 18
      });

    assert.equal(calcRes3.status, 200);
    assert.equal(calcRes3.body.data.subtotal, 2000);
    assert.equal(calcRes3.body.data.discountAmount, 100);
    assert.equal(calcRes3.body.data.taxableAmount, 1900);
    assert.equal(calcRes3.body.data.taxAmount, 342);
    assert.equal(calcRes3.body.data.totalAmount, 2242);
  });

  // ---------------------------------------------------------------------------
  // 7. PREVENT DUPLICATE INVOICE GENERATION
  // ---------------------------------------------------------------------------
  test('7. Attempt duplicate invoice generation for same subscription and period -> 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/invoices/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        subscriptionId
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Duplicate invoice rejected/i);
  });

  // ---------------------------------------------------------------------------
  // 8. PAYMENT RECORDING: PARTIAL PAYMENT & OUTSTANDING BALANCE
  // ---------------------------------------------------------------------------
  test('8. Record partial payment and verify outstanding balance calculation', async () => {
    // Fetch initial invoice total
    const invRes = await request(app)
      .get(`/api/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const totalAmount = parseFloat(invRes.body.data.totalAmount);
    const partialPaymentAmount = 1000;

    // Record partial payment
    const payRes = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        invoiceId,
        amount: partialPaymentAmount,
        paymentMethod: 'UPI',
        referenceNote: 'UPI Ref: 9876543210'
      });

    assert.equal(payRes.status, 201);
    assert.equal(payRes.body.success, true);
    assert.equal(payRes.body.data.payment.amount, 1000);
    assert.equal(payRes.body.data.payment.status, 'COMPLETED');
    assert.equal(payRes.body.data.invoiceSummary.status, 'PARTIALLY_PAID');
    assert.equal(payRes.body.data.invoiceSummary.paidAmount, 1000);
    assert.equal(payRes.body.data.invoiceSummary.outstandingBalance, totalAmount - 1000);
  });

  // ---------------------------------------------------------------------------
  // 9. PREVENT OVER-PAYMENT EXCEEDING OUTSTANDING BALANCE
  // ---------------------------------------------------------------------------
  test('9. Prevent recording payments exceeding the outstanding invoice balance', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        invoiceId,
        amount: 999999, // Way higher than outstanding balance
        paymentMethod: 'CREDIT_CARD'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /exceeds the invoice outstanding balance/i);
  });

  // ---------------------------------------------------------------------------
  // 10. RECORD REMAINING PAYMENT -> INVOICE BECOMES PAID
  // ---------------------------------------------------------------------------
  test('10. Record remaining payment and verify invoice status changes to PAID', async () => {
    const invRes = await request(app)
      .get(`/api/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const remainingOutstanding = parseFloat(invRes.body.data.outstandingAmount);

    const payRes = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        invoiceId,
        amount: remainingOutstanding,
        paymentMethod: 'BANK_TRANSFER',
        referenceNote: 'NEFT Transfer ref: NEFT20261031'
      });

    assert.equal(payRes.status, 201);
    assert.equal(payRes.body.data.invoiceSummary.isFullyPaid, true);
    assert.equal(payRes.body.data.invoiceSummary.status, 'PAID');
    assert.equal(payRes.body.data.invoiceSummary.outstandingBalance, 0);

    // Verify invoice retrieval reflects PAID status and paidAt timestamp
    const verifyInv = await request(app)
      .get(`/api/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(verifyInv.body.data.status, 'PAID');
    assert.equal(parseFloat(verifyInv.body.data.outstandingAmount), 0);
    assert.ok(verifyInv.body.data.paidAt, 'paidAt timestamp should be set');
  });

  // ---------------------------------------------------------------------------
  // 11. REJECT FURTHER PAYMENTS ON FULLY PAID INVOICE
  // ---------------------------------------------------------------------------
  test('11. Reject further payment on already fully paid invoice', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        invoiceId,
        amount: 50,
        paymentMethod: 'CASH'
      });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /already been paid in full/i);
  });

  // ---------------------------------------------------------------------------
  // 12. PAUSE & RESUME SUBSCRIPTION; EXCLUDE PAUSED FROM BILLING
  // ---------------------------------------------------------------------------
  test('12. Pause subscription and verify it cannot be billed while paused', async () => {
    // Pause
    const pauseRes = await request(app)
      .post(`/api/subscriptions/${subscriptionId}/pause`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Temporary suspension' });

    assert.equal(pauseRes.status, 200);
    assert.equal(pauseRes.body.data.status, 'PAUSED');

    // Attempt invoice generation on paused subscription -> Rejected with 400
    const failInvoiceRes = await request(app)
      .post('/api/invoices/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ subscriptionId });

    assert.equal(failInvoiceRes.status, 400);
    assert.match(failInvoiceRes.body.message, /is PAUSED/i);

    // Resume subscription
    const resumeRes = await request(app)
      .post(`/api/subscriptions/${subscriptionId}/resume`)
      .set('Authorization', `Bearer ${customerToken}`);

    assert.equal(resumeRes.status, 200);
    assert.equal(resumeRes.body.data.status, 'ACTIVE');
  });

  // ---------------------------------------------------------------------------
  // 13. CLOSE SUBSCRIPTION & VERIFY IT CANNOT BE BILLED OR REACTIVATED
  // ---------------------------------------------------------------------------
  test('13. Close subscription and verify closed subscription cannot be billed or reactivated', async () => {
    // Close
    const closeRes = await request(app)
      .post(`/api/subscriptions/${subscriptionId}/close`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Customer requested cancellation' });

    assert.equal(closeRes.status, 200);
    assert.equal(closeRes.body.data.status, 'CLOSED');

    // Attempt invoice generation on closed subscription -> Rejected
    const failInvoiceRes = await request(app)
      .post('/api/invoices/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ subscriptionId });

    assert.equal(failInvoiceRes.status, 400);
    assert.match(failInvoiceRes.body.message, /is CLOSED/i);

    // Attempt direct transition back to ACTIVE -> Rejected with meaningful error
    const reactivateRes = await request(app)
      .patch(`/api/subscriptions/${subscriptionId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ACTIVE' });

    assert.equal(reactivateRes.status, 400);
    assert.match(reactivateRes.body.message, /Closed subscriptions cannot be activated/i);
  });

  // ---------------------------------------------------------------------------
  // 14. RENEWAL WORKFLOW
  // ---------------------------------------------------------------------------
  test('14. Renew a subscription via explicit renewal endpoint', async () => {
    const renewRes = await request(app)
      .post(`/api/subscriptions/${subscriptionId}/renew`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(renewRes.status, 200);
    assert.equal(renewRes.body.data.status, 'ACTIVE');
    assert.ok(renewRes.body.data.renewalInvoice, 'Renewal should generate renewal invoice');
  });

  // ---------------------------------------------------------------------------
  // 15. BILLING ENGINE RUN & DUE SUBSCRIPTIONS
  // ---------------------------------------------------------------------------
  test('15. Test GET /api/billing/due-subscriptions and POST /api/billing/run', async () => {
    const dueRes = await request(app)
      .get('/api/billing/due-subscriptions')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(dueRes.status, 200);
    assert.ok(Array.isArray(dueRes.body.data));

    const runRes = await request(app)
      .post('/api/billing/run')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    assert.equal(runRes.status, 200);
    assert.ok(runRes.body.data.runTimestamp);
    assert.equal(typeof runRes.body.data.invoicesGeneratedCount, 'number');
    assert.equal(typeof runRes.body.data.skippedCount, 'number');
  });

  // ---------------------------------------------------------------------------
  // 16. BILLING ANALYTICS FOR MEMBER 4 & DASHBOARD
  // ---------------------------------------------------------------------------
  test('16. Verify Member 4 Analytics endpoint GET /api/billing/analytics', async () => {
    const res = await request(app)
      .get('/api/billing/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.financialSummary);
    assert.ok(res.body.data.financialSummary.totalRevenue > 0, 'Total revenue from completed payments should be tracked');
    assert.ok(res.body.data.financialSummary.totalInvoiced > 0, 'Total invoiced amount should be tracked');
    assert.ok(res.body.data.counts);
    assert.ok(res.body.data.subscriptionsByStatus);
    assert.ok(res.body.data.invoicesByStatus);
  });
});
