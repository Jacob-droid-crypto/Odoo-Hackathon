import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { plansApi } from '../../api/plans';
import { SubscriptionPlan } from '../../types';
import {
  Repeat,
  Receipt,
  Package,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    plansApi.list({ isActive: true }).then((res) => {
      if (res.data) setPlans(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout
      title={`Welcome, ${user?.firstName || 'Customer'}`}
      subtitle={`Customer Self-Service Portal • Account ID: ${user?.id || '—'}`}
      action={
        <Link to="/customer/plans">
          <Button size="sm" icon={<Package className="w-3.5 h-3.5" />}>
            Browse Available Plans
          </Button>
        </Link>
      }
      breadcrumbs={[{ label: 'Customer Portal' }, { label: 'Dashboard' }]}
    >
      {/* Account Identity Card */}
      <div className="bg-surface border border-border rounded-md p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-ink text-base">
              {user?.companyName || `${user?.firstName} ${user?.lastName}`}
            </span>
            <Badge variant="active" dot>Active Account</Badge>
          </div>
          <div className="text-xs text-secondary font-mono">
            {user?.email} {user?.phone ? `• ${user?.phone}` : ''}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted">
          <ShieldCheck className="w-4 h-4 text-[#1E6930]" />
          <span>Tenant Data Isolation Active</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Active Subscriptions"
          value="1"
          subvalue="Brightloop Monthly ERP"
          icon={<Repeat className="w-4 h-4" />}
          badge="CURRENT"
        />
        <StatCard
          label="Next Scheduled Billing"
          value="Dec 01, 2026"
          subvalue="Auto-renews automatically"
          icon={<Calendar className="w-4 h-4" />}
        />
        <StatCard
          label="Latest Invoice"
          value="$2,076.80"
          subvalue="INV-2026-0001 (Paid)"
          icon={<Receipt className="w-4 h-4" />}
          badge="CONFIRMED"
        />
      </div>

      {/* Active Subscription Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-surface border border-border rounded-md overflow-hidden">
          <div className="p-4 border-b border-border bg-[#FAF9F6] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink tracking-tight">
                My Active Subscription
              </h3>
              <p className="text-xs text-secondary">SUB-2026-0001</p>
            </div>
            <Badge variant="active" dot>ACTIVE</Badge>
          </div>

          <div className="p-5 space-y-4 text-xs font-sans">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border font-mono">
              <div>
                <span className="text-[10px] uppercase text-muted block">Contract Plan</span>
                <span className="text-sm font-semibold text-ink">Brightloop ERP Monthly</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-muted block">Recurring Rate</span>
                <span className="text-sm font-semibold text-ink">$1,200.00 / month</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-muted block">
                Included Add-ons & Variants:
              </span>
              <div className="p-3 bg-[#FAF9F5] border border-border rounded-sm flex items-center justify-between font-mono">
                <div>
                  <span className="font-medium text-ink">Brand: Odoo Enterprise Integration</span>
                  <span className="text-[10px] text-muted block">SKU: BL-ERP-ODOO-560</span>
                </div>
                <span className="font-semibold text-terracotta">+$560.00 / mo</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-secondary">
              <span className="font-mono text-[11px]">Payment Terms: Net 30</span>
              <Link
                to="/customer/subscriptions"
                className="text-ink font-mono hover:underline flex items-center gap-1"
              >
                <span>Manage Subscription</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Available Plans Spotlight */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-md overflow-hidden">
          <div className="p-4 border-b border-border bg-[#FAF9F6] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink tracking-tight">
              Upgrade or Add Plan
            </h3>
            <Link
              to="/customer/plans"
              className="text-xs font-mono text-ink hover:underline"
            >
              Catalog
            </Link>
          </div>

          <div className="divide-y divide-border text-xs">
            {plans.slice(0, 3).map((pl) => (
              <div key={pl.id} className="p-4 flex items-center justify-between hover:bg-[#FAF9F6]">
                <div>
                  <div className="font-medium text-ink">{pl.name}</div>
                  <div className="text-[11px] font-mono text-muted mt-0.5">
                    {pl.billingInterval} • ${Number(pl.price).toFixed(2)}
                  </div>
                </div>
                <Link
                  to="/customer/plans"
                  className="px-2.5 py-1 bg-ink text-white rounded-sm text-[11px] font-medium hover:bg-ink-light"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
