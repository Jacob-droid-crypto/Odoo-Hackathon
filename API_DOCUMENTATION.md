# Subscription Management System (Brightloop Software)
## Backend & Authentication API Contract Documentation

> **Lead**: Member 2 – Backend & Authentication Lead  
> **Base URL**: `http://localhost:5000/api`  
> **Format**: JSON (`Content-Type: application/json`)  
> **Authentication**: Bearer Token in `Authorization` header (`Authorization: Bearer <jwt_token>`)

---

## 1. System Overview & Architecture

- **Prefix**: All endpoints are strictly prefixed with `/api`.
- **Database**: PostgreSQL with Prisma ORM. Common schema defined in [`prisma/schema.prisma`](./prisma/schema.prisma) supporting Users, Roles, Products, Product Variants, Subscription Plans, Quotations, Subscriptions, Invoices, Discounts, Taxes, and Payments.
- **Roles**:
  - `ADMIN`: Full system control, create staff accounts, manage products, variants, and plans.
  - `STAFF`: Day-to-day management, view customers and subscriptions.
  - `CUSTOMER`: Self-service portal access to own profile, subscriptions, and invoices.
- **Password Policy**:
  - More than 8 characters (minimum 9 characters).
  - Must contain at least one uppercase letter, one lowercase letter, and one special character.
  - Hashed using `bcrypt` (salt rounds >= 10). Plain text passwords are never stored.

---

## 2. Standard API Response Structure

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Items retrieved",
  "data": [ ... ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "password",
      "message": "Password must be more than 8 characters long"
    }
  ]
}
```

---

## 3. Authentication Endpoints (`/api/auth`)

### 3.1 Customer Registration
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "customer@acme.com",
  "password": "SecurePassword123!",
  "firstName": "Alice",
  "lastName": "Acme",
  "companyName": "Acme Corp",
  "phone": "+1-555-0102"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Customer account registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "customer@acme.com",
      "firstName": "Alice",
      "lastName": "Acme",
      "role": "CUSTOMER",
      "companyName": "Acme Corp",
      "phone": "+1-555-0102"
    }
  }
}
```

### 3.2 Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@brightloop.com",
  "password": "Admin@Brightloop123!"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "admin@brightloop.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    }
  }
}
```

### 3.3 Get Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated (`ADMIN`, `STAFF`, `CUSTOMER`)
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "customer@acme.com",
      "firstName": "Alice",
      "lastName": "Acme",
      "role": "CUSTOMER"
    }
  }
}
```

