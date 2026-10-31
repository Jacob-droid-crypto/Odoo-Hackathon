import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { usersApi } from '../../api/users';
import { productsApi } from '../../api/products';
import { plansApi } from '../../api/plans';
import { User, Product, SubscriptionPlan } from '../../types';
import {
  Users,
  Package,
  CalendarDays,
  Briefcase,
  ArrowRight,
  Repeat,
  Receipt
} from 'lucide-react';

export const StaffDashboardPage: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [custRes, prodRes, planRes] = await Promise.allSettled([
          usersApi.list({ role: 'CUSTOMER', limit: 50 }),
          productsApi.list({ limit: 50 }),
          plansApi.list(),
        ]);
        if (custRes.status === 'fulfilled' && custRes.value.data) {
          setCustomers(custRes.value.data);
        }
        if (prodRes.status === 'fulfilled' && prodRes.value.data) {
          setProducts(prodRes.value.data);
        }
        if (planRes.status === 'fulfilled' && planRes.value.data) {
          setPlans(planRes.value.data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout
      title="Staff Operations Workspace"
      subtitle="Day-to-day customer management, subscription lifecycle tracking, and quotation fulfillment."
      breadcrumbs={[{ label: 'Staff' }, { label: 'Operations Dashboard' }]}
    >
      {/* RBAC Info Banner */}
      <div className="bg-[#FAF9F5] border border-border rounded-md p-4 mb-6 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#244A9E]" />
          <span className="font-semibold text-ink">
            Staff Permissions Enforced
          </span>
          <span className="text-secondary">
            — Operational access granted. Admin-exclusive settings restricted by backend policy.
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-sm bg-[#EEF2FC] text-[#244A9E] border border-[#CFDBF7]">
          STAFF ROLE
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Assigned Customers"
          value={loading ? '...' : customers.length}
          subvalue="Registered business accounts"
          icon={<Users className="w-4 h-4" />}
          badge="LIVE"
        />
        <StatCard
          label="Available Catalog Products"
          value={loading ? '...' : products.length}
          subvalue="Software, Add-ons & Services"
          icon={<Package className="w-4 h-4" />}
          badge="LIVE"
        />
        <StatCard
          label="Recurring Billing Plans"
          value={loading ? '...' : plans.length}
          subvalue="Daily, Monthly & Yearly terms"
          icon={<CalendarDays className="w-4 h-4" />}
          badge="LIVE"
        />
      </div>

      {/* Customer Queue & Recent Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customer Directory Quickview */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-[#FAF9F6]">
            <div>
              <h3 className="text-sm font-semibold text-ink tracking-tight">
                Customer Accounts
              </h3>
              <p className="text-xs text-secondary">Active customers in system</p>
            </div>
            <Link
              to="/staff/customers"
              className="text-xs font-mono text-ink hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-border text-xs">
            {customers.slice(0, 5).map((c) => (
              <div key={c.id} className="p-4 hover:bg-[#FAF9F6] transition-colors flex items-center justify-between">
                <div>
                  <div className="font-medium text-ink">
                    {c.firstName} {c.lastName}
                  </div>
                  <div className="text-[11px] font-mono text-secondary mt-0.5">
                    {c.email} {c.companyName ? `• ${c.companyName}` : ''}
                  </div>
                </div>
                <Badge variant={c.isActive !== false ? 'active' : 'draft'} dot>
                  {c.isActive !== false ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
            {customers.length === 0 && !loading && (
              <div className="p-6 text-center text-secondary font-mono">
                No customer records found.
              </div>
            )}
          </div>
        </div>

        {/* Catalog Plans Quickview */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-[#FAF9F6]">
            <div>
              <h3 className="text-sm font-semibold text-ink tracking-tight">
                Available Plans
              </h3>
              <p className="text-xs text-secondary">Ready for customer quotations</p>
            </div>
            <Link
              to="/staff/catalog"
              className="text-xs font-mono text-ink hover:underline flex items-center gap-1"
            >
              <span>Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-border text-xs">
            {plans.slice(0, 4).map((pl) => (
              <div key={pl.id} className="p-4 hover:bg-[#FAF9F6] transition-colors flex items-center justify-between">
                <div>
                  <div className="font-medium text-ink">{pl.name}</div>
                  <div className="text-[11px] font-mono text-muted mt-0.5">
                    {pl.billingInterval} • Code: {pl.code}
                  </div>
                </div>
                <div className="text-right font-mono font-medium text-ink">
                  ${Number(pl.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
