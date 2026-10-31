import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  FileText,
  DollarSign
} from 'lucide-react';
import { analyticsApi } from '../services/analyticsApi';
import { formatCurrency } from '../utils/formatCurrency';

export const FinancialReports = () => {
  const [reportCategory, setReportCategory] = useState('revenue');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [search, setSearch] = useState('');

  const categories = [
    { id: 'revenue', label: '1. Revenue Report' },
    { id: 'subscriptions', label: '2. Subscription Report' },
    { id: 'invoices', label: '3. Invoice Report' },
    { id: 'payments', label: '4. Payment Report' },
    { id: 'customers', label: '5. Customer Report' }
  ];

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await analyticsApi.getReport(reportCategory, params);
      setReportData(res);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportCategory]);

  const handleExportCsv = async () => {
    try {
      setDownloading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      await analyticsApi.downloadReportCsv(reportCategory, params);
    } catch (err) {
      console.error('Export CSV failed:', err);
      alert('Failed to download CSV: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const headers = reportData?.headers || [];
  const rows = reportData?.rows || [];
  const summary = reportData?.summary || {};

  const filteredRows = rows.filter((row) => {
    if (!search) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Financial & Operational Reports
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Generate and export real-time ledger records in CSV format
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={downloading || rows.length === 0}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className={`h-4 w-4 ${downloading ? 'animate-bounce' : ''}`} />
          <span>{downloading ? 'Exporting...' : 'Export to CSV'}</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setReportCategory(cat.id)}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              reportCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Date Range & Search Filters */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Date Range:</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={fetchReport}
              className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search report records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Report Summary Header */}
      {summary && (
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
          <span className="font-bold text-slate-900">{reportData?.reportType}</span>
          <span>•</span>
          <span>Total Records: <strong className="text-slate-900">{rows.length}</strong></span>
          {summary.totalRevenue !== undefined && (
            <>
              <span>•</span>
              <span>Total Revenue: <strong className="text-indigo-600">{formatCurrency(summary.totalRevenue, summary.currency)}</strong></span>
            </>
          )}
          {summary.totalInvoiced !== undefined && (
            <>
              <span>•</span>
              <span>Total Invoiced: <strong className="text-slate-900">{formatCurrency(summary.totalInvoiced, summary.currency)}</strong></span>
            </>
          )}
          {summary.totalOutstanding !== undefined && (
            <>
              <span>•</span>
              <span>Outstanding: <strong className="text-rose-600">{formatCurrency(summary.totalOutstanding, summary.currency)}</strong></span>
            </>
          )}
        </div>
      )}

      {/* Report Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                {headers.map((h) => (
                  <th key={h.key} className="py-3 px-4">
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length > 0 ? (
                filteredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    {headers.map((h) => (
                      <td key={h.key} className="py-3 px-4">
                        {String(row[h.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length || 1} className="py-8 text-center text-slate-400">
                    No report records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