### 3.4 Forgot Password
- **Endpoint**: `POST /api/auth/forgot-password`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "customer@acme.com"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "If that email address is registered, a password reset link has been dispatched.",
  "data": {
    "resetToken": "hex_token_string",
    "resetUrl": "/reset-password?token=hex_token_string",
    "expiresAt": "2026-10-31T05:00:00.000Z"
  }
}
```

### 3.5 Reset Password
- **Endpoint**: `POST /api/auth/reset-password`
- **Access**: Public
- **Request Body**:
```json
{
  "token": "hex_token_string",
  "newPassword": "NewStrongPassword456!"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password has been reset successfully. You may now login with your new credentials."
}
```

---

## 4. User Management Endpoints (`/api/users`)

### 4.1 Create Staff Account
- **Endpoint**: `POST /api/users/staff`
- **Access**: `ADMIN` ONLY (403 for `STAFF` or `CUSTOMER`)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Request Body**:
```json
{
  "email": "sarah.ops@brightloop.com",
  "password": "StaffPassword123!",
  "firstName": "Sarah",
  "lastName": "Ops",
  "phone": "+1-555-0105"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Staff member account created successfully",
  "data": {
    "staff": {
      "id": "uuid",
      "email": "sarah.ops@brightloop.com",
      "firstName": "Sarah",
      "lastName": "Ops",
      "role": "STAFF",
      "phone": "+1-555-0105"
    }
  }
}
```

### 4.2 List Users
- **Endpoint**: `GET /api/users`
- **Access**: `ADMIN`, `STAFF`
- **Query Parameters**:
  - `role`: Filter by `ADMIN`, `STAFF`, or `CUSTOMER`
  - `search`: Case-insensitive search on email/name/company
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)

### 4.3 Get User by ID
- **Endpoint**: `GET /api/users/:id`
- **Access**: `ADMIN`, `STAFF`, or owner `CUSTOMER`

---

## 5. Product Management Endpoints (`/api/products`)

### 5.1 Create Product
- **Endpoint**: `POST /api/products`
- **Access**: `ADMIN` ONLY
- **Request Body**:
```json
{
  "name": "Brightloop ERP Business Software",
  "type": "SOFTWARE",
  "salesPrice": 1200.00,
  "costPrice": 400.00,
  "notes": "Flagship multi-tenant enterprise solution",
  "isActive": true
}
```
- **Types**: `SOFTWARE`, `ADDON`, `SERVICE`, `PHYSICAL`
- **Success Response (201 Created)**

### 5.2 List Products
- **Endpoint**: `GET /api/products`
- **Access**: Public / Authenticated
- **Query Parameters**:
  - `type`: Filter by product type
  - `isActive`: `true` or `false`
  - `search`: Search product names and notes
  - `page`: Page number
  - `limit`: Items per page

### 5.3 Get Product by ID (with Variants & Plans)
- **Endpoint**: `GET /api/products/:id`
- **Access**: Public / Authenticated
- **Returns**: Full product object with attached variants and subscription plans.

### 5.4 Update Product
- **Endpoint**: `PUT /api/products/:id`
- **Access**: `ADMIN` ONLY

### 5.5 Delete / Deactivate Product
- **Endpoint**: `DELETE /api/products/:id`
- **Access**: `ADMIN` ONLY (Soft delete, sets `isActive = false`)

---

## 6. Product Variant Endpoints (`/api/products/:productId/variants`)

Variants allow customizing a base product (e.g. brand selection adding 560 to price).

### 6.1 Add Variant to Product
- **Endpoint**: `POST /api/products/:productId/variants`
- **Access**: `ADMIN` ONLY
- **Request Body**:
```json
{
  "variantName": "Brand: Odoo Integration",
  "attributeName": "Brand",
  "attributeValue": "Odoo",
  "priceExtra": 560.00,
  "sku": "BL-ERP-ODOO-560",
  "isActive": true
}
```
- **Success Response (201 Created)**

### 6.2 List Product Variants
- **Endpoint**: `GET /api/products/:productId/variants`
- **Access**: Public / Authenticated

### 6.3 Update Variant
- **Endpoint**: `PUT /api/products/:productId/variants/:variantId`
- **Access**: `ADMIN` ONLY

### 6.4 Delete Variant
- **Endpoint**: `DELETE /api/products/:productId/variants/:variantId`
- **Access**: `ADMIN` ONLY

---

## 7. Subscription Plan Endpoints (`/api/plans`)

Supports daily, weekly, monthly, and yearly recurring billing intervals with policy flags.

### 7.1 Create Subscription Plan
- **Endpoint**: `POST /api/plans`
- **Access**: `ADMIN` ONLY
- **Request Body**:
```json
{
  "productId": "prod-software-001",
  "name": "Brightloop Monthly Professional",
  "code": "BL-ERP-MONTHLY",
  "description": "Standard monthly subscription plan",
  "price": 1200.00,
  "billingInterval": "MONTHLY",
  "intervalCount": 1,
  "minQuantity": 1,
  "startDate": "2026-01-01T00:00:00.000Z",
  "endDate": null,
  "autoClose": false,
  "allowEarlyClose": true,
  "allowPause": true,
  "allowRenew": true,
  "isActive": true
}
```
- **Billing Intervals**:
  - `DAILY`: Daily recurring billing or daily pass
  - `WEEKLY`: Weekly sprint plan
  - `MONTHLY`: Standard monthly recurring
  - `YEARLY`: Annual contract
- **Key Business Flags**:
  - `autoClose`: Automatically close subscription when plan ends
  - `allowEarlyClose`: Customer/staff can terminate before term
  - `allowPause`: Customer/staff can temporarily freeze billing
  - `allowRenew`: Can renew at expiration

### 7.2 List Subscription Plans
- **Endpoint**: `GET /api/plans`
- **Access**: Public / Authenticated
- **Query Parameters**:
  - `billingInterval`: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`
  - `productId`: Filter plans for a specific product
  - `isActive`: `true` or `false`

