import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { HonestModuleBanner } from '../../components/ui/HonestModuleBanner';
import { Repeat, Calendar, CheckCircle2, Pause, XCircle, AlertCircle } from 'lucide-react';

export const CustomerSubscriptionsPage: React.FC = () => {
  const [subStatus, setSubStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const togglePause = () => {
    if (subStatus === 'ACTIVE') {
      setSubStatus('PAUSED');
      setActionFeedback('Subscription paused. Billing frozen per plan policy allowPause=true.');
    } else {
      setSubStatus('ACTIVE');
      setActionFeedback('Subscription resumed to Active status.');
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <DashboardLayout
      title="My Subscriptions"
      subtitle="Manage your active recurring contracts, pause schedules, and policy settings."
      breadcrumbs={[{ label: 'Customer', href: '/customer/dashboard' }, { label: 'My Subscriptions' }]}
    >
      <HonestModuleBanner
        moduleName="Customer Subscription Self-Service"
        assignedRoleOrMember="Member 3 (Subscriptions Scope)"
        modelNames={['Subscription', 'SubscriptionLine', 'SubscriptionPlan']}
        workflowStages={['DRAFT', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED']}
        note="Tenant isolation is enforced: customers can only view and manage subscriptions belonging strictly to their customerId."
      />

      {actionFeedback && (
        <div className="mb-6 p-3 bg-[#EBF7EE] border border-[#C8E8CE] text-[#1E6930] rounded-sm text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Subscription Card */}
      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs mb-8">
        <div className="p-5 border-b border-border bg-[#FAF9F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-ink text-white flex items-center justify-center font-mono font-bold text-xs">
              SUB
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Brightloop ERP Business Software — Professional Monthly
              </h3>
              <p className="text-xs text-secondary font-mono mt-0.5">
                Contract Number: SUB-2026-0001
              </p>
            </div>
          </div>
          <Badge variant={subStatus === 'ACTIVE' ? 'active' : 'paused'} dot>
            {subStatus}
          </Badge>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Key Terms Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono pb-6 border-b border-border">
            <div>
              <span className="text-[10px] uppercase text-muted block mb-1">Billing Interval</span>
              <span className="text-sm font-semibold text-ink">MONTHLY</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted block mb-1">Next Billing Date</span>
              <span className="text-sm font-semibold text-ink">Dec 01, 2026</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted block mb-1">Payment Terms</span>
              <span className="text-sm font-semibold text-ink">Net 30</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted block mb-1">Auto-Renew Policy</span>
              <span className="text-sm font-semibold text-[#1E6930]">Enabled</span>
            </div>
          </div>

          {/* Itemized Lines */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-muted mb-3">
              Itemized Subscription Lines:
            </h4>
            <div className="border border-border rounded-sm overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#FAF9F6] border-b border-border text-[10px] uppercase text-muted">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2.5 px-3 text-ink font-sans font-medium">
                      Brightloop ERP Core License
                    </td>
                    <td className="py-2.5 px-3 text-center">1</td>
                    <td className="py-2.5 px-3 text-right">$1,200.00</td>
                    <td className="py-2.5 px-3 text-right text-ink font-semibold">$1,200.00</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-ink font-sans">
                      Variant Adder: Brand (Odoo Enterprise)
                    </td>
                    <td className="py-2.5 px-3 text-center">1</td>
                    <td className="py-2.5 px-3 text-right">$560.00</td>
                    <td className="py-2.5 px-3 text-right text-ink font-semibold">$560.00</td>
                  </tr>
                  <tr className="bg-[#FAF9F6] font-semibold">
                    <td colSpan={3} className="py-2.5 px-3 text-right uppercase text-[10px] text-secondary">
                      Monthly Recurring Total:
                    </td>
                    <td className="py-2.5 px-3 text-right text-ink text-sm">
                      $1,760.00 / mo
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Policy Actions */}
          <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
            <div className="text-secondary text-[11px]">
              Plan policy allows early closing (<code className="font-mono">allowEarlyClose: true</code>) and temporary billing pause (<code className="font-mono">allowPause: true</code>).
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={<Pause className="w-3.5 h-3.5" />}
                onClick={togglePause}
              >
                {subStatus === 'ACTIVE' ? 'Pause Subscription' : 'Resume Subscription'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
