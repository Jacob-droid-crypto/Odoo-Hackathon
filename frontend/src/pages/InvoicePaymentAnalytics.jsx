import React, { useState, useEffect } from 'react';
import {
  Receipt,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  DollarSign
} from 'lucide-react';
import { analyticsApi } from '../services/analyticsApi';
import { formatCurrency } from '../utils/formatCurrency';
import { InvoiceChart } from '../components/dashboard/InvoiceChart';
import { PaymentChart } from '../components/dashboard/PaymentChart';

export const InvoicePaymentAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [inv, pay] = await Promise.all([
          analyticsApi.getInvoiceAnalytics(),
          analyticsApi.getPaymentAnalytics()
        ]);
        setInvoiceData(inv);
        setPaymentData(pay);
      } catch (err) {
        console.error('Failed to load invoice & payment analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const invStats = invoiceData?.statistics || {};
  const payStats = paymentData?.statistics || {};
  const outstandingInvoices = invoiceData?.outstandingInvoices || [];
  const recentPayments = paymentData?.recentPayments || [];

  const currencyCode = invStats.currency || 'USD';
  const currencySymbol = invStats.currencySymbol || '$';

  const filteredOutstanding = outstandingInvoices.filter((inv) => {
    return (
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Invoices & Payment Analytics
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Financial ledger monitoring, payment channels, and overdue debt management
        </p>
      </div>

      {/* Invoice Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Total Invoiced
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatCurrency(invStats.totalInvoiceAmount ?? 0, currencyCode, currencySymbol)}
          </p>
          <p className="mt-1 text-[10px] text-slate-400">All billings generated</p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 shadow-xs">
          <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">
            Total Paid
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-700">
            {formatCurrency(invStats.totalPaidAmount ?? 0, currencyCode, currencySymbol)}
          </p>
          <p className="mt-1 text-[10px] text-emerald-600/70">Verified collected revenue</p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-4 shadow-xs">
          <p className="text-[11px] font-medium text-amber-700 uppercase tracking-wider">
            Unpaid Balance
          </p>
          <p className="mt-1 text-xl font-bold text-amber-700">
            {formatCurrency(invStats.totalUnpaidAmount ?? 0, currencyCode, currencySymbol)}
          </p>
          <p className="mt-1 text-[10px] text-amber-600/70">Pending customer settlement</p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 shadow-xs">
          <p className="text-[11px] font-medium text-blue-700 uppercase tracking-wider">
            Partially Paid
          </p>
          <p className="mt-1 text-xl font-bold text-blue-700">
            {formatCurrency(invStats.totalPartiallyPaidAmount ?? 0, currencyCode, currencySymbol)}
          </p>
          <p className="mt-1 text-[10px] text-blue-600/70">Partial ledger receipts</p>
        </div>

        <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4 shadow-xs">
          <p className="text-[11px] font-medium text-rose-700 uppercase tracking-wider">
            Overdue Amount
          </p>
          <p className="mt-1 text-xl font-bold text-rose-700">
            {formatCurrency(invStats.totalOverdueAmount ?? 0, currencyCode, currencySymbol)}
          </p>
          <p className="mt-1 text-[10px] text-rose-600/70">Past due date</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvoiceChart
          data={invoiceData?.statusDistribution || []}
          outstandingAmount={invStats.totalUnpaidAmount || 0}
          currencyCode={currencyCode}
          currencySymbol={currencySymbol}
        />
        <PaymentChart
          data={paymentData?.paymentMethods || []}
          currencyCode={currencyCode}
          currencySymbol={currencySymbol}
        />
      </div>

      {/* Outstanding Payments Table with Overdue Highlighting */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Outstanding Payments Table</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Receivables requiring payment reconciliation (Overdue invoices highlighted in red)
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Invoice Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Outstanding Balance</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOutstanding.length > 0 ? (
                filteredOutstanding.map((inv) => (
                  <tr
                    key={inv.id}
                    className={`transition-colors ${
                      inv.isOverdue
                        ? 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-rose-500'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{inv.customerName}</div>
                      <div className="text-[10px] text-slate-400">{inv.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{inv.invoiceDate}</td>
                    <td className={`py-3 px-4 font-medium ${inv.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                      {inv.dueDate}
                      {inv.isOverdue && (
                        <span className="ml-1.5 inline-flex items-center text-[10px] text-rose-600 font-bold">
                          (OVERDUE)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(inv.totalAmount, currencyCode, currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-emerald-600">
                      {formatCurrency(inv.amountPaid, currencyCode, currencySymbol)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(inv.outstandingBalance, currencyCode, currencySymbol)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          inv.isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {inv.isOverdue ? 'OVERDUE' : inv.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No outstanding invoices found. All billings are settled!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payments History Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900">Recent Payment Transactions</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Confirmed transaction ledger ({payStats.totalSuccessfulPayments || 0} successful recorded)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">Payment #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-600">
                    {p.paymentNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{p.paymentDate}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{p.customerName}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{p.invoiceNumber}</td>
                  <td className="py-3 px-4 font-medium uppercase text-slate-700">{p.paymentMethod}</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">
                    {formatCurrency(p.amount, currencyCode, currencySymbol)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