### 7.3 Get Plan by ID
- **Endpoint**: `GET /api/plans/:id`
- **Access**: Public / Authenticated

### 7.4 Update Plan
- **Endpoint**: `PUT /api/plans/:id`
- **Access**: `ADMIN` ONLY

### 7.5 Delete Plan
- **Endpoint**: `DELETE /api/plans/:id`
- **Access**: `ADMIN` ONLY

---

## 8. Pre-Seeded Default Accounts for Demo & Testing

| Role | Email | Password |
|---|---|---|
| **ADMIN** | `admin@brightloop.com` | `Admin@Brightloop123!` |
| **STAFF** | `staff@brightloop.com` | `Staff@Brightloop123!` |
| **CUSTOMER** | `customer@acme.com` | `Customer@Brightloop123!` |

---

---

## 9. Integration Guide for Other Team Members

- **Member 1 (Frontend)**:
  - Base URL: `http://localhost:5000/api`
  - Save `token` in `localStorage` upon login or registration.
  - Send `Authorization: Bearer <token>` with API calls.
  - Role check in response: `res.data.user.role` determines whether to render Admin Dashboard, Staff Portal, or Customer Portal.
  - Use `POST /api/billing/calculate` for real-time frontend pricing, tax, and discount previews without creating records.
- **Member 2 (Backend & Auth Lead)**:
  - Models, auth middleware, and Prisma schemas integrated seamlessly.
- **Member 3 (Subscriptions & Billing Engine Lead)**:
  - Implements complete Subscription Lifecycle, Automatic Invoice Generation, Tax & Discount calculations, and Simulated Payment processing.
- **Member 4 (Analytics & Reporting Lead)**:
  - Use `GET /api/billing/analytics` to pull live revenue, invoicing, overdue, outstanding balance, and status breakdown metrics.

---

## 10. Subscription Management Endpoints (`/api/subscriptions`)

