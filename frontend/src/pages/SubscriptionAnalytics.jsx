import React, { useState, useEffect } from 'react';
import {
  Repeat,
  Search,
  Filter,
  CheckCircle2,
  PauseCircle,
  XCircle,
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { analyticsApi } from '../services/analyticsApi';
import { formatCurrency } from '../utils/formatCurrency';

export const SubscriptionAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getSubscriptionAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to fetch subscriptions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, []);

  const counts = data?.counts || {};
  const distribution = data?.distribution || [];
  const trends = data?.trends || [];
  const tableData = data?.tableData || [];

  const filteredSubs = tableData.filter((sub) => {
    const matchesSearch =
      sub.subscriptionNumber.toLowerCase().includes(search.toLowerCase()) ||
      sub.customerName.toLowerCase().includes(search.toLowerCase()) ||
      sub.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      sub.planName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || sub.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Active
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <PauseCircle className="h-3 w-3" /> Paused
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3" /> Closed
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            Confirmed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Subscription Analytics
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Lifecycle metrics, churn monitoring, and recurring billing distribution
        </p>
      </div>

      {/* 6 Metric Overview Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-center shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{counts.total ?? 0}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-center shadow-xs">
          <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">Active</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{counts.active ?? 0}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 text-center shadow-xs">
          <p className="text-[11px] font-medium text-amber-700 uppercase tracking-wider">Paused</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{counts.paused ?? 0}</p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 text-center shadow-xs">
          <p className="text-[11px] font-medium text-rose-700 uppercase tracking-wider">Closed</p>
          <p className="mt-1 text-2xl font-bold text-rose-700">{counts.closed ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-center shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Draft / Quotes</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{(counts.draft ?? 0) + (counts.quotation ?? 0)}</p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-center shadow-xs">
          <p className="text-[11px] font-medium text-indigo-700 uppercase tracking-wider">Due Renewal</p>
          <p className="mt-1 text-2xl font-bold text-indigo-700">{counts.dueForRenewal ?? 0}</p>
        </div>
      </div>

      {/* Visualizations: Distribution Donut & Trends Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Donut */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900">Subscription Status Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">Distribution of current accounts by lifecycle state</p>

          <div className="mt-4 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie
                  data={distribution}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="status"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Creation Trends */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900">Subscription Creation Trends</h3>
          <p className="text-xs text-slate-500 mt-0.5">New subscriptions originated over time</p>

          <div className="mt-4 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Searchable Subscriptions Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Subscriptions Directory</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live operational listing with customer and billing details
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="CLOSED">Closed</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">Subscription ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Interval</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">Next Billing Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.length > 0 ? (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                      {sub.subscriptionNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{sub.customerName}</div>
                      <div className="text-[10px] text-slate-400">{sub.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4">{sub.productName}</td>
                    <td className="py-3 px-4 font-medium">{sub.planName}</td>
                    <td className="py-3 px-4 capitalize">{sub.billingInterval.toLowerCase()}</td>
                    <td className="py-3 px-4 text-slate-500">{sub.startDate}</td>
                    <td className="py-3 px-4 text-slate-500">{sub.nextBillingDate}</td>
                    <td className="py-3 px-4">{getStatusBadge(sub.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No subscriptions matching your filters.
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
