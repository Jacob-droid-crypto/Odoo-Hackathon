import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { productsApi } from '../../api/products';
import { plansApi } from '../../api/plans';
import { usersApi } from '../../api/users';
import { systemApi, HealthStatus } from '../../api/system';
import { Product, SubscriptionPlan, User } from '../../types';
import {
  Package,
  CalendarDays,
  Users,
  ShieldCheck,
  Plus,
  ArrowRight,
  Server,
  Layers,
  Repeat,
  Receipt
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, planRes, custRes, staffRes, healthRes] = await Promise.allSettled([
        productsApi.list({ limit: 100 }),
        plansApi.list(),
        usersApi.list({ role: 'CUSTOMER' }),
        usersApi.list({ role: 'STAFF' }),
        systemApi.health(),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value.data) {
        setProducts(prodRes.value.data);
      }
      if (planRes.status === 'fulfilled' && planRes.value.data) {
        setPlans(planRes.value.data);
      }
      if (custRes.status === 'fulfilled' && custRes.value.data) {
        setCustomers(custRes.value.data);
      }
      if (staffRes.status === 'fulfilled' && staffRes.value.data) {
        setStaff(staffRes.value.data);
      }
      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeProducts = products.filter((p) => p.isActive);
  const activePlans = plans.filter((p) => p.isActive);

  return (
    <DashboardLayout
      title="Admin Command Center"
      subtitle="Complete system governance, recurring subscription plans, product catalog, and role authorization."
      action={
        <div className="flex items-center gap-2">
          <Link to="/admin/products">
            <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Add Product
            </Button>
          </Link>
          <Link to="/admin/plans">
            <Button size="sm" variant="outline" icon={<CalendarDays className="w-3.5 h-3.5" />}>
              New Plan
            </Button>
          </Link>
        </div>
      }
    >
      {/* Real-time System Status Bar */}
      <div className="bg-[#FAF9F5] border border-border rounded-md p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              health?.status === 'UP' ? 'bg-[#22843A] animate-pulse' : 'bg-terracotta'
            }`}
          />
          <span className="font-semibold text-ink">
            {health?.status === 'UP' ? 'System Operational' : 'Connecting to API'}
          </span>
          <span className="text-muted">|</span>
          <span className="text-secondary">
            ORM: {health?.database.orm || 'Prisma v6'} ({health?.database.mode || 'Active'})
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted">
          <span>PostgreSQL Configured</span>
          <span>•</span>
          <Link to="/admin/system" className="text-ink underline hover:text-black">
            Inspect Architecture
          </Link>
        </div>
      </div>

      {/* Primary Metric Figures from Live API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Catalog Products"
          value={loading ? '...' : products.length}
          subvalue={`${activeProducts.length} active in catalog`}
          icon={<Package className="w-4 h-4" />}
          badge="LIVE API"
        />
        <StatCard
          label="Subscription Plans"
          value={loading ? '...' : plans.length}
          subvalue="Daily, Weekly, Monthly, Yearly"
          icon={<CalendarDays className="w-4 h-4" />}
          badge="LIVE API"
        />
        <StatCard
          label="Registered Customers"
          value={loading ? '...' : customers.length}
          subvalue="Self-service accounts"
          icon={<Users className="w-4 h-4" />}
          badge="LIVE API"
        />
        <StatCard
          label="Staff Accounts"
          value={loading ? '...' : staff.length}
          subvalue="Admin-provisioned personnel"
          icon={<ShieldCheck className="w-4 h-4" />}
          badge="RBAC"
        />
      </div>

      {/* Grid: Quick Actions & Live Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        {/* Recent Products (Live API) */}
        <div className="lg:col-span-6 bg-surface border border-border rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink tracking-tight">
                Products in Catalog
              </h3>
              <p className="text-xs text-secondary">Managed via `/api/products`</p>
            </div>
            <Link
              to="/admin/products"
              className="text-xs font-mono text-ink hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {products.slice(0, 4).map((p) => (
              <div key={p.id} className="p-4 hover:bg-[#FAF9F6] transition-colors flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-ink">{p.name}</span>
                    <Badge variant={p.isActive ? 'active' : 'draft'}>
                      {p.type}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-secondary font-mono mt-0.5">
                    Sales Price: ${Number(p.salesPrice).toFixed(2)} | Cost: ${Number(p.costPrice || 0).toFixed(2)}
                  </div>
                </div>
                <Link
                  to={`/admin/variants?product=${p.id}`}
                  className="text-[11px] font-mono px-2 py-1 bg-[#F4F3EF] hover:bg-[#EBE9E3] rounded-sm text-secondary hover:text-ink transition-colors flex items-center gap-1"
                >
                  <Layers className="w-3 h-3" />
                  Variants
                </Link>
              </div>
            ))}
            {products.length === 0 && !loading && (
              <div className="p-6 text-center text-xs text-secondary font-mono">
                No products found. Add your first product to get started.
              </div>
            )}
          </div>
        </div>

        {/* Subscription Plans (Live API) */}
        <div className="lg:col-span-6 bg-surface border border-border rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink tracking-tight">
                Recurring Billing Plans
              </h3>
              <p className="text-xs text-secondary">Managed via `/api/plans`</p>
            </div>
            <Link
              to="/admin/plans"
              className="text-xs font-mono text-ink hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {plans.slice(0, 4).map((pl) => (
              <div key={pl.id} className="p-4 hover:bg-[#FAF9F6] transition-colors flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-ink">{pl.name}</span>
                    <Badge variant="confirmed">{pl.billingInterval}</Badge>
                  </div>
                  <div className="text-[11px] text-secondary font-mono mt-0.5">
                    Code: {pl.code} | Rate: ${Number(pl.price).toFixed(2)} / {pl.billingInterval.toLowerCase()}
                  </div>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="font-semibold text-ink">${Number(pl.price).toFixed(2)}</span>
                </div>
              </div>
            ))}
            {plans.length === 0 && !loading && (
              <div className="p-6 text-center text-xs text-secondary font-mono">
                No recurring plans configured yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module Navigation Grid for Remaining Lifecycle Areas */}
      <div className="mt-8 border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-muted">
              Lifecycle Workspaces
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Navigate between integrated live endpoints and coordinated schema modules.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/admin/variants"
            className="p-3 bg-surface border border-border rounded-md hover:border-ink transition-colors block text-left"
          >
            <div className="flex items-center justify-between text-muted mb-2">
              <Layers className="w-4 h-4 text-ink" />
              <span className="text-[9px] font-mono text-[#1E6930]">LIVE</span>
            </div>
            <div className="text-xs font-medium text-ink">Variants</div>
            <div className="text-[10px] text-muted font-mono mt-0.5">+560 Adder</div>
          </Link>

          <Link
            to="/admin/staff"
            className="p-3 bg-surface border border-border rounded-md hover:border-ink transition-colors block text-left"
          >
            <div className="flex items-center justify-between text-muted mb-2">
              <ShieldCheck className="w-4 h-4 text-ink" />
              <span className="text-[9px] font-mono text-[#1E6930]">LIVE</span>
            </div>
            <div className="text-xs font-medium text-ink">Staff Provisioning</div>
            <div className="text-[10px] text-muted font-mono mt-0.5">Admin-only</div>
          </Link>

          <Link
            to="/admin/quotations"
            className="p-3 bg-surface border border-border rounded-md hover:border-ink transition-colors block text-left"
          >
            <div className="flex items-center justify-between text-muted mb-2">
              <Repeat className="w-4 h-4 text-secondary" />
              <span className="text-[9px] font-mono text-[#8C7A3E]">Schema</span>
            </div>
            <div className="text-xs font-medium text-ink">Quotations</div>
            <div className="text-[10px] text-muted font-mono mt-0.5">Validity Days</div>
          </Link>

          <Link
            to="/admin/subscriptions"
            className="p-3 bg-surface border border-border rounded-md hover:border-ink transition-colors block text-left"
          >
            <div className="flex items-center justify-between text-muted mb-2">
              <Repeat className="w-4 h-4 text-terracotta" />
              <span className="text-[9px] font-mono text-[#8C7A3E]">Schema</span>
            </div>
            <div className="text-xs font-medium text-ink">Subscriptions</div>
            <div className="text-[10px] text-muted font-mono mt-0.5">Active Loop</div>
          </Link>

          <Link
            to="/admin/invoices"
            className="p-3 bg-surface border border-border rounded-md hover:border-ink transition-colors block text-left"
          >
            <div className="flex items-center justify-between text-muted mb-2">
              <Receipt className="w-4 h-4 text-secondary" />
              <span className="text-[9px] font-mono text-[#8C7A3E]">Schema</span>
            </div>
            <div className="text-xs font-medium text-ink">Invoicing & Tax</div>
            <div className="text-[10px] text-muted font-mono mt-0.5">Billing Day</div>
          </Link>

          <Link
            to="/admin/reports"
            className="p-3 bg-surface border border-border rounded-md hover:border-ink transition-colors block text-left"
          >
            <div className="flex items-center justify-between text-muted mb-2">
              <Server className="w-4 h-4 text-secondary" />
              <span className="text-[9px] font-mono text-[#8C7A3E]">Finance</span>
            </div>
            <div className="text-xs font-medium text-ink">Revenue Reports</div>
            <div className="text-[10px] text-muted font-mono mt-0.5">MRR Summary</div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};