### 10.1 Create Subscription
- **Endpoint**: `POST /api/subscriptions`
- **Access**: Authenticated (`ADMIN`, `STAFF`, `CUSTOMER`)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "customerId": "customer-user-001",
  "planId": "plan-monthly-001",
  "quantity": 2,
  "startDate": "2026-10-31T00:00:00.000Z",
  "paymentTerms": "Net 30",
  "autoRenew": true,
  "notes": "Corporate rollout",
  "status": "DRAFT"
}
```
- **Response (201 Created)**: Returns created subscription with unique `subscriptionNumber` (e.g. `SUB-2026-0001`), line items, computed unitPrice, totalAmount, and calculated `nextBillingDate`.
- *Note*: If `status` is set to `ACTIVE`, an initial invoice is generated automatically.

### 10.2 List Subscriptions
- **Endpoint**: `GET /api/subscriptions`
- **Access**: Authenticated (`ADMIN` & `STAFF` see all; `CUSTOMER` sees their own)
- **Query Parameters**:
  - `status`: `DRAFT`, `QUOTATION`, `CONFIRMED`, `ACTIVE`, `PAUSED`, `CLOSED`
  - `search`: Search by customer name, email, subscription ID, or subscriptionNumber
  - `customerId`: Filter by customer
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)

### 10.3 Get Subscription by ID
- **Endpoint**: `GET /api/subscriptions/:id`
- **Access**: Authenticated (Owner `CUSTOMER`, or `ADMIN`/`STAFF`)
- **Returns**: Full subscription details including customer info, plan, line items, and invoice history.

### 10.4 Update Subscription
- **Endpoint**: `PUT /api/subscriptions/:id`
- **Access**: `ADMIN`, `STAFF`
- **Request Body**:
```json
{
  "quantity": 3,
  "paymentTerms": "Net 15",
  "notes": "Updated seat count"
}
```
- **Returns**: Updated subscription with automatically recalculated `totalAmount` and billing dates.

### 10.5 Transition Subscription Status
- **Endpoint**: `PATCH /api/subscriptions/:id/status`
- **Access**: Authenticated
- **Allowed Transitions**:
  - `DRAFT` -> `QUOTATION` -> `CONFIRMED` -> `ACTIVE` -> `PAUSED` -> `ACTIVE` -> `CLOSED`
  - `CLOSED` is a permanent terminal state (cannot transition back without renewal workflow).
- **Request Body**:
```json
{
  "status": "ACTIVE",
  "reason": "Customer approved quote and signed master agreement"
}
```

### 10.6 Subscription Action Endpoints
- `POST /api/subscriptions/:id/activate` - Activate subscription (auto-generates invoice)
- `POST /api/subscriptions/:id/pause` - Freeze recurring billing
- `POST /api/subscriptions/:id/resume` - Resume paused subscription
- `POST /api/subscriptions/:id/close` - Terminate subscription permanently
- `POST /api/subscriptions/:id/renew` - Renew subscription term and generate renewal invoice

---

## 11. Invoice Management Endpoints (`/api/invoices`)

### 11.1 Generate Invoice Manually / On-Demand
- **Endpoint**: `POST /api/invoices/generate`
- **Access**: `ADMIN`, `STAFF`
- **Request Body**:
```json
{
  "subscriptionId": "sub-uuid-here",
  "discountCode": "BRIGHT10",
  "taxRatePercentage": 18.00,
  "notes": "Custom billing run"
}
```
- **Rules**:
  - Automatically verifies subscription is not `PAUSED` or `CLOSED`.
  - Rejects duplicates for the same subscription and billing cycle (returns `409 Conflict`).
  - Executes inside a database transaction (`prisma.$transaction`).
  - Advances subscription `nextBillingDate`.

### 11.2 List Invoices
- **Endpoint**: `GET /api/invoices`
- **Access**: Authenticated (`ADMIN` & `STAFF` see all; `CUSTOMER` sees their own)
- **Query Parameters**:
  - `status`: `DRAFT`, `UNPAID`, `CONFIRMED`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `CANCELLED`
  - `subscriptionId`: Filter by subscription
  - `search`: Search invoiceNumber or customer
  - `page`: Page number
  - `limit`: Items per page

### 11.3 Get Invoice by ID
- **Endpoint**: `GET /api/invoices/:id`
- **Access**: Authenticated (Owner `CUSTOMER`, or `ADMIN`/`STAFF`)
- **Returns**: Full invoice with breakdown: `subtotal`, `discountTotal`, `taxTotal`, `totalAmount`, `paidAmount`, `outstandingAmount`, line items, and payment history.

### 11.4 Get Invoices by Subscription ID
- **Endpoint**: `GET /api/invoices/subscription/:subscriptionId`
- **Access**: Authenticated

---

## 12. Payment Management Endpoints (`/api/payments`)

### 12.1 Record Payment
- **Endpoint**: `POST /api/payments`
- **Access**: Authenticated (`CUSTOMER` paying own invoice, or `ADMIN`/`STAFF` recording payment)
- **Request Body**:
```json
{
  "invoiceId": "inv-uuid-here",
  "amount": 1000.00,
  "paymentMethod": "UPI",
  "referenceNote": "Transaction Ref: UPI98234710",
  "paymentDate": "2026-10-31T05:30:00.000Z"
}
```
- **Supported Payment Methods**:
  - `UPI`, `CREDIT_CARD`, `CARD`, `BANK_TRANSFER`, `CASH`, `STRIPE`, `OTHER`
- **Logic**:
  - Rejects amounts exceeding current `outstandingAmount` (400 Bad Request).
  - Rejects payments on already `PAID` or `CANCELLED` invoices.
  - Updates `paidAmount` and `outstandingAmount`.
  - Partial payment updates invoice status to `PARTIALLY_PAID`.
  - Full payment updates invoice status to `PAID` and sets `paidAt`.
  - Executed inside a database transaction (`prisma.$transaction`).

### 12.2 List Payments
- **Endpoint**: `GET /api/payments`
- **Access**: Authenticated
- **Query Parameters**: `invoiceId`, `customerId`, `paymentMethod`, `status`, `page`, `limit`

### 12.3 Get Payment by ID
- **Endpoint**: `GET /api/payments/:id`
- **Access**: Authenticated

### 12.4 Get Payments for an Invoice
- **Endpoint**: `GET /api/payments/invoice/:invoiceId`
- **Access**: Authenticated

### 12.5 Get Payments for a Customer
- **Endpoint**: `GET /api/payments/customer/:customerId`
- **Access**: Authenticated

---

## 13. Billing Automation, Taxes & Discounts (`/api/billing`)

### 13.1 Run Billing Engine
- **Endpoint**: `POST /api/billing/run`
- **Access**: `ADMIN`, `STAFF`
- **Description**: Scans all `ACTIVE` subscriptions where `nextBillingDate <= now`, generates invoices, and advances their next billing dates. Returns summary of generated invoices, skipped subscriptions, and errors.

### 13.2 View Subscriptions Due for Billing
- **Endpoint**: `GET /api/billing/due-subscriptions`
- **Access**: `ADMIN`, `STAFF`

### 13.3 Calculate Pricing & Tax Preview
- **Endpoint**: `POST /api/billing/calculate`
- **Access**: Public / Authenticated (Frontend preview tool)
- **Request Body**:
```json
{
  "unitPrice": 1000.00,
  "quantity": 2,
  "discountType": "PERCENTAGE",
  "discountValue": 10,
  "taxRate": 18
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "unitPrice": 1000,
    "quantity": 2,
    "subtotal": 2000,
    "discountType": "PERCENTAGE",
    "discountValue": 10,
    "discountAmount": 200,
    "taxableAmount": 1800,
    "taxRatePercentage": 18,
    "taxAmount": 324,
    "totalAmount": 2124
  }
}
```

### 13.4 Configurable Tax Rates
- `GET /api/billing/tax-rates` - List active tax rules (e.g. Standard GST 18%, Concessional 5%)
- `POST /api/billing/tax-rates` - Create a new tax rate rule (`ADMIN` only)

### 13.5 Configurable Discounts
- `GET /api/billing/discounts` - List discount rules (e.g. `BRIGHT10`, `WELCOME100`)
- `POST /api/billing/discounts` - Create a promotional discount code (`ADMIN` only)

---

## 14. Analytics & Reporting Metrics for Member 4 (`GET /api/billing/analytics`)

- **Endpoint**: `GET /api/billing/analytics`
- **Access**: `ADMIN`, `STAFF`
- **Response Format**:
```json
{
  "success": true,
  "message": "Billing analytics retrieved successfully",
  "data": {
    "financialSummary": {
      "totalRevenue": 2400.00,
      "totalInvoiced": 3600.00,
      "outstandingAmount": 1200.00,
      "currency": "INR (₹)"
    },
    "counts": {
      "totalSubscriptions": 12,
      "activeSubscriptions": 8,
      "pausedSubscriptions": 2,
      "closedSubscriptions": 2,
      "totalInvoices": 15,
      "overdueInvoicesCount": 1,
      "totalPaymentsRecorded": 14
    },
    "subscriptionsByStatus": {
      "DRAFT": 0,
      "QUOTATION": 0,
      "CONFIRMED": 0,
      "ACTIVE": 8,
      "PAUSED": 2,
      "CLOSED": 2
    },
    "invoicesByStatus": {
      "DRAFT": 0,
      "UNPAID": 3,
      "CONFIRMED": 0,
      "PARTIALLY_PAID": 2,
      "PAID": 10,
      "OVERDUE": 1,
      "CANCELLED": 0
    },
    "generatedAt": "2026-10-31T05:35:00.000Z"
  }
}
```

---

## 15. Analytics Dashboard & Visualizations Endpoints (`/api/analytics`) — Member 4

> **Lead**: Member 4 – Analytics Dashboard, Financial Reporting & Integration Lead  
> **Access**: Authenticated (`ADMIN`, `STAFF`)  
> **Headers**: `Authorization: Bearer <token>`

### 15.1 Admin Analytics Dashboard Summary
- **Endpoint**: `GET /api/analytics/dashboard`
- **Description**: Returns all 8 primary summary metrics, subscription status distribution, invoice distribution, and live recent activities.
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Dashboard analytics retrieved successfully",
  "data": {
    "totalCustomers": 5,
    "totalProducts": 2,
    "activeSubscriptions": 4,
    "totalRevenue": 88640.00,
    "totalInvoices": 9,
    "paidInvoices": 6,
    "unpaidInvoices": 1,
    "partiallyPaidInvoices": 1,
    "overdueInvoices": 1,
    "totalOutstandingAmount": 14600.00,
    "subscriptionsDueForRenewal": 2,
    "currency": "USD",
    "currencySymbol": "$",
    "subscriptionDistribution": [
      { "status": "ACTIVE", "count": 4, "percentage": 80.0 },
      { "status": "PAUSED", "count": 1, "percentage": 20.0 }
    ],
    "invoiceDistribution": [
      { "status": "PAID", "count": 6 },
      { "status": "UNPAID", "count": 1 },
      { "status": "PARTIALLY_PAID", "count": 1 },
      { "status": "OVERDUE", "count": 1 }
    ],
    "recentActivities": [
      {
        "id": "act-pay-...",
        "type": "PAYMENT",
        "title": "Payment Received",
        "description": "Payment of $2,400 recorded for Acme Retail Corp",
        "date": "2026-10-31T05:30:00.000Z",
        "status": "COMPLETED"
      }
    ]
  }
}
```

