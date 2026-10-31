import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { usersApi } from '../../api/users';
import { User } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Users, Search, Building2, Phone, Mail, Calendar, Eye } from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.list({
        role: 'CUSTOMER',
        search: searchTerm.trim() || undefined,
        limit: 100,
      });
      if (res.data) setCustomers(res.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  return (
    <DashboardLayout
      title="Customer Directory"
      subtitle="Self-service customer accounts loaded from `/api/users?role=CUSTOMER`."
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Customers' },
      ]}
    >
      {/* Search Header */}
      <div className="bg-surface border border-border rounded-md p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer name, email, or company name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF9F6] border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-ink"
            />
            <Search className="w-3.5 h-3.5 text-secondary absolute left-3 top-2.5" />
          </div>
          <Button type="submit" size="sm" variant="outline">
            Search
          </Button>
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-border font-mono uppercase tracking-wider text-[10px] text-muted">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-[#FCFBF8] transition-colors">
                  <td className="py-3 px-4 font-medium text-ink">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="py-3 px-4 font-mono text-secondary">
                    {c.email}
                  </td>
                  <td className="py-3 px-4 text-ink">
                    {c.companyName || <span className="text-muted">—</span>}
                  </td>
                  <td className="py-3 px-4 font-mono text-secondary">
                    {c.phone || <span className="text-muted">—</span>}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <Badge variant="default">{c.role}</Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={c.isActive !== false ? 'active' : 'draft'} dot>
                      {c.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="p-1 text-secondary hover:text-ink hover:bg-[#F2F1EE] rounded-sm transition-colors"
                      title="Inspect Profile"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {customers.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-secondary font-mono">
                    <Users className="w-8 h-8 text-muted mx-auto mb-2" />
                    No customer accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Customer Profile Details"
        subtitle={`Account ID: ${selectedCustomer?.id}`}
      >
        {selectedCustomer && (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 bg-[#FAF9F5] border border-border rounded-sm space-y-2.5">
              <div className="flex items-center gap-2 text-ink font-semibold text-sm">
                <span>{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
                <Badge variant="active">CUSTOMER</Badge>
              </div>

              <div className="flex items-center gap-2 text-secondary font-mono">
                <Mail className="w-3.5 h-3.5 text-muted" />
                <span>{selectedCustomer.email}</span>
              </div>

              {selectedCustomer.companyName && (
                <div className="flex items-center gap-2 text-secondary">
                  <Building2 className="w-3.5 h-3.5 text-muted" />
                  <span>Company: {selectedCustomer.companyName}</span>
                </div>
              )}

              {selectedCustomer.phone && (
                <div className="flex items-center gap-2 text-secondary font-mono">
                  <Phone className="w-3.5 h-3.5 text-muted" />
                  <span>{selectedCustomer.phone}</span>
                </div>
              )}

              {selectedCustomer.createdAt && (
                <div className="flex items-center gap-2 text-muted font-mono text-[11px] pt-2 border-t border-border">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Registered: {new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};
