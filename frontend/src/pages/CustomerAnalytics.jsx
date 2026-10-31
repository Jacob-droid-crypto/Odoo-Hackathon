import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  TrendingUp,
  Award,
  Search,
  DollarSign,
  Repeat
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { analyticsApi } from '../services/analyticsApi';
import { formatCurrency } from '../utils/formatCurrency';

export const CustomerAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getCustomerAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load customer analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const overview = data?.overview || {};
  const growth = data?.customerGrowth || [];
  const topCustomers = data?.topCustomers || [];
  const customerTable = data?.customerTable || [];

  const filteredCustomers = customerTable.filter((c) => {
    return (
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Customer Analytics
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Customer lifetime value, registration trends, and top paying subscribers
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Customers
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {overview.totalCustomers ?? 0}
          </h3>
          <p className="mt-1 text-[11px] text-slate-400">Total registered user accounts</p>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-indigo-700 uppercase tracking-wider">
            New Customers (30d)
          </p>
          <h3 className="mt-2 text-2xl font-bold text-indigo-700">
            {overview.newCustomers ?? 0}
          </h3>
          <p className="mt-1 text-[11px] text-slate-400">Registered in last 30 days</p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">
            With Active Subscriptions
          </p>
          <h3 className="mt-2 text-2xl font-bold text-emerald-700">
            {overview.customersWithActiveSubscriptions ?? 0}
          </h3>
          <p className="mt-1 text-[11px] text-slate-400">Currently active and billable</p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">
            With Paused Subscriptions
          </p>
          <h3 className="mt-2 text-2xl font-bold text-amber-700">
            {overview.customersWithPausedSubscriptions ?? 0}
          </h3>
          <p className="mt-1 text-[11px] text-slate-400">Temporarily paused service</p>
        </div>
      </div>

      {/* Charts Grid: Growth & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Customer Growth Chart */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">A. Customer Growth Trend</h3>
              <p className="text-xs text-slate-500">New customer registrations over time</p>
            </div>
          </div>

          <div className="mt-6 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="newRegistrations" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* C. Top Customers Leaderboard */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">C. Top Customers</h3>
                <p className="text-xs text-slate-500">Ranked by actual payments received</p>
              </div>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {topCustomers.slice(0, 5).map((cust, idx) => (
                <div key={cust.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-800'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-700'
                          : idx === 2
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-50 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{cust.customerName}</p>
                      <p className="text-[10px] text-slate-400">{cust.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-indigo-600">
                      {formatCurrency(cust.totalAmountPaid)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {cust.activeSubscriptions} active subs
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* B. Customer Subscription Directory Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">B. Customer Subscription Table</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer profile, active subscription counts, and lifetime revenue
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer name or email..."
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
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Join Date</th>
                <th className="py-3 px-4">Total Subscriptions</th>
                <th className="py-3 px-4">Active Subscriptions</th>
                <th className="py-3 px-4">Total Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{c.customerName}</td>
                    <td className="py-3 px-4 text-slate-600">{c.email}</td>
                    <td className="py-3 px-4 text-slate-500">{c.phone}</td>
                    <td className="py-3 px-4 text-slate-500">{c.joinDate}</td>
                    <td className="py-3 px-4 font-medium">{c.totalSubscriptions}</td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/80">
                        {c.activeSubscriptions} Active
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-600">
                      {formatCurrency(c.totalAmountPaid)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No customers found matching your search.
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
