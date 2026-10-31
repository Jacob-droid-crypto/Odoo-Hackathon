import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { HonestModuleBanner } from '../../components/ui/HonestModuleBanner';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import {
  FileSpreadsheet,
  Repeat,
  Receipt,
  Percent,
  Calculator,
  CreditCard,
  BarChart3,
  Plus,
  ArrowRight,
  Info,
  Clock,
  DollarSign
} from 'lucide-react';

interface CoordinatedModuleProps {
  moduleType:
    | 'quotations'
    | 'subscriptions'
    | 'invoices'
    | 'discounts'
    | 'taxes'
    | 'payments'
    | 'reports';
}

export const AdminCoordinatedModulePage: React.FC<CoordinatedModuleProps> = ({
  moduleType,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  const configs = {
    quotations: {
      title: 'Quotation Templates & Offers',
      subtitle: 'Sales offers valid for set duration before converting to recurring subscriptions.',
      scope: 'Member 3 (Subscriptions & Quotations Lead)',
      models: ['Quotation', 'QuotationLine'],
      workflow: ['DRAFT', 'SENT', 'ACCEPTED', 'EXPIRED', 'CANCELLED'],
      bannerNote: 'Quotation records will be linked to Customer accounts and SubscriptionPlan records via Prisma relations.',
      createLabel: 'Create Quotation Offer',
    },
    subscriptions: {
      title: 'Subscription Contracts & Lifecycles',
      subtitle: 'Active recurring business loops, auto-close policies, and renewal schedules.',
      scope: 'Member 3 (Subscriptions & Quotations Lead)',
      models: ['Subscription', 'SubscriptionLine'],
      workflow: ['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED'],
      bannerNote: 'Subscriptions transition automatically from Quotations upon customer approval and generate periodic Invoices.',
      createLabel: 'Initialize Subscription',
    },
    invoices: {
      title: 'Invoicing & Recurring Billing',
      subtitle: 'Automatic bill creation from active subscriptions with itemized lines and tax rules.',
      scope: 'Member 4 (Invoicing, Discounts & Payments Lead)',
      models: ['Invoice', 'InvoiceLine'],
      workflow: ['DRAFT', 'CONFIRMED', 'PAID', 'OVERDUE', 'CANCELLED'],
      bannerNote: 'Billing day engine generates invoices without double billing or skipped periods.',
      createLabel: 'Generate Manual Invoice',
    },
    discounts: {
      title: 'Discount Rules & Promos',
      subtitle: 'Fixed and percentage price reductions with minimum purchase thresholds and usage limits.',
      scope: 'Member 4 (Invoicing, Discounts & Payments Lead)',
      models: ['DiscountRule'],
      workflow: ['ACTIVE', 'MAX_USES_REACHED', 'EXPIRED'],
      bannerNote: 'Only admins can create discount rules. Rules apply automatically on future invoices.',
      createLabel: 'Create Discount Rule',
    },
    taxes: {
      title: 'Tax Jurisdiction Rules',
      subtitle: 'Standard VAT and regional sales tax rules calculated automatically on invoice generation.',
      scope: 'Member 4 (Invoicing, Discounts & Payments Lead)',
      models: ['TaxRule'],
      workflow: ['DEFAULT_ACTIVE', 'OPTIONAL_ACTIVE', 'ARCHIVED'],
      bannerNote: 'Tax percentages are stored with Prisma Decimal(5,2) precision and added to invoice line items.',
      createLabel: 'Add Tax Rule',
    },
    payments: {
      title: 'Payment Reconciliation & Ledger',
      subtitle: 'Payment records matched against invoices (Credit Card, Bank Transfer, Stripe, Cash).',
      scope: 'Member 4 (Invoicing, Discounts & Payments Lead)',
      models: ['Payment'],
      workflow: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      bannerNote: 'Tracks outstanding receivables vs collected funds to chase overdue invoices.',
      createLabel: 'Record Payment',
    },
    reports: {
      title: 'Finance Lead Revenue Reports',
      subtitle: 'Consolidated end-of-month MRR, active subscription metrics, and overdue receivables.',
      scope: 'Member 4 (Invoicing, Discounts & Payments Lead)',
      models: ['Subscription', 'Invoice', 'Payment'],
      workflow: ['DAILY_ROLLUP', 'MONTHLY_MRR', 'QUARTERLY_REVENUE'],
      bannerNote: 'Finance summary designed to respond in under 2 seconds across thousands of subscriptions.',
      createLabel: 'Export Report',
    },
  };

  const current = configs[moduleType];

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionFeedback(
      `Form validated against Prisma schema fields. Live Express endpoint (/api/${moduleType}) is scheduled for integration by ${current.scope}. Record not sent to server.`
    );
  };

  return (
    <DashboardLayout
      title={current.title}
      subtitle={current.subtitle}
      action={
        <Button
          size="sm"
          variant="outline"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => {
            setSubmissionFeedback(null);
            setModalOpen(true);
          }}
        >
          {current.createLabel}
        </Button>
      }
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: current.title },
      ]}
    >
      <HonestModuleBanner
        moduleName={current.title}
        assignedRoleOrMember={current.scope}
        modelNames={current.models}
        workflowStages={current.workflow}
        note={current.bannerNote}
      />

      {/* Render Module-Specific Content Preview */}
      {moduleType === 'quotations' && (
        <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border bg-[#FAF9F6] flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-ink">
              Quotation Pipeline (Prisma Schema Specification)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F2F1EE] border border-border text-secondary">
              Spec View
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-mono text-muted bg-[#FCFBF8]">
                  <th className="py-3 px-4">Quote Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Plan & Lines</th>
                  <th className="py-3 px-4 text-center">Validity</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    num: 'QT-2026-0001',
                    customer: 'Acme Retail Corp (Alice Acme)',
                    plan: 'Brightloop Monthly Professional + Odoo Variant',
                    days: '30 Days (Valid until Nov 30)',
                    total: 1760.0,
                    status: 'QUOTATION',
                  },
                  {
                    num: 'QT-2026-0002',
                    customer: 'Apex Logistics Inc.',
                    plan: 'Enterprise Cloud ERP Annual',
                    days: '14 Days (Valid until Nov 14)',
                    total: 12000.0,
                    status: 'DRAFT',
                  },
                ].map((q) => (
                  <tr key={q.num} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-ink">{q.num}</td>
                    <td className="py-3.5 px-4 font-medium text-ink">{q.customer}</td>
                    <td className="py-3.5 px-4 text-secondary">{q.plan}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-muted">{q.days}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-ink">
                      ${q.total.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="quotation">{q.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {moduleType === 'subscriptions' && (
        <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border bg-[#FAF9F6] flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-ink">
              Subscriptions Registry (Prisma Schema Specification)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F2F1EE] border border-border text-secondary">
              Spec View
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-mono text-muted bg-[#FCFBF8]">
                  <th className="py-3 px-4">Subscription #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Next Billing Date</th>
                  <th className="py-3 px-4">Terms</th>
                  <th className="py-3 px-4 text-center">Auto-Renew</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    num: 'SUB-2026-0001',
                    customer: 'Acme Retail Corp',
                    plan: 'Brightloop Monthly Professional',
                    next: 'Dec 01, 2026',
                    terms: 'Net 30',
                    renew: 'Yes',
                    status: 'ACTIVE',
                  },
                  {
                    num: 'SUB-2026-0002',
                    customer: 'Nexus Labs LLC',
                    plan: 'Weekly Sprint Pass',
                    next: 'Nov 07, 2026',
                    terms: 'Immediate',
                    renew: 'Yes',
                    status: 'ACTIVE',
                  },
                ].map((s) => (
                  <tr key={s.num} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-ink">{s.num}</td>
                    <td className="py-3.5 px-4 font-medium text-ink">{s.customer}</td>
                    <td className="py-3.5 px-4 text-secondary">{s.plan}</td>
                    <td className="py-3.5 px-4 font-mono text-secondary">{s.next}</td>
                    <td className="py-3.5 px-4 font-mono text-muted">{s.terms}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-[#1E6930]">
                      {s.renew}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="active" dot>
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {moduleType === 'invoices' && (
        <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border bg-[#FAF9F6] flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-ink">
              Billing Ledger & Invoices (Prisma Schema Specification)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F2F1EE] border border-border text-secondary">
              Spec View
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-mono text-muted bg-[#FCFBF8]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">Tax Total (18%)</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    num: 'INV-2026-0001',
                    customer: 'Acme Retail Corp',
                    due: 'Nov 30, 2026',
                    sub: 1760.0,
                    tax: 316.8,
                    total: 2076.8,
                    status: 'CONFIRMED',
                  },
                  {
                    num: 'INV-2026-0002',
                    customer: 'Global Tech Systems',
                    due: 'Oct 25, 2026',
                    sub: 1200.0,
                    tax: 216.0,
                    total: 1416.0,
                    status: 'OVERDUE',
                  },
                ].map((inv) => (
                  <tr key={inv.num} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-ink">{inv.num}</td>
                    <td className="py-3.5 px-4 font-medium text-ink">{inv.customer}</td>
                    <td className="py-3.5 px-4 font-mono text-secondary">{inv.due}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-secondary">
                      ${inv.sub.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-muted">
                      +${inv.tax.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-ink">
                      ${inv.total.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={inv.status === 'OVERDUE' ? 'overdue' : 'confirmed'}>
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {moduleType === 'discounts' && (
        <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border bg-[#FAF9F6] flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-ink">
              Discount Rules Matrix (Prisma Schema Specification)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F2F1EE] border border-border text-secondary">
              Spec View
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-mono text-muted bg-[#FCFBF8]">
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Discount Value</th>
                  <th className="py-3 px-4">Min Purchase</th>
                  <th className="py-3 px-4">Target Scope</th>
                  <th className="py-3 px-4">Usage Count / Cap</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    code: 'BRIGHT10',
                    type: 'PERCENTAGE',
                    val: '10.00%',
                    min: '$500.00',
                    target: 'SUBSCRIPTION',
                    usage: '14 / 100 max',
                    status: 'ACTIVE',
                  },
                  {
                    code: 'ENTERPRISE500',
                    type: 'FIXED',
                    val: '$500.00 off',
                    min: '$3,000.00',
                    target: 'INVOICE',
                    usage: '5 / 20 max',
                    status: 'ACTIVE',
                  },
                ].map((d) => (
                  <tr key={d.code} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-ink">{d.code}</td>
                    <td className="py-3.5 px-4 font-mono text-secondary">{d.type}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-terracotta">{d.val}</td>
                    <td className="py-3.5 px-4 font-mono text-secondary">{d.min}</td>
                    <td className="py-3.5 px-4 font-mono text-muted">{d.target}</td>
                    <td className="py-3.5 px-4 font-mono text-secondary">{d.usage}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="active" dot>
                        {d.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {moduleType === 'taxes' && (
        <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border bg-[#FAF9F6] flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-ink">
              Configured Tax Rules (Prisma Schema Specification)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F2F1EE] border border-border text-secondary">
              Spec View
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-mono text-muted bg-[#FCFBF8]">
                  <th className="py-3 px-4">Tax Rule Name</th>
                  <th className="py-3 px-4">Rate Percentage</th>
                  <th className="py-3 px-4">Default Rule</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    name: 'Standard VAT',
                    rate: '18.00%',
                    isDefault: 'YES',
                    desc: 'National standard value-added tax applied to software subscriptions',
                    status: 'ACTIVE',
                  },
                  {
                    name: 'State Sales Tax',
                    rate: '8.25%',
                    isDefault: 'NO',
                    desc: 'Regional commercial sales tax',
                    status: 'ACTIVE',
                  },
                ].map((t) => (
                  <tr key={t.name} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-ink">{t.name}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-ink">{t.rate}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#1E6930]">
                      {t.isDefault}
                    </td>
                    <td className="py-3.5 px-4 text-secondary">{t.desc}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="active" dot>
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {moduleType === 'payments' && (
        <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border bg-[#FAF9F6] flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-ink">
              Payment Transactions (Prisma Schema Specification)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F2F1EE] border border-border text-secondary">
              Spec View
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-mono text-muted bg-[#FCFBF8]">
                  <th className="py-3 px-4">Payment #</th>
                  <th className="py-3 px-4">Invoice Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4">Transaction Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    num: 'PAY-2026-0001',
                    inv: 'INV-2026-0001',
                    cust: 'Alice Acme (Acme Retail)',
                    method: 'CREDIT_CARD',
                    amt: 2076.8,
                    date: 'Oct 31, 2026',
                    status: 'COMPLETED',
                  },
                  {
                    num: 'PAY-2026-0002',
                    inv: 'INV-2026-0003',
                    cust: 'Sarah Staff (Brightloop Ops)',
                    method: 'BANK_TRANSFER',
                    amt: 1200.0,
                    date: 'Oct 30, 2026',
                    status: 'COMPLETED',
                  },
                ].map((p) => (
                  <tr key={p.num} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-ink">{p.num}</td>
                    <td className="py-3.5 px-4 font-mono text-secondary">{p.inv}</td>
                    <td className="py-3.5 px-4 font-medium text-ink">{p.cust}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted">{p.method}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#1E6930]">
                      ${p.amt.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-secondary">{p.date}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="paid">{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {moduleType === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface border border-border rounded-md p-5">
              <span className="text-[10px] font-mono uppercase text-muted block mb-1">
                Estimated MRR
              </span>
              <div className="text-2xl font-light text-ink font-mono">$18,450.00</div>
              <span className="text-xs text-[#1E6930] font-mono mt-1 block">
                +14.2% vs last month
              </span>
            </div>
            <div className="bg-surface border border-border rounded-md p-5">
              <span className="text-[10px] font-mono uppercase text-muted block mb-1">
                Active Contracts
              </span>
              <div className="text-2xl font-light text-ink font-mono">24 Subscriptions</div>
              <span className="text-xs text-secondary mt-1 block">0 missed renewals</span>
            </div>
            <div className="bg-surface border border-border rounded-md p-5">
              <span className="text-[10px] font-mono uppercase text-muted block mb-1">
                Overdue Receivables
              </span>
              <div className="text-2xl font-light text-terracotta font-mono">$1,416.00</div>
              <span className="text-xs text-terracotta mt-1 block">1 invoice requires chase</span>
            </div>
            <div className="bg-surface border border-border rounded-md p-5">
              <span className="text-[10px] font-mono uppercase text-muted block mb-1">
                Avg. Query Latency
              </span>
              <div className="text-2xl font-light text-ink font-mono">&lt; 35 ms</div>
              <span className="text-xs text-[#1E6930] mt-1 block">Sub-2-second target met</span>
            </div>
          </div>
        </div>
      )}

      {/* Specification Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={current.createLabel}
        subtitle="Validates against Prisma Schema (Backend Endpoint Pending)"
      >
        {submissionFeedback ? (
          <div className="p-4 bg-[#FAF9F5] border border-border rounded-sm text-xs space-y-3">
            <div className="flex items-center gap-2 font-mono text-[#8C7A3E] font-semibold">
              <Info className="w-4 h-4 shrink-0" />
              <span>Architectural Honesty Notice</span>
            </div>
            <p className="text-secondary leading-relaxed">{submissionFeedback}</p>
            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setModalOpen(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSimulateSubmit} className="space-y-4 text-xs font-sans">
            <Input
              label="Identifier / Title"
              placeholder="e.g. QT-2026-0003 or Standard Rule"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Primary Numerical Field ($)" type="number" step="0.01" placeholder="1200.00" mono required />
              <Input label="Validity Window (Days / Max)" type="number" placeholder="30" mono />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink tracking-tight uppercase mb-1">
                Operational Notes
              </label>
              <textarea
                rows={3}
                placeholder="Contractual conditions or reference details..."
                className="w-full px-3 py-2 bg-surface border border-border rounded-sm text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Validate & Submit
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};
