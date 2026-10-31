const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PostgreSQL database with Brightloop hackathon data...');

  const adminPassword = await bcrypt.hash('Admin@Brightloop123!', 10);
  const staffPassword = await bcrypt.hash('Staff@Brightloop123!', 10);
  const customerPassword = await bcrypt.hash('Customer@Brightloop123!', 10);

  // 1. Seed Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@brightloop.com' },
    update: {},
    create: {
      email: 'admin@brightloop.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      companyName: 'Brightloop Software',
      phone: '+1-555-0100',
      isActive: true
    }
  });
  console.log('✓ Admin user seeded:', admin.email);

  // 2. Seed Staff
  const staff = await prisma.user.upsert({
    where: { email: 'staff@brightloop.com' },
    update: {},
    create: {
      email: 'staff@brightloop.com',
      passwordHash: staffPassword,
      firstName: 'Sarah',
      lastName: 'Staff',
      role: 'STAFF',
      companyName: 'Brightloop Operations',
      phone: '+1-555-0101',
      isActive: true
    }
  });
  console.log('✓ Staff user seeded:', staff.email);

  // 3. Seed Customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@acme.com' },
    update: {},
    create: {
      email: 'customer@acme.com',
      passwordHash: customerPassword,
      firstName: 'Alice',
      lastName: 'Acme',
      role: 'CUSTOMER',
      companyName: 'Acme Retail Corp',
      phone: '+1-555-0102',
      isActive: true
    }
  });
  console.log('✓ Customer user seeded:', customer.email);

  // 4. Seed Product: Business Software
  const erpProduct = await prisma.product.create({
    data: {
      name: 'Brightloop ERP Business Software',
      type: 'SOFTWARE',
      salesPrice: 1200.00,
      costPrice: 400.00,
      notes: 'Flagship enterprise subscription software for business operations'
    }
  });
  console.log('✓ Product seeded:', erpProduct.name);

  // 5. Seed Variant: Brand Odoo (+560 price)
  const odooVariant = await prisma.productVariant.create({
    data: {
      productId: erpProduct.id,
      variantName: 'Brand: Odoo Integration',
      attributeName: 'Brand',
      attributeValue: 'Odoo',
      priceExtra: 560.00,
      sku: 'BL-ERP-ODOO-560'
    }
  });
  console.log('✓ Product variant seeded:', odooVariant.variantName, `(+${odooVariant.priceExtra})`);

  // 6. Seed Plans: Monthly, Yearly, Daily, Weekly
  const monthlyPlan = await prisma.subscriptionPlan.create({
    data: {
      productId: erpProduct.id,
      name: 'Brightloop Monthly Professional',
      code: 'BL-ERP-MONTHLY',
      description: 'Standard monthly subscription billed on monthly intervals',
      price: 1200.00,
      billingInterval: 'MONTHLY',
      intervalCount: 1,
      minQuantity: 1,
      autoClose: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenew: true
    }
  });
  console.log('✓ Monthly plan seeded:', monthlyPlan.name);

  const yearlyPlan = await prisma.subscriptionPlan.create({
    data: {
      productId: erpProduct.id,
      name: 'Brightloop Yearly Enterprise',
      code: 'BL-ERP-YEARLY',
      description: 'Annual enterprise subscription with discounted rate',
      price: 12000.00,
      billingInterval: 'YEARLY',
      intervalCount: 1,
      minQuantity: 5,
      autoClose: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenew: true
    }
  });
  console.log('✓ Yearly plan seeded:', yearlyPlan.name);

  // 7. Seed Tax Rules
  const standardTax = await prisma.taxRule.create({
    data: {
      name: 'Standard GST (18%)',
      ratePercentage: 18.00,
      description: 'Standard 18% GST / VAT for SaaS subscriptions',
      isDefault: true,
      isActive: true
    }
  });
  console.log('✓ Tax rule seeded:', standardTax.name);

  const reducedTax = await prisma.taxRule.create({
    data: {
      name: 'Reduced VAT (5%)',
      ratePercentage: 5.00,
      description: 'Concessional 5% tax rate',
      isDefault: false,
      isActive: true
    }
  });
  console.log('✓ Tax rule seeded:', reducedTax.name);

  // 8. Seed Discount Rules
  const discount10 = await prisma.discountRule.create({
    data: {
      code: 'BRIGHT10',
      description: '10% promotional discount for new subscriptions',
      type: 'PERCENTAGE',
      value: 10.00,
      isActive: true
    }
  });
  console.log('✓ Discount rule seeded:', discount10.code);

  const discountFixed = await prisma.discountRule.create({
    data: {
      code: 'WELCOME100',
      description: 'Flat ₹100 welcome credit',
      type: 'FIXED',
      value: 100.00,
      minPurchase: 500.00,
      isActive: true
    }
  });
  console.log('✓ Discount rule seeded:', discountFixed.code);

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
