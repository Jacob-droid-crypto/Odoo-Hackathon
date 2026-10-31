const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test.describe('Product & Product Variant Management APIs', () => {
  let adminToken = '';
  let customerToken = '';
  let createdProductId = '';
  let createdVariantId = '';

  test.before(async () => {
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@brightloop.com', password: 'Admin@Brightloop123!' });
    adminToken = adminRes.body.data.token;

    const custRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `prodcust_${Date.now()}@brightloop.test`,
        password: 'CustomerPass123!',
        firstName: 'Product',
        lastName: 'Buyer'
      });
    customerToken = custRes.body.data.token;
  });

  test('POST /api/products - ADMIN can create a new product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Brightloop CRM Enterprise',
        type: 'SOFTWARE',
        salesPrice: 850.00,
        costPrice: 200.00,
        notes: 'Full pipeline and customer interaction suite'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.product.name, 'Brightloop CRM Enterprise');
    assert.equal(Number(res.body.data.product.salesPrice), 850.00);
    createdProductId = res.body.data.product.id;
  });

  test('POST /api/products - CUSTOMER cannot create product (403)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Illegal Product',
        type: 'SOFTWARE',
        salesPrice: 100.00
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  test('GET /api/products - Anyone can list products', async () => {
    const res = await request(app).get('/api/products');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.length > 0);
  });

  test('POST /api/products/:productId/variants - ADMIN can add brand variant with +560 price adder', async () => {
    const res = await request(app)
      .post(`/api/products/${createdProductId}/variants`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        variantName: 'Brand: Odoo Integration',
        attributeName: 'Brand',
        attributeValue: 'Odoo',
        priceExtra: 560.00,
        sku: `CRM-ODOO-${Date.now()}`
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.variant.attributeValue, 'Odoo');
    assert.equal(Number(res.body.data.variant.priceExtra), 560.00);
    createdVariantId = res.body.data.variant.id;
  });

  test('GET /api/products/:productId/variants - Can list variants of a product', async () => {
    const res = await request(app).get(`/api/products/${createdProductId}/variants`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.variants.length >= 1);
    assert.equal(res.body.data.variants[0].attributeValue, 'Odoo');
  });

  test('GET /api/products/:id - Should retrieve product with nested variants and plans', async () => {
    const res = await request(app).get(`/api/products/${createdProductId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.product.id, createdProductId);
    assert.ok(res.body.data.product.variants.length >= 1);
  });

  test('PUT /api/products/:id - ADMIN can update product', async () => {
    const res = await request(app)
      .put(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        salesPrice: 899.00,
        notes: 'Updated description and pricing'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(Number(res.body.data.product.salesPrice), 899.00);
  });

  test('DELETE /api/products/:id - ADMIN can deactivate product', async () => {
    const res = await request(app)
      .delete(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});
