import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  Shield,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Database
} from 'lucide-react';
import { analyticsApi } from '../../services/analyticsApi';

export const Navbar = ({ onSeedSuccess, activeTab, onSearch }) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      const res = await analyticsApi.seedDemoData();
      setSeedNotice('Demo data loaded!');
      setTimeout(() => setSeedNotice(null), 3000);
      if (onSeedSuccess) onSeedSuccess();
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-md">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subscriptions, customers, invoices..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-12 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Data Seeder for Evaluation */}
        <button
          onClick={handleSeed}
          disabled={isSeeding}
          title="Seed realistic records for complete analytics charts"
          className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
        >
          {isSeeding ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : seedNotice ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          )}
          <span>{isSeeding ? 'Seeding...' : seedNotice || 'Load Demo Data'}</span>
        </button>

        {/* Database Status Tag */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Database className="h-3 w-3" />
          <span>Active</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
        </button>

        <div className="h-5 w-px bg-slate-200"></div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-xs font-semibold text-white shadow-xs">
              AD
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800">Admin User</span>
              <span className="text-[10px] text-slate-500">admin@brightloop.com</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl z-50">
              <div className="border-b border-slate-100 px-3.5 py-2">
                <p className="text-xs font-semibold text-slate-800">Brightloop Software</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Shield className="h-3 w-3 text-indigo-600" />
                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                    ADMIN
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full px-3.5 py-2 text-left text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>Role: Enterprise Administrator</span>
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  setShowProfileMenu(false);
                  window.location.reload();
                }}
                className="w-full px-3.5 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Reset Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
