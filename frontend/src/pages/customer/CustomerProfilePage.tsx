import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { User, Building2, Mail, Phone, ShieldCheck, KeyRound } from 'lucide-react';

export const CustomerProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout
      title="Account & Security Settings"
      subtitle="Profile details and authorization credentials verified via GET /api/auth/me."
      breadcrumbs={[{ label: 'Customer', href: '/customer/dashboard' }, { label: 'Profile' }]}
    >
      <div className="max-w-2xl bg-surface border border-border rounded-md p-6 space-y-6 text-xs font-sans shadow-xs">
        <div className="flex items-center justify-between pb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-ink text-white font-mono font-bold text-sm flex items-center justify-center">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-secondary font-mono text-[11px]">{user?.email}</p>
            </div>
          </div>
          <Badge variant="default">{user?.role}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 bg-[#FAF9F5] border border-border rounded-sm">
            <span className="text-[10px] font-mono uppercase text-muted block mb-1">Company Entity</span>
            <div className="flex items-center gap-2 text-ink font-medium">
              <Building2 className="w-3.5 h-3.5 text-secondary" />
              <span>{user?.companyName || 'Individual Account'}</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#FAF9F5] border border-border rounded-sm">
            <span className="text-[10px] font-mono uppercase text-muted block mb-1">Phone Number</span>
            <div className="flex items-center gap-2 text-ink font-mono">
              <Phone className="w-3.5 h-3.5 text-secondary" />
              <span>{user?.phone || 'Not provided'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#F2F1EE] border border-border rounded-sm space-y-2 text-secondary">
          <div className="flex items-center gap-2 text-ink font-semibold font-mono text-[11px]">
            <ShieldCheck className="w-4 h-4 text-[#1E6930]" />
            <span>Security Architecture Compliance</span>
          </div>
          <p className="leading-relaxed">
            Authentication token issued with HS256 JWT signature. Passwords hashed using bcrypt (salt rounds &ge; 10) complying with uppercase, lowercase, minimum 9 characters, and special symbol rules.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
