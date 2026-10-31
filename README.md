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

---

## Member 3: Subscription Management & Billing Engine Deliverables

All 5 core responsibilities and 14 testing scenarios have been implemented:

1. **Subscription Management**: Complete CRUD (`POST /api/subscriptions`, `GET /api/subscriptions`, `GET /api/subscriptions/:id`, `PUT /api/subscriptions/:id`) with quantity, plan, variant, and automatic calculation of unit price, totals, and `nextBillingDate`.
2. **Subscription Lifecycle State Machine**: Implemented strict transition validation (`DRAFT` -> `QUOTATION` -> `CONFIRMED` -> `ACTIVE` -> `PAUSED` -> `ACTIVE` -> `CLOSED`). Closed subscriptions cannot be reactivated without renewal. Dedicated action endpoints (`/activate`, `/pause`, `/resume`, `/close`, `/renew`).
3. **Automatic Invoice Generation**: Automatically triggers upon subscription activation and recurring billing due date (`POST /api/invoices/generate`). Generates unique sequential `INV-YYYY-XXXX` invoice numbers, line items, and updates `nextBillingDate`.
4. **Duplicate Prevention & Database Transactions**: Prevents duplicate invoices for the same subscription and billing cycle (returns `409 Conflict`). All invoice and payment operations execute in database transactions (`prisma.$transaction`). Never generates invoices for paused or closed subscriptions.
5. **Tax & Discount Calculations**: Implemented mathematical formulas for subtotal, percentage discounts, fixed discounts, and configurable tax rates. Includes real-time preview endpoint (`POST /api/billing/calculate`).
6. **Payment Management & Tracking**: Manual/simulated payment recording (`POST /api/payments`) supporting UPI, Credit Card, Bank Transfer, Cash, and Stripe. Supports partial payments, verifies outstanding balance, rejects over-payments, and updates invoice status (`UNPAID` -> `PARTIALLY_PAID` -> `PAID`).
7. **Recurring Billing Engine**: Automated recurring billing engine runner (`POST /api/billing/run`) and due subscriptions discovery (`GET /api/billing/due-subscriptions`).
8. **Member 4 Analytics Integration**: Dedicated analytics endpoint (`GET /api/billing/analytics`) exposing total revenue, total invoiced, outstanding balances, active subscription counts, overdue counts, and status breakdowns.

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
All 48 test cases across 5 test suites verify Authentication, RBAC, Products, Variants, Plans, Subscriptions, Lifecycle transitions, Automatic Invoicing, Calculations, Payments, Billing Engine, and Analytics.

---

## Member 4: Analytics Dashboard, Financial Reporting & Frontend Integration Deliverables

All 9 core responsibilities and 15 testing scenarios have been implemented:

1. **Admin Analytics Dashboard**: Complete high-level executive dashboard featuring 8 summary KPI cards (Total Customers, Total Products, Active Subscriptions, Total Revenue, Total Invoices, Paid Invoices, Unpaid Invoices, Overdue Invoices), interactive revenue trends, subscription distribution donut, invoice status breakdown, payment channels, and live database activity feed.
2. **Revenue Analytics Engine**: Dedicated revenue analytics tracking collected revenue strictly from completed payments (`COMPLETED`), monthly revenue progressions, and month-over-month comparative visualizations. Includes date filters (`7days`, `30days`, `3months`, `6months`, `this_year`, custom ranges).
3. **Subscription Analytics**: Tracks subscription distribution by status (`ACTIVE`, `PAUSED`, `CLOSED`, `DRAFT`), creation trends over time, renewal alerts, and searchable/filterable subscription directory table.
4. **Invoice & Payment Analytics**: Tracks total receivables, paid, unpaid, and overdue amounts with calculated outstanding balances (`totalAmount - paidAmount`, excluding cancelled invoices). Breakdown of payment methods (UPI, Card, Bank Transfer, Cash, Stripe) with transaction history ledger.
5. **Customer Analytics**: Customer growth trends, customer subscription table, and top customer leaderboard ranked by actual payments received.
6. **Financial Reports & CSV Export**: Automated reporting module supporting 5 report categories (Revenue, Subscriptions, Invoices, Payments, Customers) with date range filters, search, and direct RFC 4180 CSV downloads via `?format=csv` streaming attachments.
7. **Interactive Modern SaaS Frontend**:
   - Built with **React 19**, **Vite 8**, **Tailwind CSS**, and **Recharts**.
   - Fully responsive layout featuring collapsible Sidebar navigation, top Navbar with search, live database status, notification bell, instant admin profile switcher, and demo data seeder.
   - 6 specialized view tabs: Overview Dashboard, Revenue Analytics, Subscriptions, Invoices & Payments, Customer Analytics, and Financial Reports.
   - Currency configured dynamically (`USD`, `INR`, `EUR`, `GBP`) via centralized utility without hardcoded symbols.
8. **Dual-Mode Backend Resilience**: All Member 4 services (`analyticsService.js`, `reportService.js`) dynamically support both PostgreSQL (via Prisma ORM) and the in-memory fallback store with idempotent demo seeding, ensuring seamless evaluation in any environment.
9. **Automated Testing Suite**: 8 comprehensive test suites verifying RBAC protection (401/403 for unauthorized users), accuracy of payment-based revenue calculations, status distributions, CSV file downloads, and demo seeding. All 56 test cases pass (100% pass rate).

---

## Getting Started

### 1. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm run frontend:install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Prisma Client Generation & Migrations (Optional / If PostgreSQL is running)
```bash
npm run prisma:generate
npm run prisma:push      # or npm run prisma:migrate
npm run prisma:seed      # Seeds default Admin, Staff, Customer, and sample data
```

### 4. Run the Application

#### Option A: Unified Full-Stack Server (Recommended for Evaluation)
Build the frontend and run the Express server:
```bash
npm run frontend:build
npm start
```
- Open `http://localhost:5000/dashboard` in your browser to access the complete SaaS Admin Dashboard.
- REST API is live at `http://localhost:5000/api`.

#### Option B: Standalone Frontend Dev Server (With Hot-Reload)
Run the backend and frontend in separate terminals:
```bash
# Terminal 1: Backend API
npm run dev

# Terminal 2: React + Vite Frontend
npm run frontend:dev
```
- Frontend Dev Server runs at `http://localhost:5173`.
- Backend API runs at `http://localhost:5000`.

### 5. Run the Automated Test Suite
```bash
npm test
```
All 56 test cases across 6 test suites verify Authentication, RBAC, Products, Plans, Subscriptions, Invoicing, Billing Engine, Analytics Dashboard, and CSV Financial Reports.

---

## API Documentation
See [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) for full endpoint contracts, payloads, and integration guides for Frontend and teammates.
