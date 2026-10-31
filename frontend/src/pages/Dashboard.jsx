import React, { useState, useEffect } from 'react';
import {
  Users,
  Package,
  Repeat,
  DollarSign,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { SubscriptionChart } from '../components/dashboard/SubscriptionChart';
import { InvoiceChart } from '../components/dashboard/InvoiceChart';
import { PaymentChart } from '../components/dashboard/PaymentChart';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { DateRangePicker } from '../components/dashboard/DateRangePicker';
import { analyticsApi } from '../services/analyticsApi';
import { formatCurrency } from '../utils/formatCurrency';

export const Dashboard = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [period, setPeriod] = useState('last_30_days');
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Auto login admin if no token in session
      if (!localStorage.getItem('token')) {
        await analyticsApi.loginAdmin();
      }

      const [dash, rev, pay] = await Promise.all([
        analyticsApi.getDashboardSummary().catch(() => null),
        analyticsApi.getRevenueAnalytics({ period }).catch(() => null),
        analyticsApi.getPaymentAnalytics().catch(() => null)
      ]);

      setData(dash);
      setRevenueData(rev);
      setPaymentData(pay);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to fetch dashboard data. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const currencyCode = data?.currency || 'USD';
  const currencySymbol = data?.currencySymbol || '$';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Analytics Overview
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time financial performance and subscription operations for Brightloop Software
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangePicker period={period} onChange={setPeriod} />
          <button
            onClick={fetchDashboardData}
            title="Refresh data"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* 8 Primary Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Customers */}
        <StatCard
          title="Total Customers"
          value={loading ? '...' : (data?.totalCustomers ?? 0)}
          subtitle="Registered accounts"
          icon={Users}
          color="purple"
          badgeText="Active"
          onClick={() => onNavigate && onNavigate('customers')}
        />

        {/* 2. Total Products */}
        <StatCard
          title="Total Products"
          value={loading ? '...' : (data?.totalProducts ?? 0)}
          subtitle="Catalog offerings & add-ons"
          icon={Package}
          color="blue"
          badgeText="Catalog"
          onClick={() => onNavigate && onNavigate('products')}
        />

        {/* 3. Active Subscriptions */}
        <StatCard
          title="Active Subscriptions"
          value={loading ? '...' : (data?.activeSubscriptions ?? 0)}
          subtitle="Recurring billable plans"
          icon={Repeat}
          color="emerald"
          badgeText="Billing"
          onClick={() => onNavigate && onNavigate('subscriptions')}
        />

        {/* 4. Total Collected Revenue */}
        <StatCard
          title="Total Collected Revenue"
          value={
            loading
              ? '...'
              : formatCurrency(data?.totalRevenue ?? 0, currencyCode, currencySymbol)
          }
          subtitle="Actual recorded payments"
          icon={DollarSign}
          color="indigo"
          badgeText="Verified"
          onClick={() => onNavigate && onNavigate('revenue')}
        />

        {/* 5. Total Invoices */}
        <StatCard
          title="Total Invoices"
          value={loading ? '...' : (data?.totalInvoices ?? 0)}
          subtitle="Generated invoices"
          icon={Receipt}
          color="blue"
          onClick={() => onNavigate && onNavigate('invoices')}
        />

        {/* 6. Paid Invoices */}
        <StatCard
          title="Paid Invoices"
          value={loading ? '...' : (data?.paidInvoices ?? 0)}
          subtitle="Fulfilled in full"
          icon={CheckCircle2}
          color="emerald"
          badgeText="Settled"
          onClick={() => onNavigate && onNavigate('invoices')}
        />

        {/* 7. Unpaid Invoices */}
        <StatCard
          title="Unpaid Invoices"
          value={loading ? '...' : (data?.unpaidInvoices ?? 0)}
          subtitle="Awaiting payment"
          icon={Clock}
          color="amber"
          badgeText="Pending"
          onClick={() => onNavigate && onNavigate('invoices')}
        />

        {/* 8. Overdue Invoices */}
        <StatCard
          title="Overdue Invoices"
          value={loading ? '...' : (data?.overdueInvoices ?? 0)}
          subtitle={
            data?.totalOutstandingAmount
              ? `${currencySymbol}${data.totalOutstandingAmount} balance`
              : 'Past due date'
          }
          icon={AlertTriangle}
          color="rose"
          badgeText="Action"
          onClick={() => onNavigate && onNavigate('invoices')}
        />
      </div>

      {/* Main Charts Grid: Revenue Trend & Subscription Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart
            data={revenueData?.revenueTrends || []}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
            period={period}
            onPeriodChange={setPeriod}
          />
        </div>
        <div className="lg:col-span-1">
          <SubscriptionChart
            data={data?.subscriptionDistribution || []}
            dueForRenewal={data?.subscriptionsDueForRenewal || 0}
          />
        </div>
      </div>

      {/* Invoices Status & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InvoiceChart
            data={data?.invoiceDistribution || []}
            outstandingAmount={data?.totalOutstandingAmount || 0}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        </div>
        <div className="lg:col-span-1">
          <PaymentChart
            data={paymentData?.paymentMethods || []}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        </div>
      </div>

      {/* Recent Activity Live Feed */}
      <RecentActivity activities={data?.recentActivities || []} />
    </div>
  );
};
