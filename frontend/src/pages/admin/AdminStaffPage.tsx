import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { usersApi, CreateStaffPayload } from '../../api/users';
import { getApiErrorMessage } from '../../api/client';
import { User } from '../../types';
import {
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Check,
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone
} from 'lucide-react';

export const AdminStaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await usersApi.list({ role: 'STAFF', limit: 100 });
      if (res.data) setStaffList(res.data);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Password rules
  const hasMinLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecial;

  const openAddModal = () => {
    setFirstName('Sarah');
    setLastName('Ops');
    setEmail('sarah.ops@brightloop.com');
    setPhone('+1-555-0105');
    setPassword('StaffPassword123!');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isPasswordValid) {
      setFormError('Password must exceed 8 characters, contain uppercase, lowercase, and special character.');
      return;
    }

    setFormLoading(true);

    try {
      const payload: CreateStaffPayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      };

      await usersApi.createStaff(payload);
      setIsAddModalOpen(false);
      setSuccessBanner(`Staff account created for ${firstName} ${lastName} (${email}).`);
      setTimeout(() => setSuccessBanner(null), 4000);
      fetchStaff();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Staff Account Provisioning"
      subtitle="Restricted admin-only authorization to create internal operational staff members via POST /api/users/staff."
      action={
        <Button onClick={openAddModal} icon={<UserPlus className="w-3.5 h-3.5" />}>
          Create Staff Member
        </Button>
      }
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Staff Management' },
      ]}
    >
      {successBanner && (
        <div className="mb-6 p-3 bg-[#EBF7EE] border border-[#C8E8CE] text-[#1E6930] rounded-sm text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* RBAC Policy Notice Banner */}
      <div className="bg-[#FAF9F5] border border-border rounded-md p-4 mb-6 text-xs text-secondary leading-relaxed">
        <div className="flex items-center gap-2 font-mono font-semibold text-ink uppercase text-[11px] mb-1">
          <ShieldCheck className="w-4 h-4 text-terracotta" />
          Strict RBAC Enforcement (Admin Privilege Only)
        </div>
        <p>
          According to system specifications, only the system administrator can provision operational staff accounts. Staff members receive access to day-to-day customer subscription queues, but are strictly forbidden from creating other staff members or altering core product pricing.
        </p>
      </div>

      {/* Staff Table */}
      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-[#FAF9F6] border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-semibold text-ink uppercase tracking-wider font-mono">
            Provisioned Staff Personnel
          </h3>
          <span className="text-[11px] font-mono text-muted">
            {staffList.length} Staff Member{staffList.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border font-mono uppercase tracking-wider text-[10px] text-muted bg-[#FCFBF8]">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Work Email</th>
                <th className="py-3 px-4">Direct Phone</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staffList.map((st) => (
                <tr key={st.id} className="hover:bg-[#FAF9F6] transition-colors">
                  <td className="py-3.5 px-4 font-medium text-ink flex items-center gap-2">
                    <div className="w-6 h-6 rounded-sm bg-[#EEF2FC] text-[#244A9E] border border-[#CFDBF7] flex items-center justify-center font-mono text-[10px] font-bold">
                      {st.firstName[0]}{st.lastName[0]}
                    </div>
                    <span>{st.firstName} {st.lastName}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-secondary">
                    {st.email}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-secondary">
                    {st.phone || '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded-sm bg-[#EEF2FC] text-[#244A9E] border border-[#CFDBF7] text-[10px] font-medium">
                      STAFF OPERATOR
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant={st.isActive !== false ? 'active' : 'draft'} dot>
                      {st.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                </tr>
              ))}

              {staffList.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-secondary font-mono">
                    <UserIcon className="w-8 h-8 text-muted mx-auto mb-2" />
                    No staff accounts provisioned. Click &quot;Create Staff Member&quot; to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Staff Account */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision Staff Account"
        subtitle="Exclusive to ADMIN role via POST /api/users/staff"
      >
        {formError && (
          <div className="mb-4 p-2.5 bg-terracotta-light border border-[#F5C6BE] text-terracotta rounded-sm text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Sarah"
              required
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ops"
              required
            />
          </div>

          <Input
            label="Work Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sarah.ops@brightloop.com"
            required
            autoComplete="email"
          />

          <Input
            label="Direct Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1-555-0105"
          />

          <div>
            <Input
              label="Initial Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 9 characters"
              required
            />

            <div className="mt-2.5 p-2.5 bg-[#FAF9F5] border border-border rounded-sm space-y-1 font-mono text-[10px]">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[#1E6930]' : 'text-muted'}`}>
                {hasMinLength ? <Check className="w-3 h-3 text-[#1E6930]" /> : <X className="w-3 h-3 text-muted" />}
                <span>Length &gt; 8 characters ({password.length} chars)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-[#1E6930]' : 'text-muted'}`}>
                {hasUppercase ? <Check className="w-3 h-3 text-[#1E6930]" /> : <X className="w-3 h-3 text-muted" />}
                <span>At least one uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-[#1E6930]' : 'text-muted'}`}>
                {hasLowercase ? <Check className="w-3 h-3 text-[#1E6930]" /> : <X className="w-3 h-3 text-muted" />}
                <span>At least one lowercase letter (a-z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-[#1E6930]' : 'text-muted'}`}>
                {hasSpecial ? <Check className="w-3 h-3 text-[#1E6930]" /> : <X className="w-3 h-3 text-muted" />}
                <span>At least one special character (!@#$%^&*)</span>
              </div>
            </div>
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
              Provision Account
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
