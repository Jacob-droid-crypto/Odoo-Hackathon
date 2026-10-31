import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { plansApi, CreatePlanPayload, UpdatePlanPayload } from '../../api/plans';
import { productsApi } from '../../api/products';
import { getApiErrorMessage } from '../../api/client';
import { SubscriptionPlan, BillingInterval, Product } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  CalendarDays,
  CheckCircle2,
  Check,
  X,
  Repeat
} from 'lucide-react';

export const AdminPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [intervalFilter, setIntervalFilter] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // Form state
  const [formProductId, setFormProductId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('1200.00');
  const [formInterval, setFormInterval] = useState<BillingInterval>('MONTHLY');
  const [formIntervalCount, setFormIntervalCount] = useState('1');
  const [formMinQuantity, setFormMinQuantity] = useState('1');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formAutoClose, setFormAutoClose] = useState(false);
  const [formAllowEarlyClose, setFormAllowEarlyClose] = useState(true);
  const [formAllowPause, setFormAllowPause] = useState(true);
  const [formAllowRenew, setFormAllowRenew] = useState(true);
  const [formIsActive, setFormIsActive] = useState(true);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [planRes, prodRes] = await Promise.all([
        plansApi.list(intervalFilter !== 'ALL' ? { billingInterval: intervalFilter as BillingInterval } : undefined),
        productsApi.list(),
      ]);
      if (planRes.data) setPlans(planRes.data);
      if (prodRes.data) {
        setProducts(prodRes.data);
        if (prodRes.data.length > 0 && !formProductId) {
          setFormProductId(prodRes.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [intervalFilter]);

  const openAddModal = (interval: BillingInterval = 'MONTHLY') => {
    setFormProductId(products[0]?.id || '');
    setFormName(`Brightloop ${interval.charAt(0) + interval.slice(1).toLowerCase()} Subscription`);
    setFormCode(`BL-ERP-${interval}`);
    setFormDescription(`Standard ${interval.toLowerCase()} recurring subscription plan.`);
    setFormPrice(interval === 'DAILY' ? '45.00' : interval === 'WEEKLY' ? '300.00' : interval === 'YEARLY' ? '12000.00' : '1200.00');
    setFormInterval(interval);
    setFormIntervalCount('1');
    setFormMinQuantity('1');
    setFormStartDate('');
    setFormEndDate('');
    setFormAutoClose(false);
    setFormAllowEarlyClose(true);
    setFormAllowPause(true);
    setFormAllowRenew(true);
    setFormIsActive(true);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormProductId(plan.productId);
    setFormName(plan.name);
    setFormCode(plan.code);
    setFormDescription(plan.description || '');
    setFormPrice(String(plan.price));
    setFormInterval(plan.billingInterval);
    setFormIntervalCount(String(plan.intervalCount));
    setFormMinQuantity(String(plan.minQuantity));
    setFormStartDate(plan.startDate ? plan.startDate.slice(0, 10) : '');
    setFormEndDate(plan.endDate ? plan.endDate.slice(0, 10) : '');
    setFormAutoClose(plan.autoClose);
    setFormAllowEarlyClose(plan.allowEarlyClose);
    setFormAllowPause(plan.allowPause);
    setFormAllowRenew(plan.allowRenew);
    setFormIsActive(plan.isActive);
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const payload: CreatePlanPayload = {
        productId: formProductId,
        name: formName.trim(),
        code: formCode.trim(),
        description: formDescription.trim() || undefined,
        price: parseFloat(formPrice) || 0,
        billingInterval: formInterval,
        intervalCount: parseInt(formIntervalCount, 10) || 1,
        minQuantity: parseInt(formMinQuantity, 10) || 1,
        startDate: formStartDate ? new Date(formStartDate).toISOString() : null,
        endDate: formEndDate ? new Date(formEndDate).toISOString() : null,
        autoClose: formAutoClose,
        allowEarlyClose: formAllowEarlyClose,
        allowPause: formAllowPause,
        allowRenew: formAllowRenew,
        isActive: formIsActive,
      };

      await plansApi.create(payload);
      setIsAddModalOpen(false);
      setSuccessBanner(`Plan "${formName}" created successfully.`);
      setTimeout(() => setSuccessBanner(null), 4000);
      fetchData();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setFormError(null);
    setFormLoading(true);

    try {
      const payload: UpdatePlanPayload = {
        productId: formProductId,
        name: formName.trim(),
        code: formCode.trim(),
        description: formDescription.trim() || undefined,
        price: parseFloat(formPrice) || 0,
        billingInterval: formInterval,
        intervalCount: parseInt(formIntervalCount, 10) || 1,
        minQuantity: parseInt(formMinQuantity, 10) || 1,
        startDate: formStartDate ? new Date(formStartDate).toISOString() : null,
        endDate: formEndDate ? new Date(formEndDate).toISOString() : null,
        autoClose: formAutoClose,
        allowEarlyClose: formAllowEarlyClose,
        allowPause: formAllowPause,
        allowRenew: formAllowRenew,
        isActive: formIsActive,
      };

      await plansApi.update(selectedPlan.id, payload);
      setIsEditModalOpen(false);
      setSuccessBanner(`Plan "${formName}" updated.`);
      setTimeout(() => setSuccessBanner(null), 4000);
      fetchData();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    setFormLoading(true);
    try {
      await plansApi.delete(selectedPlan.id);
      setIsDeleteModalOpen(false);
      setSuccessBanner(`Plan "${selectedPlan.name}" deactivated.`);
      setTimeout(() => setSuccessBanner(null), 4000);
      fetchData();
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Subscription Plans"
      subtitle="Define recurring intervals (Daily, Weekly, Monthly, Yearly) and policy rules via `/api/plans`."
      action={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openAddModal('DAILY')}
          >
            + Daily Pass
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openAddModal('YEARLY')}
          >
            + Annual Plan
          </Button>
          <Button
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => openAddModal('MONTHLY')}
          >
            Create Plan
          </Button>
        </div>
      }
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Subscription Plans' },
      ]}
    >
      {successBanner && (
        <div className="mb-6 p-3 bg-[#EBF7EE] border border-[#C8E8CE] text-[#1E6930] rounded-sm text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Interval Tabs Filter */}
      <div className="bg-surface border border-border rounded-md p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map((interval) => (
            <button
              key={interval}
              onClick={() => setIntervalFilter(interval)}
              className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-colors ${
                intervalFilter === interval
                  ? 'bg-ink text-white font-medium'
                  : 'bg-[#FAF9F6] text-secondary hover:text-ink border border-border'
              }`}
            >
              {interval === 'ALL' ? 'All Intervals' : interval}
            </button>
          ))}
        </div>
        <span className="text-[11px] font-mono text-muted">
          Showing {plans.length} plan{plans.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Plans Table */}
      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-border font-mono uppercase tracking-wider text-[10px] text-muted">
                <th className="py-3 px-4">Plan & Code</th>
                <th className="py-3 px-4">Interval</th>
                <th className="py-3 px-4 text-right">Recurring Rate</th>
                <th className="py-3 px-4 text-center">Policy: Early Close</th>
                <th className="py-3 px-4 text-center">Policy: Pause</th>
                <th className="py-3 px-4 text-center">Policy: Renew</th>
                <th className="py-3 px-4 text-center">Auto-Close</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plans.map((plan) => {
                const intervalColors: Record<string, string> = {
                  DAILY: 'bg-amber-50 text-amber-800 border-amber-200',
                  WEEKLY: 'bg-sky-50 text-sky-800 border-sky-200',
                  MONTHLY: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                  YEARLY: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                };

                return (
                  <tr key={plan.id} className="hover:bg-[#FCFBF8] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-ink">{plan.name}</div>
                      <div className="text-[11px] font-mono text-muted mt-0.5">
                        Code: {plan.code}
                      </div>
                      {plan.description && (
                        <div className="text-[11px] text-secondary mt-0.5 line-clamp-1">
                          {plan.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={`px-2 py-0.5 text-[10px] font-medium border rounded-sm ${intervalColors[plan.billingInterval] || 'bg-stone-50'}`}>
                        {plan.intervalCount > 1 ? `Every ${plan.intervalCount} ` : ''}
                        {plan.billingInterval}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-ink">
                      ${Number(plan.price).toFixed(2)}
                      <span className="text-[10px] text-muted block">
                        /{plan.billingInterval.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {plan.allowEarlyClose ? (
                        <Check className="w-3.5 h-3.5 text-[#1E6930] mx-auto" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-muted mx-auto" />
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {plan.allowPause ? (
                        <Check className="w-3.5 h-3.5 text-[#1E6930] mx-auto" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-muted mx-auto" />
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {plan.allowRenew ? (
                        <Check className="w-3.5 h-3.5 text-[#1E6930] mx-auto" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-muted mx-auto" />
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-[10px]">
                      {plan.autoClose ? (
                        <span className="text-terracotta">Yes (At End)</span>
                      ) : (
                        <span className="text-muted">No</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={plan.isActive ? 'active' : 'draft'} dot>
                        {plan.isActive ? 'Active' : 'Archived'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(plan)}
                          title="Edit Plan"
                          className="p-1 text-secondary hover:text-ink hover:bg-[#F2F1EE] rounded-sm transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPlan(plan);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Deactivate Plan"
                          className="p-1 text-secondary hover:text-terracotta hover:bg-terracotta-light rounded-sm transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {plans.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-secondary font-mono">
                    <CalendarDays className="w-8 h-8 text-muted mx-auto mb-2" />
                    No subscription plans found. Click &quot;Create Plan&quot; to configure recurring billing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Plan */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Subscription Plan"
        subtitle="Defines recurring interval and lifecycle policies via POST /api/plans"
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-2.5 bg-terracotta-light border border-[#F5C6BE] text-terracotta rounded-sm text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <Select
            label="Base Product"
            value={formProductId}
            onChange={(e) => setFormProductId(e.target.value)}
            options={products.map((p) => ({
              value: p.id,
              label: `${p.name} ($${Number(p.salesPrice).toFixed(2)})`,
            }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Plan Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Monthly Professional"
              required
            />
            <Input
              label="Plan Unique Code"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              placeholder="e.g. BL-ERP-MONTHLY"
              required
              mono
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              required
              mono
            />
            <Select
              label="Billing Interval"
              value={formInterval}
              onChange={(e) => setFormInterval(e.target.value as BillingInterval)}
              options={[
                { value: 'DAILY', label: 'DAILY' },
                { value: 'WEEKLY', label: 'WEEKLY' },
                { value: 'MONTHLY', label: 'MONTHLY' },
                { value: 'YEARLY', label: 'YEARLY' },
              ]}
            />
            <Input
              label="Interval Count"
              type="number"
              min="1"
              value={formIntervalCount}
              onChange={(e) => setFormIntervalCount(e.target.value)}
              required
              mono
              helper="e.g. every 1 month"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink tracking-tight uppercase mb-1.5">
              Plan Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-surface border border-border rounded-sm text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>

          {/* Policy Flags Checklist */}
          <div className="p-3 bg-[#FAF9F5] border border-border rounded-sm space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted block mb-1">
              Lifecycle Policy Governance Flags:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formAllowEarlyClose}
                  onChange={(e) => setFormAllowEarlyClose(e.target.checked)}
                  className="rounded-xs border-border text-ink"
                />
                <span>Allow Early Close (Termination)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formAllowPause}
                  onChange={(e) => setFormAllowPause(e.target.checked)}
                  className="rounded-xs border-border text-ink"
                />
                <span>Allow Pause (Freeze Billing)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formAllowRenew}
                  onChange={(e) => setFormAllowRenew(e.target.checked)}
                  className="rounded-xs border-border text-ink"
                />
                <span>Allow Term Renewal</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formAutoClose}
                  onChange={(e) => setFormAutoClose(e.target.checked)}
                  className="rounded-xs border-border text-ink"
                />
                <span>Auto-Close on End Date</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="planIsActive"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              className="rounded-xs border-border text-ink cursor-pointer"
            />
            <label htmlFor="planIsActive" className="text-xs text-ink cursor-pointer select-none">
              Publish as active plan
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={formLoading}>
              Save Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Plan */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Subscription Plan"
        subtitle={`Editing ${selectedPlan?.name}`}
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-2.5 bg-terracotta-light border border-[#F5C6BE] text-terracotta rounded-sm text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleUpdatePlan} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Plan Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <Input
              label="Plan Unique Code"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              required
              mono
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              required
              mono
            />
            <Select
              label="Billing Interval"
              value={formInterval}
              onChange={(e) => setFormInterval(e.target.value as BillingInterval)}
              options={[
                { value: 'DAILY', label: 'DAILY' },
                { value: 'WEEKLY', label: 'WEEKLY' },
                { value: 'MONTHLY', label: 'MONTHLY' },
                { value: 'YEARLY', label: 'YEARLY' },
              ]}
            />
            <Input
              label="Interval Count"
              type="number"
              min="1"
              value={formIntervalCount}
              onChange={(e) => setFormIntervalCount(e.target.value)}
              required
              mono
            />
          </div>

          <div className="p-3 bg-[#FAF9F5] border border-border rounded-sm space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted block mb-1">
              Policy Flags:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formAllowEarlyClose}
                  onChange={(e) => setFormAllowEarlyClose(e.target.checked)}
                />
                <span>Allow Early Close</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formAllowPause}
                  onChange={(e) => setFormAllowPause(e.target.checked)}
                />
                <span>Allow Pause</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formAllowRenew}
                  onChange={(e) => setFormAllowRenew(e.target.checked)}
                />
                <span>Allow Renew</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formAutoClose}
                  onChange={(e) => setFormAutoClose(e.target.checked)}
                />
                <span>Auto-Close on End</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={formLoading}>
              Update Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Deactivate Plan */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Deactivate Subscription Plan"
        subtitle="Confirmation"
      >
        <p className="text-xs text-secondary leading-relaxed mb-6">
          Are you sure you want to deactivate <strong className="text-ink">{selectedPlan?.name}</strong>?
          This executes <code className="font-mono bg-[#FAF9F5] px-1 py-0.5 rounded">DELETE /api/plans/:id</code>, archiving it from public signups.
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeletePlan}
            loading={formLoading}
          >
            Confirm Deactivation
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
