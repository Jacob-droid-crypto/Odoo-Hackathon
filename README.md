# Brightloop Subscription Management System
> **Odoo Hackathon 8-Hour Project**

## Tech Stack
- **Node.js** (v24+)
- **Express.js** (v5)
- **PostgreSQL**
- **Prisma ORM** (v6)
- **JWT** (`jsonwebtoken`)
- **bcrypt** (`bcryptjs`)
- **Zod** (Request validation)

---

## Member 2: Backend & Authentication Lead Deliverables

All 13 core responsibilities have been architected and implemented:

1. **Express Backend**: Configured modular Express architecture with security (`helmet`), CORS, body parsers, logging (`morgan`), and route aggregation.
2. **PostgreSQL Connectivity**: Connected via Prisma ORM client with health checking (`/api/health`) and seamless dev/test fallback.
3. **Common Database Schema**: 11 coordinated database models defined in `prisma/schema.prisma` covering Users, Roles, Products, Variants, Plans, Quotations, Subscriptions, Invoices, Discounts, Taxes, and Payments.
4. **Customer Registration & Login**: Customer registration with password complexity enforcement, duplicate email prevention, and JWT token issuing.
5. **JWT Authentication**: Reusable `authenticate` middleware validating Bearer tokens.
6. **Password Hashing & Validation**: `bcrypt` password hashing with salt rounds >= 10. Validates password complexity: > 8 characters, uppercase, lowercase, and special character.
7. **Role-Based Access Control**: Reusable `authorize(...roles)` middleware supporting `ADMIN`, `STAFF`, and `CUSTOMER`.
8. **Admin-Only Staff Accounts**: `POST /api/users/staff` restricted exclusively to `ADMIN` users.
9. **Product CRUD APIs**: Full product lifecycle management (name, type, sales price, cost price, notes, active status).
10. **Product Variant Management**: Custom attributes and price adders (e.g. brand selection adding 560 to price).
11. **Subscription Plan CRUD APIs**: Plan creation, retrieval, updates, and deactivation.
12. **Billing Intervals**: Support for `DAILY`, `WEEKLY`, `MONTHLY`, and `YEARLY` intervals with policy flags (`autoClose`, `allowEarlyClose`, `allowPause`, `allowRenew`).
13. **Validation & Error Handling**: Comprehensive Zod validation on all endpoints and centralized error handler handling unique constraints, 404s, and 500s.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Prisma Client Generation & Migrations
```bash
npm run prisma:generate
npm run prisma:push      # or npm run prisma:migrate
npm run prisma:seed      # Seeds default Admin, Staff, Customer, and sample data
```

### 4. Run the Backend Server
```bash
# Production mode
npm start

# Development mode with hot-reload
npm run dev
```
Server runs at `http://localhost:5000`.

### 5. Run the Automated Test Suite
```bash
npm test
```
All 32 test cases verify authentication, RBAC, products, variants, and plans.

---

## API Documentation
See [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) for full endpoint contracts, payloads, and integration guides for Frontend and teammates.
