const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test.describe('Subscription Plan CRUD & Billing Interval APIs', () => {
  let adminToken = '';
  let customerToken = '';
  let productId = 'prod-software-001';
  let createdPlanId = '';

  test.before(async () => {
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@brightloop.com', password: 'Admin@Brightloop123!' });
    adminToken = adminRes.body.data.token;

    const custRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `plancust_${Date.now()}@brightloop.test`,
        password: 'CustomerPass123!',
        firstName: 'Plan',
        lastName: 'Subscriber'
      });
    customerToken = custRes.body.data.token;
  });

  test('POST /api/plans - ADMIN can create a MONTHLY billing interval plan', async () => {
    const res = await request(app)
      .post('/api/plans')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        productId,
        name: 'Enterprise Monthly Scale',
        code: `ENT-M-${Date.now()}`,
        description: 'Monthly recurring plan with 1 month intervals',
        price: 950.00,
        billingInterval: 'MONTHLY',
        intervalCount: 1,
        minQuantity: 2,
        autoClose: false,
        allowEarlyClose: true,
        allowPause: true,
        allowRenew: true
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.plan.billingInterval, 'MONTHLY');
    assert.equal(res.body.data.plan.minQuantity, 2);
    createdPlanId = res.body.data.plan.id;
  });

  test('POST /api/plans - ADMIN can create DAILY, WEEKLY, and YEARLY interval plans', async () => {
    const intervals = ['DAILY', 'WEEKLY', 'YEARLY'];

    for (const interval of intervals) {
      const res = await request(app)
        .post('/api/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId,
          name: `Auto Plan ${interval}`,
          code: `AUTO-${interval}-${Date.now()}`,
          price: interval === 'DAILY' ? 10 : interval === 'WEEKLY' ? 50 : 2500,
          billingInterval: interval,
          autoClose: interval === 'DAILY' // daily pass auto-closes
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.data.plan.billingInterval, interval);
    }
  });

  test('POST /api/plans - Reject invalid billing interval', async () => {
    const res = await request(app)
      .post('/api/plans')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        productId,
        name: 'Invalid Interval Plan',
        code: `INV-${Date.now()}`,
        price: 100,
        billingInterval: 'BI-WEEKLY' // Invalid!
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('POST /api/plans - CUSTOMER cannot create plan (403)', async () => {
    const res = await request(app)
      .post('/api/plans')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId,
        name: 'Customer Plan',
        code: `CUST-${Date.now()}`,
        price: 10,
        billingInterval: 'MONTHLY'
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  test('GET /api/plans - Filter plans by billingInterval=MONTHLY', async () => {
    const res = await request(app)
      .get('/api/plans')
      .query({ billingInterval: 'MONTHLY' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.length > 0);
    res.body.data.forEach(p => {
      assert.equal(p.billingInterval, 'MONTHLY');
    });
  });

  test('GET /api/plans/:id - Retrieve single plan by ID', async () => {
    const res = await request(app).get(`/api/plans/${createdPlanId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.plan.id, createdPlanId);
  });

  test('PUT /api/plans/:id - ADMIN can update subscription plan', async () => {
    const res = await request(app)
      .put(`/api/plans/${createdPlanId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        price: 999.00,
        allowPause: false
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(Number(res.body.data.plan.price), 999.00);
    assert.equal(res.body.data.plan.allowPause, false);
  });

  test('DELETE /api/plans/:id - ADMIN can deactivate plan', async () => {
    const res = await request(app)
      .delete(`/api/plans/${createdPlanId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});
