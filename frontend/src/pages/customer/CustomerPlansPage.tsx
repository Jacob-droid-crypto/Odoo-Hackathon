import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { plansApi } from '../../api/plans';
import { SubscriptionPlan, BillingInterval } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { CalendarDays, CheckCircle2, Check, ArrowRight } from 'lucide-react';

export const CustomerPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    plansApi.list({ isActive: true }).then((res) => {
      if (res.data) setPlans(res.data);
      setLoading(false);
    });
  }, []);

  const handleSubscribeRequest = () => {
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setSelectedPlan(null);
    }, 3000);
  };

  return (
    <DashboardLayout
      title="Available Subscription Plans"
      subtitle="Explore flexible recurring terms (Daily, Weekly, Monthly, Annual) loaded via `/api/plans`."
      breadcrumbs={[{ label: 'Customer', href: '/customer/dashboard' }, { label: 'Available Plans' }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isMonthly = plan.billingInterval === 'MONTHLY';
          const isYearly = plan.billingInterval === 'YEARLY';

          return (
            <div
              key={plan.id}
              className={`bg-surface border rounded-md p-6 flex flex-col justify-between transition-all duration-150 ${
                isMonthly ? 'border-ink shadow-sm ring-1 ring-ink/10' : 'border-border hover:border-[#D0CEC7]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={isYearly ? 'active' : isMonthly ? 'confirmed' : 'default'}>
                    {plan.billingInterval}
                  </Badge>
                  {isMonthly && (
                    <span className="text-[10px] font-mono text-terracotta font-semibold uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}
                </div>

                <h3 className="text-base font-semibold text-ink tracking-tight mb-1">
                  {plan.name}
                </h3>
                <p className="text-xs text-secondary font-mono mb-4">
                  Code: {plan.code}
                </p>

                <div className="mb-6 pb-6 border-b border-border">
                  <div className="text-3xl font-light text-ink font-sans tabular-nums">
                    ${Number(plan.price).toFixed(2)}
                  </div>
                  <span className="text-xs text-muted font-mono block mt-1">
                    Billed every {plan.intervalCount > 1 ? `${plan.intervalCount} ` : ''}
                    {plan.billingInterval.toLowerCase()}
                  </span>
                </div>

                {plan.description && (
                  <p className="text-xs text-secondary mb-6 leading-relaxed">
                    {plan.description}
                  </p>
                )}

                <ul className="space-y-2 text-xs text-secondary font-mono mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1E6930] shrink-0" />
                    <span>Minimum Quantity: {plan.minQuantity} seat(s)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1E6930] shrink-0" />
                    <span>Early Termination: {plan.allowEarlyClose ? 'Permitted' : 'Locked'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1E6930] shrink-0" />
                    <span>Pause Capability: {plan.allowPause ? 'Supported' : 'Unavailable'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1E6930] shrink-0" />
                    <span>Automatic Renewal: {plan.allowRenew ? 'Yes' : 'Manual'}</span>
                  </li>
                </ul>
              </div>

              <Button
                variant={isMonthly ? 'primary' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => setSelectedPlan(plan)}
              >
                Select {plan.name}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Plan Selection Modal */}
      <Modal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        title={`Subscribe to ${selectedPlan?.name}`}
        subtitle={`Rate: $${Number(selectedPlan?.price || 0).toFixed(2)} / ${selectedPlan?.billingInterval.toLowerCase()}`}
      >
        {requestSent ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#1E6930] mx-auto" />
            <h4 className="text-sm font-semibold text-ink">
              Quotation Request Received!
            </h4>
            <p className="text-xs text-secondary">
              A sales representative has been notified to generate a quotation template for your account.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs font-sans">
            <p className="text-secondary leading-relaxed">
              You are requesting to enroll in <strong className="text-ink">{selectedPlan?.name}</strong>.
              This initiates a formal quotation with Net 30 payment terms and recurring interval: <span className="font-mono text-ink">{selectedPlan?.billingInterval}</span>.
            </p>

            <div className="p-3 bg-[#FAF9F5] border border-border rounded-sm space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted">Plan Code:</span>
                <span className="text-ink">{selectedPlan?.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Billing Cycle:</span>
                <span className="text-ink">{selectedPlan?.billingInterval}</span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t border-border">
                <span>Total Due on Billing Day:</span>
                <span className="text-ink">${Number(selectedPlan?.price || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setSelectedPlan(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubscribeRequest}>
                Confirm Quotation Request
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};
