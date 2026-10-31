import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { productsApi, CreateVariantPayload, UpdateVariantPayload } from '../../api/products';
import { getApiErrorMessage } from '../../api/client';
import { Product, ProductVariant } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Info
} from 'lucide-react';

export const AdminVariantsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const preselectedProductId = searchParams.get('product') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(preselectedProductId);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Form State
  const [formVariantName, setFormVariantName] = useState('Brand: Odoo Integration');
  const [formAttributeName, setFormAttributeName] = useState('Brand');
  const [formAttributeValue, setFormAttributeValue] = useState('Odoo');
  const [formPriceExtra, setFormPriceExtra] = useState('560.00');
  const [formSku, setFormSku] = useState('BL-ERP-ODOO-560');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Load products list
  useEffect(() => {
    productsApi.list().then((res) => {
      if (res.data && res.data.length > 0) {
        setProducts(res.data);
        if (!selectedProductId) {
          setSelectedProductId(res.data[0].id);
        }
      }
    });
  }, []);

  // Load variants when product selection changes
  const fetchVariants = async () => {
    if (!selectedProductId) return;
    setLoading(true);
    try {
      const res = await productsApi.listVariants(selectedProductId);
      if (res.data) {
        setVariants(res.data);
      }
    } catch (err) {
      console.error('Error fetching variants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProductId) {
      setSearchParams({ product: selectedProductId });
      fetchVariants();
    }
  }, [selectedProductId]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const openAddModal = (presetOdoo = false) => {
    if (presetOdoo) {
      setFormVariantName('Brand: Odoo Enterprise Integration');
      setFormAttributeName('Brand');
      setFormAttributeValue('Odoo');
      setFormPriceExtra('560.00');
      setFormSku('BL-ODOO-560');
    } else {
      setFormVariantName('');
      setFormAttributeName('Edition');
      setFormAttributeValue('Pro');
      setFormPriceExtra('250.00');
      setFormSku('');
    }
    setFormIsActive(true);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setFormVariantName(variant.variantName);
    setFormAttributeName(variant.attributeName);
    setFormAttributeValue(variant.attributeValue);
    setFormPriceExtra(String(variant.priceExtra));
    setFormSku(variant.sku || '');
    setFormIsActive(variant.isActive);
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setIsDeleteModalOpen(true);
  };

  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    setFormError(null);
    setFormLoading(true);

    try {
      const payload: CreateVariantPayload = {
        variantName: formVariantName.trim(),
        attributeName: formAttributeName.trim(),
        attributeValue: formAttributeValue.trim(),
        priceExtra: parseFloat(formPriceExtra) || 0,
        sku: formSku.trim() || undefined,
        isActive: formIsActive,
      };

      await productsApi.createVariant(selectedProductId, payload);
      setIsAddModalOpen(false);
      setSuccessBanner(`Variant "${formVariantName}" added with +$${Number(formPriceExtra).toFixed(2)} price adder.`);
      setTimeout(() => setSuccessBanner(null), 4000);
      fetchVariants();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedVariant) return;
    setFormError(null);
    setFormLoading(true);

    try {
      const payload: UpdateVariantPayload = {
        variantName: formVariantName.trim(),
        attributeName: formAttributeName.trim(),
        attributeValue: formAttributeValue.trim(),
        priceExtra: parseFloat(formPriceExtra) || 0,
        sku: formSku.trim() || undefined,
        isActive: formIsActive,
      };

      await productsApi.updateVariant(selectedProductId, selectedVariant.id, payload);
      setIsEditModalOpen(false);
      setSuccessBanner(`Variant updated successfully.`);
      setTimeout(() => setSuccessBanner(null), 4000);
      fetchVariants();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteVariant = async () => {
    if (!selectedProductId || !selectedVariant) return;
    setFormLoading(true);
    try {
      await productsApi.deleteVariant(selectedProductId, selectedVariant.id);
      setIsDeleteModalOpen(false);
      setSuccessBanner(`Variant deactivated.`);
      setTimeout(() => setSuccessBanner(null), 4000);
      fetchVariants();
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const basePrice = Number(selectedProduct?.salesPrice || 0);

  return (
    <DashboardLayout
      title="Product Variant Engine"
      subtitle="Configure dynamic attributes and price adders (e.g. Odoo brand adding $560 to base price) via `/api/products/:productId/variants`."
      action={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="terracotta"
            icon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={() => openAddModal(true)}
          >
            + Quick Add Odoo Brand (+560)
          </Button>
          <Button
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => openAddModal(false)}
          >
            Add Variant
          </Button>
        </div>
      }
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Products', href: '/admin/products' },
        { label: 'Variants' },
      ]}
    >
      {successBanner && (
        <div className="mb-6 p-3 bg-[#EBF7EE] border border-[#C8E8CE] text-[#1E6930] rounded-sm text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Target Base Product Selector Card */}
      <div className="bg-surface border border-border rounded-md p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6">
            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
              Select Target Product to Manage Variants:
            </label>
            <Select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              options={products.map((p) => ({
                value: p.id,
                label: `${p.name} ($${Number(p.salesPrice).toFixed(2)}) — [${p.type}]`,
              }))}
            />
          </div>

          {selectedProduct && (
            <div className="md:col-span-6 flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted block">
                  Base Sales Price
                </span>
                <span className="text-xl font-light text-ink font-mono tabular-nums">
                  ${basePrice.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted block">
                  Product Type
                </span>
                <Badge variant="confirmed">{selectedProduct.type}</Badge>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted block">
                  Configured Variants
                </span>
                <span className="text-xl font-light text-ink font-mono tabular-nums">
                  {variants.length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Variants Table */}
      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-[#FAF9F6] border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-ink" />
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider font-mono">
              Variants for: {selectedProduct?.name || 'Selected Product'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-secondary">
            Route: POST/GET /api/products/:productId/variants
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border font-mono uppercase tracking-wider text-[10px] text-muted bg-[#FCFBF8]">
                <th className="py-3 px-4">Variant Name</th>
                <th className="py-3 px-4">Attribute Key</th>
                <th className="py-3 px-4">Attribute Value</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4 text-right">Price Extra (Adder)</th>
                <th className="py-3 px-4 text-right">Final Total Price</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {variants.map((variant) => {
                const extra = Number(variant.priceExtra) || 0;
                const finalTotal = basePrice + extra;

                return (
                  <tr key={variant.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3 px-4 font-medium text-ink">
                      {variant.variantName}
                    </td>
                    <td className="py-3 px-4 font-mono text-secondary">
                      {variant.attributeName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-sm bg-[#F2F1EE] border border-border font-mono text-ink text-[11px]">
                        {variant.attributeValue}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted text-[11px]">
                      {variant.sku || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-terracotta font-medium">
                      +${extra.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-ink font-semibold">
                      ${finalTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={variant.isActive ? 'active' : 'draft'} dot>
                        {variant.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(variant)}
                          title="Edit Variant"
                          className="p-1 text-secondary hover:text-ink hover:bg-[#F2F1EE] rounded-sm transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(variant)}
                          title="Deactivate Variant"
                          className="p-1 text-secondary hover:text-terracotta hover:bg-terracotta-light rounded-sm transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {variants.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-secondary font-mono">
                    <Layers className="w-8 h-8 text-muted mx-auto mb-2" />
                    No variants created for this product yet. Click &quot;Quick Add Odoo Brand (+560)&quot; or &quot;Add Variant&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Variant */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Product Variant"
        subtitle={`Base: ${selectedProduct?.name} ($${basePrice.toFixed(2)})`}
      >
        {formError && (
          <div className="mb-4 p-2.5 bg-terracotta-light border border-[#F5C6BE] text-terracotta rounded-sm text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateVariant} className="space-y-4">
          <Input
            label="Variant Display Name"
            value={formVariantName}
            onChange={(e) => setFormVariantName(e.target.value)}
            placeholder="e.g. Brand: Odoo Integration"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Attribute Name"
              value={formAttributeName}
              onChange={(e) => setFormAttributeName(e.target.value)}
              placeholder="e.g. Brand"
              required
            />
            <Input
              label="Attribute Value"
              value={formAttributeValue}
              onChange={(e) => setFormAttributeValue(e.target.value)}
              placeholder="e.g. Odoo"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price Extra ($)"
              type="number"
              step="0.01"
              value={formPriceExtra}
              onChange={(e) => setFormPriceExtra(e.target.value)}
              placeholder="560.00"
              required
              mono
              helper="Added to base sales price"
            />
            <Input
              label="SKU Code"
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
              placeholder="BL-ERP-ODOO-560"
              mono
            />
          </div>

          {/* Price Preview */}
          <div className="p-3 bg-[#FAF9F5] border border-border rounded-sm flex items-center justify-between text-xs font-mono">
            <span className="text-secondary">Combined Total:</span>
            <span className="font-semibold text-ink">
              ${(basePrice + (parseFloat(formPriceExtra) || 0)).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="varIsActive"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              className="rounded-xs border-border text-ink cursor-pointer"
            />
            <label htmlFor="varIsActive" className="text-xs text-ink cursor-pointer select-none">
              Variant active and selectable in quotations
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
              Save Variant
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Variant */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Variant"
        subtitle={`Editing ${selectedVariant?.variantName}`}
      >
        {formError && (
          <div className="mb-4 p-2.5 bg-terracotta-light border border-[#F5C6BE] text-terracotta rounded-sm text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleUpdateVariant} className="space-y-4">
          <Input
            label="Variant Display Name"
            value={formVariantName}
            onChange={(e) => setFormVariantName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Attribute Name"
              value={formAttributeName}
              onChange={(e) => setFormAttributeName(e.target.value)}
              required
            />
            <Input
              label="Attribute Value"
              value={formAttributeValue}
              onChange={(e) => setFormAttributeValue(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price Extra ($)"
              type="number"
              step="0.01"
              value={formPriceExtra}
              onChange={(e) => setFormPriceExtra(e.target.value)}
              required
              mono
            />
            <Input
              label="SKU Code"
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
              mono
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="editVarIsActive"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              className="rounded-xs border-border text-ink cursor-pointer"
            />
            <label htmlFor="editVarIsActive" className="text-xs text-ink cursor-pointer select-none">
              Variant active
            </label>
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
              Update Variant
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete Variant */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Deactivate Variant"
        subtitle="Confirmation"
      >
        <p className="text-xs text-secondary leading-relaxed mb-6">
          Are you sure you want to deactivate variant <strong className="text-ink">{selectedVariant?.variantName}</strong>?
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
            onClick={handleDeleteVariant}
            loading={formLoading}
          >
            Confirm Deactivation
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
