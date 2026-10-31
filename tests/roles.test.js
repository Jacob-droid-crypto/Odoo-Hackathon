const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test.describe('Role-Based Access Control & Staff Account Management', () => {
  let adminToken = '';
  let staffToken = '';
  let customerToken = '';

  test.before(async () => {
    // 1. Login default Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@brightloop.com', password: 'Admin@Brightloop123!' });
    adminToken = adminRes.body.data.token;

    // 2. Login default Staff
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff@brightloop.com', password: 'Staff@Brightloop123!' });
    staffToken = staffRes.body.data.token;

    // 3. Register a fresh Customer
    const custRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `rolecust_${Date.now()}@brightloop.test`,
        password: 'CustomerPass123!',
        firstName: 'Role',
        lastName: 'Customer'
      });
    customerToken = custRes.body.data.token;
  });

  test('POST /api/users/staff - ADMIN can successfully create staff accounts', async () => {
    const timestamp = Date.now();
    const res = await request(app)
      .post('/api/users/staff')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: `newstaff_${timestamp}@brightloop.com`,
        password: 'StaffSecretPass123!',
        firstName: 'David',
        lastName: 'Support',
        phone: '+1-555-9000'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.staff.role, 'STAFF');
    assert.equal(res.body.data.staff.firstName, 'David');
  });

  test('POST /api/users/staff - CUSTOMER is forbidden from creating staff accounts (403)', async () => {
    const res = await request(app)
      .post('/api/users/staff')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        email: `hacked_${Date.now()}@brightloop.com`,
        password: 'HackerPass123!',
        firstName: 'Rogue',
        lastName: 'Staff'
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Access denied/i);
  });

  test('POST /api/users/staff - STAFF is forbidden from creating other staff accounts (403)', async () => {
    const res = await request(app)
      .post('/api/users/staff')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        email: `substaff_${Date.now()}@brightloop.com`,
        password: 'SubStaffPass123!',
        firstName: 'Junior',
        lastName: 'Staff'
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Access denied/i);
  });

  test('GET /api/users - ADMIN can list all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  test('GET /api/users - STAFF can list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${staffToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  test('GET /api/users - CUSTOMER cannot list users (403)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${customerToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });
});
