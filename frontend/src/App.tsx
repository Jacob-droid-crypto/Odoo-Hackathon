import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public & Auth Pages
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminVariantsPage } from './pages/admin/AdminVariantsPage';
import { AdminPlansPage } from './pages/admin/AdminPlansPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminStaffPage } from './pages/admin/AdminStaffPage';
import { AdminSystemPage } from './pages/admin/AdminSystemPage';
import { AdminCoordinatedModulePage } from './pages/admin/AdminCoordinatedModules';

// Staff Pages
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { StaffCatalogPage } from './pages/staff/StaffCatalogPage';

// Customer Pages
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage';
import { CustomerSubscriptionsPage } from './pages/customer/CustomerSubscriptionsPage';
import { CustomerPlansPage } from './pages/customer/CustomerPlansPage';
import { CustomerInvoicesPage } from './pages/customer/CustomerInvoicesPage';
import { CustomerProfilePage } from './pages/customer/CustomerProfilePage';

// Smart Profile Resolver
const ProfileResolver: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'CUSTOMER') {
    return <CustomerProfilePage />;
  }
  return <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/staff/dashboard'} replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileResolver />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/variants"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminVariantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/plans"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPlansPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminStaffPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quotations"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCoordinatedModulePage moduleType="quotations" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscriptions"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCoordinatedModulePage moduleType="subscriptions" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/invoices"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCoordinatedModulePage moduleType="invoices" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/discounts"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCoordinatedModulePage moduleType="discounts" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/taxes"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCoordinatedModulePage moduleType="taxes" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCoordinatedModulePage moduleType="payments" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCoordinatedModulePage moduleType="reports" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/system"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminSystemPage />
              </ProtectedRoute>
            }
          />

          {/* Staff Protected Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <StaffDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/customers"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <AdminCustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/catalog"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <StaffCatalogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/quotations"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <AdminCoordinatedModulePage moduleType="quotations" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/subscriptions"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <AdminCoordinatedModulePage moduleType="subscriptions" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/invoices"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <AdminCoordinatedModulePage moduleType="invoices" />
              </ProtectedRoute>
            }
          />

          {/* Customer Portal Protected Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/subscriptions"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerSubscriptionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/plans"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerPlansPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/invoices"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerInvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
