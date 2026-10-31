import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { HonestModuleBanner } from '../../components/ui/HonestModuleBanner';
import { Receipt, Download, Eye, CheckCircle2, DollarSign } from 'lucide-react';

export const CustomerInvoicesPage: React.FC = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const sampleInvoices = [
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2026-0001',
      issuedDate: 'Oct 01, 2026',
      dueDate: 'Oct 31, 2026',
      subtotal: 1760.0,
      taxTotal: 316.8,
      discountTotal: 0.0,
      totalAmount: 2076.8,
      status: 'PAID',
      paidAt: 'Oct 28, 2026',
      lines: [
        { desc: 'Brightloop ERP Business Software Core Monthly', qty: 1, unit: 1200.0, total: 1200.0 },
        { desc: 'Variant Adder: Brand (Odoo Integration)', qty: 1, unit: 560.0, total: 560.0 },
      ],
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-2026-0002',
      issuedDate: 'Nov 01, 2026',
      dueDate: 'Dec 01, 2026',
      subtotal: 1760.0,
      taxTotal: 316.8,
      discountTotal: 0.0,
      totalAmount: 2076.8,
      status: 'CONFIRMED',
      paidAt: null,
      lines: [
        { desc: 'Brightloop ERP Business Software Core Monthly', qty: 1, unit: 1200.0, total: 1200.0 },
        { desc: 'Variant Adder: Brand (Odoo Integration)', qty: 1, unit: 560.0, total: 560.0 },
      ],
    },
  ];

  return (
    <DashboardLayout
      title="Invoices & Billing History"
      subtitle="View itemized billing records, tax calculations, and payment receipts."
      breadcrumbs={[{ label: 'Customer', href: '/customer/dashboard' }, { label: 'Invoices' }]}
    >
      <HonestModuleBanner
        moduleName="Customer Invoicing Portal"
        assignedRoleOrMember="Member 4 (Invoicing & Billing Lead)"
        modelNames={['Invoice', 'InvoiceLine', 'TaxRule', 'Payment']}
        workflowStages={['DRAFT', 'CONFIRMED', 'PAID', 'OVERDUE']}
        note="Tenant isolation: Each customer can only see invoices associated with their account. Invoices are generated automatically on billing day."
      />

      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-border font-mono uppercase tracking-wider text-[10px] text-muted">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Tax Total (18%)</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sampleInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#FAF9F6] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-ink">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-secondary">{inv.issuedDate}</td>
                  <td className="py-3.5 px-4 font-mono text-secondary">{inv.dueDate}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-secondary">
                    ${inv.subtotal.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-muted">
                    +${inv.taxTotal.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-ink">
                    ${inv.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant={inv.status === 'PAID' ? 'paid' : 'confirmed'} dot>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="p-1 text-secondary hover:text-ink hover:bg-[#F2F1EE] rounded-sm transition-colors"
                      title="Inspect Invoice"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Dialog */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice?.invoiceNumber || 'Invoice Details'}
        subtitle={`Issued: ${selectedInvoice?.issuedDate}`}
        maxWidth="lg"
      >
        {selectedInvoice && (
          <div className="space-y-6 text-xs font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted block">Billed To</span>
                <span className="font-semibold text-ink text-sm">Acme Retail Corp</span>
                <span className="text-secondary block font-mono text-[11px]">alice@acme.com</span>
              </div>
              <div className="text-right">
                <Badge variant={selectedInvoice.status === 'PAID' ? 'paid' : 'confirmed'} dot>
                  {selectedInvoice.status}
                </Badge>
                {selectedInvoice.paidAt && (
                  <span className="text-[10px] font-mono text-[#1E6930] block mt-1">
                    Paid on {selectedInvoice.paidAt}
                  </span>
                )}
              </div>
            </div>

            {/* Lines */}
            <div className="border border-border rounded-sm overflow-hidden font-mono text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#FAF9F6] border-b border-border text-[10px] uppercase text-muted">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedInvoice.lines.map((l: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 font-sans text-ink">{l.desc}</td>
                      <td className="py-2.5 px-3 text-center">{l.qty}</td>
                      <td className="py-2.5 px-3 text-right">${l.unit.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-ink font-semibold">
                        ${l.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#FAF9F5] p-4 border border-border rounded-sm space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-secondary">
                <span>Subtotal:</span>
                <span>${selectedInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Standard VAT (18.00%):</span>
                <span>+${selectedInvoice.taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-ink text-sm pt-2 border-t border-border">
                <span>Grand Total:</span>
                <span>${selectedInvoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                Print / Save PDF
              </Button>
              <Button size="sm" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};
