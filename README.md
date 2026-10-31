# Brightloop Subscription Management System
> **Odoo Hackathon Fullstack Project**

Brightloop is a complete, human-centered Subscription Management System built with the **Dot Matrix** visual direction inspired by Kindred. It features real-time role-based access control (`ADMIN`, `STAFF`, `CUSTOMER`), dynamic product catalog with variant adders (e.g. Odoo brand +$560), recurring interval engines (Daily, Weekly, Monthly, Yearly), live canvas artwork, and resilient backend architecture.

---

## Tech Stack

### Frontend (`frontend/`)
- **React 18** with TypeScript & Vite v5
- **Tailwind CSS** with Kindred Dot-Matrix design system tokens
- **Lucide Icons**
- **Interactive HTML5 Canvas** (`DotMatrixHands.tsx`): 20s counter-phase drifting hands, luminance quantization, scanline displacement glitch dissolve, high-DPI scaling, and graceful algorithmic fallback
- **Centralized Axios Client**: JWT Bearer token interceptor, unified error mapping, automatic session recovery
- **Role-Based Protected Routes**: Strict route guard isolation for Admin, Staff, and Customer

### Backend (`src/`)
- **Node.js** (v24+) & **Express.js** (v5)
- **PostgreSQL** & **Prisma ORM** (v6)
- **In-Memory Store Fallback**: High-speed, resilient testing and evaluation mode pre-seeded with sample data when PostgreSQL is offline
- **JWT** (`jsonwebtoken`) & **bcrypt** (`bcryptjs`, salt rounds &ge; 10)
- **Password Policy**: Strict enforcement (> 8 characters, uppercase, lowercase, special symbol)
- **Zod**: Runtime schema validation on all inputs
- **Supertest & Node Test Runner**: 48/48 tests passing (100% test pass rate across 5 test suites)

---

## Member 1: Frontend & UI/UX Lead Deliverables

1. **Kindred Dot-Matrix Live Canvas (`DotMatrixHands.tsx`)**: Reusable HTML5 Canvas component executing high-DPI rendering, 20-second counter-phase drifting loop, smoothstep pose switching, row-biased glitch dissolve, and headline quiet zones.
2. **Minimal Landing Page**: Editorial typography, responsive navigation, platform introduction, subscription workflow diagram, and real-time backend health check.
3. **Role-Based Portals**:
   - **Admin Workspace**: Product catalog CRUD, variant adder manager (+560 adder), subscription plans builder, customer directory, staff provisioning, and system health inspector.
   - **Staff Workspace**: Operational dashboard, customer queue lookup, read-only catalog, and quotation processing.
   - **Customer Portal**: Self-service subscription overview, itemized variant adders, available plan comparisons, invoices, and profile.
4. **Coordinated Lifecycle Workspaces**: Full UI interfaces with honest state machine diagrams for Quotations, Subscriptions, Invoices, Discounts, Taxes, Payments, and Revenue Reports.
5. **Centralized Authentication**: Login, customer registration, forgot password, and reset password with real-time complexity validation and one-click demo logins.

---

## Member 2: Backend & Authentication Lead Deliverables

All 13 core responsibilities have been architected and implemented:
1. **Express Backend**: Modular Express architecture with security (`helmet`), CORS, body parsers, logging (`morgan`), and route aggregation.
2. **PostgreSQL Connectivity**: Connected via Prisma ORM client with health checking (`/api/health`) and seamless dev/test fallback.
3. **Common Database Schema**: 11 coordinated database models defined in `prisma/schema.prisma` covering Users, Roles, Products, Variants, Plans, Quotations, Subscriptions, Invoices, Discounts, Taxes, and Payments.
4. **Customer Registration & Login**: Customer registration with password complexity enforcement, duplicate email prevention, and JWT token issuing.
5. **JWT Authentication**: Reusable `authenticate` middleware validating Bearer tokens.
6. **Password Hashing & Validation**: `bcrypt` password hashing with salt rounds >= 10.
7. **Role-Based Access Control**: Reusable `authorize(...roles)` middleware supporting `ADMIN`, `STAFF`, and `CUSTOMER`.
8. **Admin-Only Staff Accounts**: `POST /api/users/staff` restricted exclusively to `ADMIN` users.
9. **Product CRUD APIs**: Full product lifecycle management.
10. **Product Variant Management**: Custom attributes and price adders (e.g. brand selection adding 560 to price).
11. **Subscription Plan CRUD APIs**: Plan creation, retrieval, updates, and deactivation.
12. **Billing Intervals**: Support for `DAILY`, `WEEKLY`, `MONTHLY`, and `YEARLY` intervals with policy flags (`autoClose`, `allowEarlyClose`, `allowPause`, `allowRenew`).
13. **Validation & Error Handling**: Comprehensive Zod validation on all endpoints and centralized error handler.

