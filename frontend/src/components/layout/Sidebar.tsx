import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  CalendarDays,
  Users,
  UserCheck,
  FileSpreadsheet,
  Repeat,
  Receipt,
  Percent,
  Calculator,
  CreditCard,
  BarChart3,
  Server,
  User,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'CUSTOMER';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-sm transition-colors duration-150 select-none ${
      isActive
        ? 'bg-ink text-white font-semibold shadow-xs'
        : 'text-secondary hover:text-ink hover:bg-[#EFEFEA]'
    }`;

  const renderAdminNav = () => (
    <>
      <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-muted">
        Core Operations
      </div>
      <div className="space-y-0.5 mb-4">
        <NavLink to="/admin/dashboard" className={linkClass} onClick={onClose} end>
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/products" className={linkClass} onClick={onClose}>
          <Package className="w-4 h-4 shrink-0" />
          <span>Products</span>
        </NavLink>
        <NavLink to="/admin/variants" className={linkClass} onClick={onClose}>
          <Layers className="w-4 h-4 shrink-0" />
          <span>Variants (+560 Adder)</span>
        </NavLink>
        <NavLink to="/admin/plans" className={linkClass} onClick={onClose}>
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span>Subscription Plans</span>
        </NavLink>
        <NavLink to="/admin/customers" className={linkClass} onClick={onClose}>
          <Users className="w-4 h-4 shrink-0" />
          <span>Customer Directory</span>
        </NavLink>
        <NavLink to="/admin/staff" className={linkClass} onClick={onClose}>
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>Staff Accounts</span>
        </NavLink>
      </div>

      <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-muted flex items-center justify-between">
        <span>Business Lifecycle</span>
        <span className="text-[9px] text-[#8C7A3E] font-normal">Coordinated</span>
      </div>
      <div className="space-y-0.5 mb-4">
        <NavLink to="/admin/quotations" className={linkClass} onClick={onClose}>
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span>Quotations</span>
        </NavLink>
        <NavLink to="/admin/subscriptions" className={linkClass} onClick={onClose}>
          <Repeat className="w-4 h-4 shrink-0" />
          <span>Subscriptions</span>
        </NavLink>
        <NavLink to="/admin/invoices" className={linkClass} onClick={onClose}>
          <Receipt className="w-4 h-4 shrink-0" />
          <span>Invoices & Billing</span>
        </NavLink>
        <NavLink to="/admin/discounts" className={linkClass} onClick={onClose}>
          <Percent className="w-4 h-4 shrink-0" />
          <span>Discount Rules</span>
        </NavLink>
        <NavLink to="/admin/taxes" className={linkClass} onClick={onClose}>
          <Calculator className="w-4 h-4 shrink-0" />
          <span>Tax Rules</span>
        </NavLink>
        <NavLink to="/admin/payments" className={linkClass} onClick={onClose}>
          <CreditCard className="w-4 h-4 shrink-0" />
          <span>Payments</span>
        </NavLink>
        <NavLink to="/admin/reports" className={linkClass} onClick={onClose}>
          <BarChart3 className="w-4 h-4 shrink-0" />
          <span>Revenue Reports</span>
        </NavLink>
      </div>

      <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-muted">
        Platform
      </div>
      <div className="space-y-0.5">
        <NavLink to="/admin/system" className={linkClass} onClick={onClose}>
          <Server className="w-4 h-4 shrink-0" />
          <span>System & Health</span>
        </NavLink>
      </div>
    </>
  );

  const renderStaffNav = () => (
    <>
      <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-muted">
        Staff Operations
      </div>
      <div className="space-y-0.5 mb-4">
        <NavLink to="/staff/dashboard" className={linkClass} onClick={onClose} end>
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Overview</span>
        </NavLink>
        <NavLink to="/staff/customers" className={linkClass} onClick={onClose}>
          <Users className="w-4 h-4 shrink-0" />
          <span>Customers</span>
        </NavLink>
        <NavLink to="/staff/catalog" className={linkClass} onClick={onClose}>
          <Package className="w-4 h-4 shrink-0" />
          <span>Products & Plans</span>
        </NavLink>
      </div>

      <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-muted">
        Customer Workflows
      </div>
      <div className="space-y-0.5">
        <NavLink to="/staff/quotations" className={linkClass} onClick={onClose}>
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span>Quotations</span>
        </NavLink>
        <NavLink to="/staff/subscriptions" className={linkClass} onClick={onClose}>
          <Repeat className="w-4 h-4 shrink-0" />
          <span>Subscriptions</span>
        </NavLink>
        <NavLink to="/staff/invoices" className={linkClass} onClick={onClose}>
          <Receipt className="w-4 h-4 shrink-0" />
          <span>Invoices</span>
        </NavLink>
      </div>
    </>
  );

  const renderCustomerNav = () => (
    <>
      <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-muted">
        Self-Service Portal
      </div>
      <div className="space-y-0.5 mb-4">
        <NavLink to="/customer/dashboard" className={linkClass} onClick={onClose} end>
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/customer/subscriptions" className={linkClass} onClick={onClose}>
          <Repeat className="w-4 h-4 shrink-0" />
          <span>My Subscriptions</span>
        </NavLink>
        <NavLink to="/customer/plans" className={linkClass} onClick={onClose}>
          <Package className="w-4 h-4 shrink-0" />
          <span>Available Plans</span>
        </NavLink>
        <NavLink to="/customer/invoices" className={linkClass} onClick={onClose}>
          <Receipt className="w-4 h-4 shrink-0" />
          <span>Invoices & Receipts</span>
        </NavLink>
      </div>

      <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-muted">
        Account
      </div>
      <div className="space-y-0.5">
        <NavLink to="/customer/profile" className={linkClass} onClick={onClose}>
          <User className="w-4 h-4 shrink-0" />
          <span>Profile & Company</span>
        </NavLink>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-14 left-0 z-40 w-64 h-[calc(100vh-3.5rem)] bg-[#FBFBFA] border-r border-border flex flex-col justify-between transition-transform duration-200 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4">
          {role === 'ADMIN' && renderAdminNav()}
          {role === 'STAFF' && renderStaffNav()}
          {role === 'CUSTOMER' && renderCustomerNav()}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-4 border-t border-border bg-[#F7F7F5] text-[11px] text-secondary">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
              Role Authority
            </span>
            <span className="font-mono font-medium text-ink">{role}</span>
          </div>
          <div className="text-[10px] text-muted leading-tight">
            Enforced by backend JWT token. Customer isolation active.
          </div>
        </div>
      </aside>
    </>
  );
};
