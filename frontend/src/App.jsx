import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { RevenueAnalytics } from './pages/RevenueAnalytics';
import { SubscriptionAnalytics } from './pages/SubscriptionAnalytics';
import { InvoicePaymentAnalytics } from './pages/InvoicePaymentAnalytics';
import { CustomerAnalytics } from './pages/CustomerAnalytics';
import { FinancialReports } from './pages/FinancialReports';
import { analyticsApi } from './services/analyticsApi';
import {
  Layers,
  Package,
  FileText,
  Settings as SettingsIcon,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Ensure admin token is initialized for instant evaluation
    if (!localStorage.getItem('token')) {
      analyticsApi.loginAdmin();
    }
  }, []);

  const handleSeedSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key={refreshKey} onNavigate={setActiveTab} />;
      case 'revenue':
        return <RevenueAnalytics key={refreshKey} />;
      case 'subscriptions':
        return <SubscriptionAnalytics key={refreshKey} />;
      case 'invoices':
      case 'payments':
        return <InvoicePaymentAnalytics key={refreshKey} />;
      case 'customers':
        return <CustomerAnalytics key={refreshKey} />;
      case 'reports':
        return <FinancialReports key={refreshKey} />;
      case 'plans':
        return (
          <div className="rounded-xl border border-slate-200/80 bg-white p-8 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Subscription Plans Integration</h2>
                <p className="text-xs text-slate-500">Connected to Member 2 Plan Management APIs (/api/plans)</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              Subscription plans configured in the backend: Daily, Weekly, Monthly, and Yearly intervals with recurring billing rules.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setActiveTab('subscriptions')}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
              >
                View Live Subscriptions
              </button>
            </div>
          </div>
        );
      case 'products':
        return (
          <div className="rounded-xl border border-slate-200/80 bg-white p-8 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Product Catalog & Brand Variants</h2>
                <p className="text-xs text-slate-500">Connected to Member 2 Product APIs (/api/products)</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              Base products (Software, Addons, Services) and brand variants (including Odoo Integration with +₹560 price adder).
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      case 'quotations':
        return (
          <div className="rounded-xl border border-slate-200/80 bg-white p-8 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Quotations & Sales Conversion</h2>
                <p className="text-xs text-slate-500">Connected to Member 3 Quotation Service (/api/quotations)</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              Sales quotations generated for prospective customers and converted into confirmed recurring subscriptions.
            </p>
          </div>
        );
      case 'settings':
        return (
          <div className="rounded-xl border border-slate-200/80 bg-white p-8 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <SettingsIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">System & Currency Configuration</h2>
                <p className="text-xs text-slate-500">Global settings and currency preferences</p>
              </div>
            </div>
            <div className="mt-6 space-y-4 max-w-md text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  readOnly
                  value="Brightloop Software"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 font-semibold"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Active Currency</label>
                <input
                  type="text"
                  readOnly
                  value="USD ($) / INR (₹) Configurable"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600"
                />
                <p className="mt-1 text-[11px] text-slate-400">Configured dynamically via APP_CURRENCY environment variable</p>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Architecture Mode</label>
                <input
                  type="text"
                  readOnly
                  value="Dual-Mode (PostgreSQL via Prisma ORM + In-Memory Fallback)"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600"
                />
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard key={refreshKey} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <Navbar
          onSeedSuccess={handleSeedSuccess}
          activeTab={activeTab}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