### 15.2 Revenue Analytics
- **Endpoint**: `GET /api/analytics/revenue`
- **Query Parameters**:
  - `period`: `last_7_days`, `last_30_days`, `last_3_months`, `last_6_months`, `this_year`
  - `startDate`: Custom ISO start date
  - `endDate`: Custom ISO end date
- **Returns**: `summary` (totalRevenue, paymentCount, averagePayment), `monthlyRevenue` array, and `revenueTrends` time series.

### 15.3 Monthly Revenue Breakdown
- **Endpoint**: `GET /api/analytics/revenue/monthly`
- **Returns**: Monthly aggregated revenue and transaction counts.

### 15.4 Revenue Summary
- **Endpoint**: `GET /api/analytics/revenue/summary`
- **Returns**: Total collected revenue, number of successful payments, and average payment amount.

### 15.5 Subscription Analytics
- **Endpoint**: `GET /api/analytics/subscriptions`
- **Sub-endpoints**:
  - `GET /api/analytics/subscriptions/status` - Distribution by status for donut/pie charts
  - `GET /api/analytics/subscriptions/trends` - Subscriptions created over time

### 15.6 Invoice Statistics & Outstanding Receivables
- **Endpoint**: `GET /api/analytics/invoices`
- **Sub-endpoints**:
  - `GET /api/analytics/invoices/status` - Invoice distribution for bar charts
  - `GET /api/analytics/invoices/outstanding` - Table of outstanding receivables with overdue flags (`isOverdue: true`)

