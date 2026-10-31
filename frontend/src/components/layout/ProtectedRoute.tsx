import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-mono text-xs text-secondary gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-ink" />
        <span>Verifying Security Context...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-sm bg-terracotta-light text-terracotta flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-ink tracking-tight mb-2">
          Access Restricted
        </h2>
        <p className="text-xs text-secondary max-w-md mb-6 leading-relaxed">
          Your authenticated role <span className="font-mono font-bold text-ink">[{user.role}]</span> is not authorized to access this module. Permissions are enforced by backend security policy.
        </p>
        <Navigate
          to={
            user.role === 'ADMIN'
              ? '/admin/dashboard'
              : user.role === 'STAFF'
              ? '/staff/dashboard'
              : '/customer/dashboard'
          }
          replace
        />
      </div>
    );
  }

  return <>{children}</>;
};
