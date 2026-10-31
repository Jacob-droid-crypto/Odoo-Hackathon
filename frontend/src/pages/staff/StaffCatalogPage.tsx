import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { productsApi } from '../../api/products';
import { plansApi } from '../../api/plans';
import { Product, SubscriptionPlan } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Package, CalendarDays, Layers } from 'lucide-react';

export const StaffCatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productsApi.list(), plansApi.list()])
      .then(([prodRes, planRes]) => {
        if (prodRes.data) setProducts(prodRes.data);
        if (planRes.data) setPlans(planRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout
      title="Product & Plan Catalog"
      subtitle="Operational catalog view for preparing quotes and consulting customers."
      breadcrumbs={[{ label: 'Staff', href: '/staff/dashboard' }, { label: 'Catalog' }]}
    >
      <div className="space-y-8">
        {/* Products */}
        <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-[#FAF9F6] border-b border-border flex items-center justify-between">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
              <Package className="w-4 h-4 text-ink" />
              Active Product Catalog
            </h3>
            <span className="text-[11px] font-mono text-muted">{products.length} Products</span>
          </div>

          <div className="divide-y divide-border text-xs">
            {products.map((p) => (
              <div key={p.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#FAF9F6]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink text-sm">{p.name}</span>
                    <Badge variant="confirmed">{p.type}</Badge>
                  </div>
                  {p.notes && <p className="text-secondary mt-1 text-xs">{p.notes}</p>}
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-muted block text-[10px] uppercase">Base Sales Price</span>
                  <span className="text-base font-semibold text-ink">${Number(p.salesPrice).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-[#FAF9F6] border-b border-border flex items-center justify-between">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider font-mono flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-ink" />
              Recurring Subscription Plans
            </h3>
            <span className="text-[11px] font-mono text-muted">{plans.length} Plans</span>
          </div>

          <div className="divide-y divide-border text-xs">
            {plans.map((pl) => (
              <div key={pl.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#FAF9F6]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink text-sm">{pl.name}</span>
                    <Badge variant="active">{pl.billingInterval}</Badge>
                  </div>
                  <div className="text-[11px] font-mono text-secondary mt-1">
                    Code: {pl.code} • Min Qty: {pl.minQuantity} • Early Close: {pl.allowEarlyClose ? 'Allowed' : 'Disallowed'}
                  </div>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-muted block text-[10px] uppercase">Recurring Cost</span>
                  <span className="text-base font-semibold text-ink">
                    ${Number(pl.price).toFixed(2)}
                    <span className="text-xs font-normal text-muted">/{pl.billingInterval.toLowerCase()}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