### 15.7 Payment Analytics & Methods Distribution
- **Endpoint**: `GET /api/analytics/payments`
- **Sub-endpoints**:
  - `GET /api/analytics/payments/methods` - Payments grouped by method (`UPI`, `Card`, `Bank Transfer`, `Cash`, `Other`)

### 15.8 Customer Analytics
- **Endpoint**: `GET /api/analytics/customers`
- **Sub-endpoints**:
  - `GET /api/analytics/customers/growth` - Customer registrations over time
  - `GET /api/analytics/customers/top` - Customers ranked by actual payments received

### 15.9 Demo Data Seeder Helper
- **Endpoint**: `POST /api/analytics/seed-demo`
- **Description**: Populates realistic historical records for evaluator demonstrations.

---

## 16. Financial & Operational Reports (`/api/reports`) — Member 4

Supports both JSON structured output and direct RFC 4180 CSV export download (`?format=csv` or `?export=csv`).

| Endpoint | Report Type | Filters | CSV Export URL |
|---|---|---|---|
| `GET /api/reports/revenue` | Revenue Report | `startDate`, `endDate` | `/api/reports/revenue?format=csv` |
| `GET /api/reports/subscriptions` | Subscription Report | `startDate`, `endDate`, `status` | `/api/reports/subscriptions?format=csv` |
| `GET /api/reports/invoices` | Invoice Report | `startDate`, `endDate`, `status` | `/api/reports/invoices?format=csv` |
| `GET /api/reports/payments` | Payment Report | `startDate`, `endDate`, `method` | `/api/reports/payments?format=csv` |
| `GET /api/reports/customers` | Customer Report | `startDate`, `endDate` | `/api/reports/customers?format=csv` |
```

