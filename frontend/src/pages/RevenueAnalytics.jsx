import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Calendar,
  BarChart3,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { DateRangePicker } from '../components/dashboard/DateRangePicker';
import { analyticsApi } from '../services/analyticsApi';
import { formatCurrency } from '../utils/formatCurrency';

export const RevenueAnalytics = () => {
  const [period, setPeriod] = useState('last_6_months');
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getRevenueAnalytics({ period });
      setRevenueData(res);
    } catch (err) {
      console.error('Error fetching revenue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [period]);

  const summary = revenueData?.summary || {};
  const monthlyRevenue = revenueData?.monthlyRevenue || [];
  const trends = revenueData?.revenueTrends || [];

  const currencyCode = summary.currency || 'USD';
  const currencySymbol = summary.currencySymbol || '$';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Revenue Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Comprehensive financial reporting calculated from verified payments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangePicker period={period} onChange={setPeriod} />
          <button
            onClick={fetchRevenue}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-indigo-100 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Revenue Collected
          </p>
          <h3 className="mt-2 text-2xl font-bold text-indigo-700">
            {formatCurrency(summary.totalRevenue ?? 0, currencyCode, currencySymbol)}
          </h3>
          <p className="mt-2 text-[11px] text-slate-400">
            Sum of all successful recorded payments
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Successful Payments
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {summary.paymentCount ?? 0}
          </h3>
          <p className="mt-2 text-[11px] text-slate-400">
            Completed transactions in period
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Average Payment Amount
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(summary.averagePayment ?? 0, currencyCode, currencySymbol)}
          </h3>
          <p className="mt-2 text-[11px] text-slate-400">
            Total Revenue / Successful Payments
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Selected Period
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 capitalize">
            {period.replace(/_/g, ' ')}
          </h3>
          <p className="mt-2 text-[11px] text-slate-400">
            Active time window filter
          </p>
        </div>
      </div>

      {/* Chart A: Monthly Revenue Line Chart */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">A. Monthly Revenue Trend</h3>
              <p className="text-xs text-slate-500">Collected revenue progression by month</p>
            </div>
          </div>
        </div>

        <div className="mt-6 h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                formatter={(val) => [formatCurrency(val, currencyCode, currencySymbol), 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart B: Month-over-Month Revenue Comparison Bar Chart */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">B. Revenue Comparison Across Months</h3>
              <p className="text-xs text-slate-500">Comparative collection metrics per billing period</p>
            </div>
          </div>
        </div>

        <div className="mt-6 h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                formatter={(val) => [formatCurrency(val, currencyCode, currencySymbol), 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                {monthlyRevenue.map((_, idx) => (
                  <Cell key={`bar-${idx}`} fill={idx % 2 === 0 ? '#4f46e5' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