---

## Member 3: Subscription Management & Billing Engine Deliverables

All 5 core responsibilities and 14 testing scenarios have been implemented:
1. **Subscription Management**: Complete CRUD (`POST /api/subscriptions`, `GET /api/subscriptions`, `GET /api/subscriptions/:id`, `PUT /api/subscriptions/:id`) with quantity, plan, variant, and automatic calculation of unit price, totals, and `nextBillingDate`.
2. **Subscription Lifecycle State Machine**: Implemented strict transition validation (`DRAFT` -> `QUOTATION` -> `CONFIRMED` -> `ACTIVE` -> `PAUSED` -> `ACTIVE` -> `CLOSED`).
3. **Automatic Invoice Generation**: Automatically triggers upon subscription activation and recurring billing due date (`POST /api/invoices/generate`).
4. **Duplicate Prevention & Database Transactions**: Prevents duplicate invoices for the same subscription and billing cycle (returns `409 Conflict`).
5. **Tax & Discount Calculations**: Formula calculation for subtotals, percentage/fixed discounts, and tax rates (`POST /api/billing/calculate`).
6. **Payment Management & Tracking**: Manual/simulated payment recording (`POST /api/payments`).
7. **Recurring Billing Engine**: Automated recurring billing engine runner (`POST /api/billing/run`) and due subscriptions discovery (`GET /api/billing/due-subscriptions`).
8. **Member 4 Analytics Integration**: Dedicated analytics endpoint (`GET /api/billing/analytics`).

---

## Quick Start & Running the Application

### 1. Install Dependencies
```bash
# In repository root
npm install
npm run prisma:generate
```

### 2. Run Automated Test Suite
```bash
npm test
# All 48 tests pass across 5 test suites
```

### 3. Run Backend Server
```bash
npm start   # http://localhost:5000
```

### 4. Run Frontend Development Server
```bash
npm run frontend:dev   # http://localhost:5173
```

### 5. Build Frontend for Production
```bash
npm run frontend:build
```

---

## Pre-Seeded Default Accounts for Demo & Evaluation

One-click demo buttons are available on the Login screen (`/login`) for instant testing:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **ADMIN** | `admin@brightloop.com` | `Admin@Brightloop123!` | Full system governance, product CRUD, variant adders, subscription plan creation, staff account generation (`POST /api/users/staff`), system health inspection. |
| **STAFF** | `staff@brightloop.com` | `Staff@Brightloop123!` | Operational workspace, customer directory search, read-only catalog and recurring plan consultation. Restricted from admin-only pricing and staff creation. |
| **CUSTOMER** | `customer@acme.com` | `Customer@Brightloop123!` | Self-service portal: own profile, active subscription details (SUB-2026-0001), itemized variant adders, invoice history, pause/resume policy actions, plan catalog. |

---

## Design System Tokens

| Token | Hex Value | Role |
|---|---|---|
| **Background Warm Off-White** | `#F7F7F5` | Main document canvas |
| **Primary Ink** | `#111111` | Editorial display headlines, high-contrast text |
| **Dot Black** | `#0D0D0D` | Canvas dots, active indicators, dark badges |
| **Muted Grey** | `#9A9A9A` | Secondary icons, captions |
| **Secondary Text** | `#7B7B7B` | Subheadings, descriptions |
| **Terracotta Accent** | `#D14836` | Accent tags, primary CTA emphasis |
| **Surface White** | `#FFFFFF` | Elevated cards, tables, modal dialogs |
| **Border Neutral** | `#E6E4DF` | Dividers, input borders, hairline table borders |
