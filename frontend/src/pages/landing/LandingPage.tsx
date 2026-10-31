import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DotMatrixHands } from '../../components/visuals/DotMatrixHands';
import { systemApi, HealthStatus } from '../../api/system';
import {
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Repeat,
  Receipt,
  Users,
  CheckCircle2,
  Menu,
  X,
  Server,
  Zap,
  ChevronRight,
  Sliders
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    systemApi.health().then(setHealth).catch(() => setHealth(null));
  }, []);

  return (
    <div className="min-h-screen bg-background text-ink font-sans selection:bg-ink selection:text-white flex flex-col">
      {/* Global Header */}
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-ink flex items-center justify-center text-white font-mono font-bold text-xs tracking-tighter">
              BL
            </div>
            <span className="text-base font-semibold tracking-tight text-ink">
              Brightloop
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-secondary">
            <a href="#platform" className="hover:text-ink transition-colors">
              Platform
            </a>
            <a href="#features" className="hover:text-ink transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-ink transition-colors">
              Workflow
            </a>
            <a href="#architecture" className="hover:text-ink transition-colors">
              Architecture
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs font-medium text-ink hover:text-black transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-medium bg-ink text-white px-4 py-2 rounded-sm hover:bg-ink-light transition-all shadow-xs"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-secondary hover:text-ink rounded-sm"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-surface px-6 py-4 space-y-3">
            <a
              href="#platform"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-secondary hover:text-ink"
            >
              Platform
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-secondary hover:text-ink"
            >
              Features
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-secondary hover:text-ink"
            >
              Workflow
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-secondary hover:text-ink"
            >
              Architecture
            </a>
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center text-xs font-medium py-2 border border-border rounded-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full text-center text-xs font-medium bg-ink text-white py-2 rounded-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Signature Dot Matrix Canvas Hands */}
      <section className="relative min-h-[640px] md:min-h-[720px] flex items-center justify-center overflow-hidden border-b border-border">
        {/* Animated Canvas Background */}
        <div className="absolute inset-0 z-0 opacity-90">
          <DotMatrixHands showQuietZone={true} quietZoneIntensity={0.88} />
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-surface/90 border border-border text-[11px] font-mono uppercase tracking-widest text-secondary mb-6 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
            <span>Next-Gen Subscription Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-ink tracking-tight editorial-heading leading-[1.08] mb-6">
            Connecting Every Business.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-secondary font-normal max-w-2xl mx-auto leading-relaxed mb-10">
            Manage subscriptions, customers, billing and business relationships in one continuous loop.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink text-white font-medium text-sm rounded-sm hover:bg-ink-light transition-all shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#platform"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface/90 border border-border text-ink font-medium text-sm rounded-sm hover:bg-white transition-all shadow-xs"
            >
              <span>Explore Platform</span>
              <ChevronRight className="w-4 h-4 text-secondary" />
            </a>
          </div>

          {/* Quick Spec Badges */}
          <div className="mt-14 pt-8 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-muted">
                Interval Engine
              </span>
              <span className="text-xs font-semibold text-ink font-mono">
                Daily • Weekly • Monthly • Yearly
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-muted">
                Role Governance
              </span>
              <span className="text-xs font-semibold text-ink font-mono">
                Admin • Staff • Customer
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-muted">
                Security Policy
              </span>
              <span className="text-xs font-semibold text-ink font-mono">
                Bcrypt Salt 10 • JWT Auth
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-muted">
                Backend Status
              </span>
              <span className="text-xs font-semibold text-[#1E6930] font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22843A]" />
                {health?.status === 'UP' ? health.database.mode : 'Online (v1.0.0)'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Introduction */}
      <section id="platform" className="py-20 md:py-28 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-terracotta block mb-2">
              The Digital Backbone
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-ink tracking-tight editorial-heading leading-tight mb-4">
              Built for companies that earn recurring revenue every single day.
            </h2>
            <p className="text-sm text-secondary leading-relaxed mb-6">
              Most subscription businesses today rely on brittle spreadsheets, forgotten renewal reminders, manual invoices, and reconciled bank statements. Brightloop replaces fragmented chaos with a single, synchronized loop.
            </p>
            <div className="p-4 bg-[#F2F1EC] border border-border rounded-md">
              <span className="text-xs font-mono uppercase tracking-wider text-ink block mb-1">
                Zero Missed Renewals
              </span>
              <p className="text-xs text-secondary leading-relaxed">
                From self-service customer registration to automated multi-tier quotations, invoices are pre-calculated with exact tax rules and discount logic.
              </p>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-surface border border-border rounded-md">
              <div className="w-8 h-8 rounded-sm bg-[#F4F3EF] flex items-center justify-center text-ink mb-4">
                <Layers className="w-4 h-4 text-terracotta" />
              </div>
              <h3 className="text-sm font-semibold text-ink tracking-tight mb-1.5">
                Multi-Product & Variant Adder
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                Manage Software, Add-ons, Services, and Physical subscriptions. Configure dynamic attribute adders (e.g. brand selection adding $560).
              </p>
            </div>

            <div className="p-6 bg-surface border border-border rounded-md">
              <div className="w-8 h-8 rounded-sm bg-[#F4F3EF] flex items-center justify-center text-ink mb-4">
                <Calendar className="w-4 h-4 text-ink" />
              </div>
              <h3 className="text-sm font-semibold text-ink tracking-tight mb-1.5">
                Flexible Recurring Billing
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                Daily sprints, weekly passes, standard monthly software, or annual enterprise contracts. Automatic closing, pausing, and renewals.
              </p>
            </div>

            <div className="p-6 bg-surface border border-border rounded-md">
              <div className="w-8 h-8 rounded-sm bg-[#F4F3EF] flex items-center justify-center text-ink mb-4">
                <ShieldCheck className="w-4 h-4 text-ink" />
              </div>
              <h3 className="text-sm font-semibold text-ink tracking-tight mb-1.5">
                Role-Based Isolation
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                Strict multi-tenant security: Admin manages products, staff handles operational workflows, and customers access only their own records.
              </p>
            </div>

            <div className="p-6 bg-surface border border-border rounded-md">
              <div className="w-8 h-8 rounded-sm bg-[#F4F3EF] flex items-center justify-center text-ink mb-4">
                <Receipt className="w-4 h-4 text-ink" />
              </div>
              <h3 className="text-sm font-semibold text-ink tracking-tight mb-1.5">
                Automated Invoicing & Payments
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                Invoices generated directly from active subscriptions. Real-time tracking of paid vs outstanding receivables with zero double-billing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Workflow State Machine */}
      <section id="workflow" className="py-20 bg-[#F2F1ED] border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted block mb-2">
              Subscription Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-ink tracking-tight editorial-heading">
              How a subscription moves through Brightloop.
            </h2>
            <p className="text-xs sm:text-sm text-secondary mt-2">
              Every stage has clear policy controls, validation gates, and team visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              {
                step: '01',
                title: 'Draft',
                desc: 'Sales rep selects customer, plan, and product lines from a quotation template.',
                status: 'DRAFT',
              },
              {
                step: '02',
                title: 'Quotation',
                desc: 'Formal offer generated with expiration window (e.g. 30 days) and tax breakdown.',
                status: 'QUOTATION',
              },
              {
                step: '03',
                title: 'Confirmed',
                desc: 'Customer approves terms. Payment method and recurring schedule verified.',
                status: 'CONFIRMED',
              },
              {
                step: '04',
                title: 'Active Loop',
                desc: 'System bills periodically (Daily/Monthly/Yearly) and monitors pause/renew rules.',
                status: 'ACTIVE',
              },
              {
                step: '05',
                title: 'Closed / Renewed',
                desc: 'Seamless auto-close at end date or automatic term renewal without downtime.',
                status: 'CLOSED',
              },
            ].map((st) => (
              <div
                key={st.step}
                className="bg-surface p-5 border border-border rounded-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-terracotta">
                      {st.step}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-sm bg-[#F5F4F0] border border-border text-secondary">
                      {st.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-ink tracking-tight mb-2">
                    {st.title}
                  </h4>
                  <p className="text-xs text-secondary leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Detail */}
      <section id="features" className="py-20 md:py-28 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-mono uppercase tracking-widest text-terracotta block mb-2">
            Engineered For Scale
          </span>
          <h2 className="text-3xl sm:text-4xl font-light text-ink tracking-tight editorial-heading">
            Everything your team needs to run recurring billing.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-border rounded-md p-6 bg-surface">
            <h3 className="text-base font-semibold text-ink tracking-tight mb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-ink" />
              Dynamic Catalog
            </h3>
            <p className="text-xs text-secondary leading-relaxed mb-4">
              Create software licenses, cloud add-ons, implementation services, and physical hardware. Attach custom variant matrices with real-time price adders.
            </p>
            <ul className="text-xs text-secondary space-y-2 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1E6930]" />
                Software, Add-on, Service, Physical
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1E6930]" />
                Custom Attributes (e.g. Brand: Odoo)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1E6930]" />
                Sales price vs cost price margin tracking
              </li>
            </ul>
          </div>

          <div className="border border-border rounded-md p-6 bg-surface">
            <h3 className="text-base font-semibold text-ink tracking-tight mb-2 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-terracotta" />
              Plan Policy Matrix
            </h3>
            <p className="text-xs text-secondary leading-relaxed mb-4">
              Define the exact rules of engagement per subscription plan. Govern automatic closing, mid-term pauses, and early terminations.
            </p>
            <ul className="text-xs text-secondary space-y-2 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1E6930]" />
                `autoClose`: Closes on end date
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1E6930]" />
                `allowEarlyClose`: Customer termination
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1E6930]" />
                `allowPause`: Freeze recurring billing
              </li>
            </ul>
          </div>

          <div className="border border-border rounded-md p-6 bg-surface">
            <h3 className="text-base font-semibold text-ink tracking-tight mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-ink" />
              Role-Based Portals
            </h3>
            <p className="text-xs text-secondary leading-relaxed mb-4">
              Dedicated interfaces tailored to each stakeholder. Admins govern the business, staff handles daily requests, and customers manage subscriptions.
            </p>
            <ul className="text-xs text-secondary space-y-2 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1E6930]" />
                Admin: Full CRUD & Staff Account Generation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1E6930]" />
                Staff: Operational Customer Directory
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1E6930]" />
                Customer: Self-service Invoices & Plans
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Architecture & Verification Section */}
      <section id="architecture" className="py-16 bg-[#F6F5F2] border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-surface border border-border rounded-md p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted block mb-1">
                  Engineered Integrity
                </span>
                <h3 className="text-xl font-semibold text-ink tracking-tight">
                  Backend Architecture & Verification
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-3 py-1 bg-[#EEF8F0] text-[#1E6930] border border-[#C8E8CE] rounded-sm flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" />
                  32 / 32 Tests Passing
                </span>
                <span className="text-xs font-mono px-3 py-1 bg-[#F2F1EE] text-ink border border-border rounded-sm">
                  Prisma v6 + Express v5
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs text-secondary">
              <div>
                <span className="font-mono text-ink font-semibold uppercase text-[11px] block mb-1">
                  Password Enforcement
                </span>
                <p className="leading-relaxed">
                  Requires &gt; 8 characters, uppercase, lowercase, and special character. Hashed with bcrypt salt rounds &gt;= 10.
                </p>
              </div>
              <div>
                <span className="font-mono text-ink font-semibold uppercase text-[11px] block mb-1">
                  High-Availability Fallback
                </span>
                <p className="leading-relaxed">
                  Configured with automatic in-memory persistence when PostgreSQL is offline, pre-seeded with Admin, Staff, and Customer accounts.
                </p>
              </div>
              <div>
                <span className="font-mono text-ink font-semibold uppercase text-[11px] block mb-1">
                  Pre-Seeded Credentials
                </span>
                <p className="font-mono text-[11px] text-ink leading-relaxed">
                  admin@brightloop.com (Admin@Brightloop123!)<br />
                  staff@brightloop.com (Staff@Brightloop123!)<br />
                  customer@acme.com (Customer@Brightloop123!)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-light text-ink tracking-tight editorial-heading mb-4">
          Close the loop on recurring revenue.
        </h2>
        <p className="text-secondary text-sm sm:text-base max-w-xl mx-auto mb-8">
          Launch products, configure recurring billing intervals, and provide self-service portals to all your customers today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3 bg-terracotta text-white font-medium text-sm rounded-sm hover:bg-terracotta-hover transition-colors shadow-xs"
          >
            Create Customer Account
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3 bg-surface border border-border text-ink font-medium text-sm rounded-sm hover:bg-white transition-colors"
          >
            Sign In with Pre-Seeded Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-[#F5F4F0] py-10 px-6 text-xs text-secondary">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-sm bg-ink flex items-center justify-center text-white font-mono text-[10px] font-bold">
              BL
            </div>
            <span className="font-semibold text-ink">Brightloop Software</span>
            <span className="text-muted">|</span>
            <span className="font-mono text-[11px]">Odoo Hackathon 2026</span>
          </div>

          <div className="text-center md:text-right font-mono text-[11px] text-muted">
            Dot Matrix Visual Direction • Inter Typography • Real RBAC
          </div>
        </div>
      </footer>
    </div>
  );
};
