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

## 9. Integration Guide for Other Team Members

- **Member 1 (Frontend)**:
  - Base URL: `http://localhost:5000/api`
  - Save `token` in `localStorage` upon login or registration.
  - Send `Authorization: Bearer <token>` with API calls.
  - Role check in response: `res.data.user.role` determines whether to render the Admin Dashboard, Staff Portal, or Customer Portal.
- **Member 3 (Subscriptions & Quotations)**:
  - Leverage `User`, `Product`, `ProductVariant`, and `SubscriptionPlan` models directly from the schema.
  - Quotation and Subscription models are ready in [`prisma/schema.prisma`](./prisma/schema.prisma).
- **Member 4 (Invoicing, Discounts, Payments)**:
  - `TaxRule`, `DiscountRule`, `Invoice`, `InvoiceLine`, and `Payment` models are ready in [`prisma/schema.prisma`](./prisma/schema.prisma).
