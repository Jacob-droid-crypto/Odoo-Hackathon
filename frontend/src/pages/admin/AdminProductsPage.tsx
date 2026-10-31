import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { productsApi, CreateProductPayload, UpdateProductPayload } from '../../api/products';
import { getApiErrorMessage } from '../../api/client';
import { Product, ProductType } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
  AlertCircle,
  Package
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<ProductType>('SOFTWARE');
  const [formSalesPrice, setFormSalesPrice] = useState('1200.00');
  const [formCostPrice, setFormCostPrice] = useState('400.00');
  const [formNotes, setFormNotes] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (activeFilter !== 'ALL') params.isActive = activeFilter === 'ACTIVE';
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await productsApi.list(params);
      if (res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [typeFilter, activeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const openAddModal = () => {
    setFormName('');
    setFormType('SOFTWARE');
    setFormSalesPrice('1200.00');
    setFormCostPrice('400.00');
    setFormNotes('');
    setFormIsActive(true);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormName(product.name);
    setFormType(product.type);
    setFormSalesPrice(String(product.salesPrice));
    setFormCostPrice(String(product.costPrice || '0.00'));
    setFormNotes(product.notes || '');
    setFormIsActive(product.isActive);
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const payload: CreateProductPayload = {
        name: formName.trim(),
        type: formType,
        salesPrice: parseFloat(formSalesPrice) || 0,
        costPrice: parseFloat(formCostPrice) || 0,
        notes: formNotes.trim() || undefined,
        isActive: formIsActive,
      };

      await productsApi.create(payload);
      setIsAddModalOpen(false);
      setSuccessBanner(`Product "${formName}" created successfully.`);
      setTimeout(() => setSuccessBanner(null), 4000);
      fetchProducts();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setFormError(null);
    setFormLoading(true);

    try {
      const payload: UpdateProductPayload = {
        name: formName.trim(),
        type: formType,
        salesPrice: parseFloat(formSalesPrice) || 0,
        costPrice: parseFloat(formCostPrice) || 0,
        notes: formNotes.trim() || undefined,
        isActive: formIsActive,
      };

      await productsApi.update(selectedProduct.id, payload);
      setIsEditModalOpen(false);
      setSuccessBanner(`Product "${formName}" updated successfully.`);
      setTimeout(() => setSuccessBanner(null), 4000);
      fetchProducts();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    setFormLoading(true);
    try {
      await productsApi.delete(selectedProduct.id);
      setIsDeleteModalOpen(false);
      setSuccessBanner(`Product "${selectedProduct.name}" deactivated.`);
      setTimeout(() => setSuccessBanner(null), 4000);
      fetchProducts();
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Product Management"
      subtitle="Full lifecycle product catalog (Software, Add-ons, Services, and Physical goods) integrated with `/api/products`."
      action={
        <Button onClick={openAddModal} icon={<Plus className="w-3.5 h-3.5" />}>
          Create Product
        </Button>
      }
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Products' },
      ]}
    >
      {successBanner && (
        <div className="mb-6 p-3 bg-[#EBF7EE] border border-[#C8E8CE] text-[#1E6930] rounded-sm text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-border rounded-md p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product name or notes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF9F6] border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-ink"
            />
            <Search className="w-3.5 h-3.5 text-secondary absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="w-36">
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Types' },
                  { value: 'SOFTWARE', label: 'Software' },
                  { value: 'ADDON', label: 'Add-on' },
                  { value: 'SERVICE', label: 'Service' },
                  { value: 'PHYSICAL', label: 'Physical' },
                ]}
              />
            </div>

            <div className="w-36">
              <Select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Status' },
                  { value: 'ACTIVE', label: 'Active Only' },
                  { value: 'INACTIVE', label: 'Inactive' },
                ]}
              />
            </div>

            <Button type="submit" size="sm" variant="outline">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-border font-mono uppercase tracking-wider text-[10px] text-muted">
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Sales Price</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Margin</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => {
                const sales = Number(product.salesPrice) || 0;
                const cost = Number(product.costPrice) || 0;
                const margin = sales - cost;
                const marginPct = sales > 0 ? (margin / sales) * 100 : 0;

                return (
                  <tr key={product.id} className="hover:bg-[#FCFBF8] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-ink text-xs">{product.name}</div>
                      {product.notes && (
                        <div className="text-[11px] text-secondary mt-0.5 max-w-sm line-clamp-1">
                          {product.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={product.type === 'SOFTWARE' ? 'confirmed' : 'default'}>
                        {product.type}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-ink font-medium">
                      ${sales.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-secondary">
                      ${cost.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className={margin >= 0 ? 'text-[#1E6930]' : 'text-terracotta'}>
                        ${margin.toFixed(2)} ({marginPct.toFixed(0)}%)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={product.isActive ? 'active' : 'draft'} dot>
                        {product.isActive ? 'Active' : 'Archived'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/variants?product=${product.id}`}
                          title="Manage Variants"
                          className="p-1 text-secondary hover:text-ink hover:bg-[#F2F1EE] rounded-sm transition-colors"
                        >
                          <Layers className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => openEditModal(product)}
                          title="Edit Product"
                          className="p-1 text-secondary hover:text-ink hover:bg-[#F2F1EE] rounded-sm transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          title="Deactivate"
                          className="p-1 text-secondary hover:text-terracotta hover:bg-terracotta-light rounded-sm transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {products.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-secondary font-mono">
                    <Package className="w-8 h-8 text-muted mx-auto mb-2" />
                    No products matched your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Product */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Product"
        subtitle="Adds product to catalog via POST /api/products"
      >
        {formError && (
          <div className="mb-4 p-2.5 bg-terracotta-light border border-[#F5C6BE] text-terracotta rounded-sm text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <Input
            label="Product Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Enterprise Business Cloud ERP"
            required
          />

          <Select
            label="Product Type"
            value={formType}
            onChange={(e) => setFormType(e.target.value as ProductType)}
            options={[
              { value: 'SOFTWARE', label: 'Software' },
              { value: 'ADDON', label: 'Add-on' },
              { value: 'SERVICE', label: 'Service' },
              { value: 'PHYSICAL', label: 'Physical Product' },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Sales Price ($)"
              type="number"
              step="0.01"
              value={formSalesPrice}
              onChange={(e) => setFormSalesPrice(e.target.value)}
              placeholder="1200.00"
              required
              mono
            />
            <Input
              label="Cost Price ($)"
              type="number"
              step="0.01"
              value={formCostPrice}
              onChange={(e) => setFormCostPrice(e.target.value)}
              placeholder="400.00"
              mono
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink tracking-tight uppercase mb-1.5">
              Internal Notes
            </label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={3}
              placeholder="Operational notes, target audience, specifications..."
              className="w-full px-3 py-2 bg-surface border border-border rounded-sm text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              className="rounded-xs border-border text-ink focus:ring-0 cursor-pointer"
            />
            <label htmlFor="isActiveCheck" className="text-xs text-ink cursor-pointer select-none">
              Publish as active product
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
              Save Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Product */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product"
        subtitle="Update properties via PUT /api/products/:id"
      >
        {formError && (
          <div className="mb-4 p-2.5 bg-terracotta-light border border-[#F5C6BE] text-terracotta rounded-sm text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleUpdateProduct} className="space-y-4">
          <Input
            label="Product Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <Select
            label="Product Type"
            value={formType}
            onChange={(e) => setFormType(e.target.value as ProductType)}
            options={[
              { value: 'SOFTWARE', label: 'Software' },
              { value: 'ADDON', label: 'Add-on' },
              { value: 'SERVICE', label: 'Service' },
              { value: 'PHYSICAL', label: 'Physical Product' },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Sales Price ($)"
              type="number"
              step="0.01"
              value={formSalesPrice}
              onChange={(e) => setFormSalesPrice(e.target.value)}
              required
              mono
            />
            <Input
              label="Cost Price ($)"
              type="number"
              step="0.01"
              value={formCostPrice}
              onChange={(e) => setFormCostPrice(e.target.value)}
              mono
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink tracking-tight uppercase mb-1.5">
              Internal Notes
            </label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-surface border border-border rounded-sm text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="editIsActiveCheck"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              className="rounded-xs border-border text-ink focus:ring-0 cursor-pointer"
            />
            <label htmlFor="editIsActiveCheck" className="text-xs text-ink cursor-pointer select-none">
              Active in catalog
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
              Update Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Deactivate/Delete */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Deactivate Product"
        subtitle="Confirmation required"
      >
        <p className="text-xs text-secondary leading-relaxed mb-6">
          Are you sure you want to deactivate <strong className="text-ink">{selectedProduct?.name}</strong>?
          This executes a soft delete via <code className="font-mono bg-[#FAF9F5] px-1 py-0.5 rounded">DELETE /api/products/:id</code>, marking it archived without breaking active subscriptions.
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
            onClick={handleDeleteProduct}
            loading={formLoading}
          >
            Confirm Deactivation
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
