const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test.describe('Authentication & Password Validation APIs', () => {
  const timestamp = Date.now();
  const testCustomerEmail = `customer_${timestamp}@brightloop.test`;
  const validPassword = 'SecurePassword123!';
  let customerToken = '';

  test('POST /api/auth/register - Should register a new customer with compliant password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testCustomerEmail,
        password: validPassword,
        firstName: 'John',
        lastName: 'Doe',
        companyName: 'Acme Logistics'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testCustomerEmail);
    assert.equal(res.body.data.user.role, 'CUSTOMER');
    assert.ok(res.body.data.token, 'Should return JWT token');
    assert.equal(res.body.data.user.passwordHash, undefined, 'Password hash must never be returned in response');
  });

  test('POST /api/auth/register - Should reject registration with short password (<=8 characters)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `short_${timestamp}@brightloop.test`,
        password: 'Pass1!',
        firstName: 'Short',
        lastName: 'Pass'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Password must be more than 8 characters long/i);
  });

  test('POST /api/auth/register - Should reject password without special character', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `nospecial_${timestamp}@brightloop.test`,
        password: 'Password12345',
        firstName: 'No',
        lastName: 'Special'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /special character/i);
  });

  test('POST /api/auth/register - Should reject password without uppercase letter', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `noupper_${timestamp}@brightloop.test`,
        password: 'password123!',
        firstName: 'No',
        lastName: 'Upper'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/register - Should reject duplicate email with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testCustomerEmail,
        password: validPassword,
        firstName: 'Duplicate',
        lastName: 'Test'
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already exists/i);
  });

  test('POST /api/auth/login - Should successfully login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testCustomerEmail,
        password: validPassword
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token, 'Should return JWT token');
    assert.equal(res.body.data.user.email, testCustomerEmail);
    customerToken = res.body.data.token;
  });

  test('POST /api/auth/login - Should reject invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testCustomerEmail,
        password: 'WrongPassword123!'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('GET /api/auth/me - Should return profile when bearer token provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testCustomerEmail);
    assert.equal(res.body.data.user.role, 'CUSTOMER');
  });

  test('GET /api/auth/me - Should reject request without token with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/forgot-password & reset-password flow', async () => {
    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testCustomerEmail });

    assert.equal(forgotRes.status, 200);
    assert.ok(forgotRes.body.data.resetToken);

    const newPassword = 'NewSecretPassword999!';
    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: forgotRes.body.data.resetToken,
        newPassword
      });

    assert.equal(resetRes.status, 200);
    assert.equal(resetRes.body.success, true);

    // Verify login with new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testCustomerEmail,
        password: newPassword
      });

    assert.equal(loginRes.status, 200);
    assert.ok(loginRes.body.data.token);
  });
});
