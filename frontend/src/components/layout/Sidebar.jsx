import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Repeat,
  Layers,
  Receipt,
  CreditCard,
  Users,
  FileSpreadsheet,
  Package,
  FileText,
  Settings,
  Zap,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab, isCollapsed, onToggleCollapse }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { id: 'revenue', label: 'Revenue Analytics', icon: TrendingUp },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
    { id: 'invoices', label: 'Invoices & Payments', icon: Receipt },
    { id: 'customers', label: 'Customer Analytics', icon: Users },
    { id: 'reports', label: 'Financial Reports', icon: FileSpreadsheet, badge: 'CSV' },
    { type: 'divider', label: 'MANAGEMENT' },
    { id: 'plans', label: 'Subscription Plans', icon: Layers },
    { id: 'products', label: 'Products & Variants', icon: Package },
    { id: 'quotations', label: 'Quotations', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
          <Zap className="h-5 w-5 fill-current" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold tracking-tight text-slate-900">
              Brightloop
            </span>
            <span className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Subscription Cloud
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item, idx) => {
          if (item.type === 'divider') {
            if (isCollapsed) return <div key={idx} className="my-3 border-t border-slate-100" />;
            return (
              <div
                key={idx}
                className="pt-4 pb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >
                {item.label}
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {!isCollapsed && (
                <>
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                        item.badge === 'Live'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Brightloop MVP</span>
              <span className="text-[10px] text-indigo-600 font-medium">v1.0.0</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
              Member 4 — Analytics Dashboard & Financial Integration
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
