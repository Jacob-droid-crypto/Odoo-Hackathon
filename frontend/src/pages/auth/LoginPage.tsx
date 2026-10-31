import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, ShieldCheck, UserCheck, Briefcase, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password });
      // Redirect based on backend role authority
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role: 'ADMIN' | 'STAFF' | 'CUSTOMER') => {
    if (role === 'ADMIN') {
      setEmail('admin@brightloop.com');
      setPassword('Admin@Brightloop123!');
    } else if (role === 'STAFF') {
      setEmail('staff@brightloop.com');
      setPassword('Staff@Brightloop123!');
    } else {
      setEmail('customer@acme.com');
      setPassword('Customer@Brightloop123!');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-ink font-mono mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Homepage
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-ink flex items-center justify-center text-white font-mono font-bold text-xs">
            BL
          </div>
          <span className="text-lg font-semibold tracking-tight text-ink">
            Brightloop
          </span>
        </div>
        <h2 className="mt-4 text-2xl font-light text-ink tracking-tight editorial-heading">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-secondary">
          Enter your credentials to access your subscription workspace.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface py-8 px-6 sm:px-10 border border-border rounded-md shadow-xs">
          {error && (
            <div className="mb-6 p-3 bg-terracotta-light border border-[#F5C6BE] text-terracotta rounded-sm text-xs leading-relaxed">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@brightloop.com"
              required
              autoComplete="email"
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-ink tracking-tight uppercase">
                  Password <span className="text-terracotta">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-secondary hover:text-ink font-mono"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border hover:border-[#D5D3CC] text-sm text-ink rounded-sm focus:outline-none focus:ring-1 focus:ring-ink focus:border-ink pr-10"
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-ink"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" loading={loading} className="w-full">
                Sign In
              </Button>
            </div>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-8 pt-6 border-t border-border">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-muted text-center mb-3">
              One-Click Demo Account Quick Fill
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('ADMIN')}
                className="p-2 border border-border rounded-sm bg-[#FAF9F6] hover:bg-[#F2F0EB] text-left transition-colors"
              >
                <div className="flex items-center gap-1 text-[11px] font-semibold text-ink font-mono">
                  <ShieldCheck className="w-3 h-3 text-terracotta shrink-0" />
                  Admin
                </div>
                <div className="text-[10px] text-muted truncate mt-0.5">admin@brightloop</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('STAFF')}
                className="p-2 border border-border rounded-sm bg-[#FAF9F6] hover:bg-[#F2F0EB] text-left transition-colors"
              >
                <div className="flex items-center gap-1 text-[11px] font-semibold text-ink font-mono">
                  <Briefcase className="w-3 h-3 text-[#244A9E] shrink-0" />
                  Staff
                </div>
                <div className="text-[10px] text-muted truncate mt-0.5">staff@brightloop</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('CUSTOMER')}
                className="p-2 border border-border rounded-sm bg-[#FAF9F6] hover:bg-[#F2F0EB] text-left transition-colors"
              >
                <div className="flex items-center gap-1 text-[11px] font-semibold text-ink font-mono">
                  <UserCheck className="w-3 h-3 text-[#1E6930] shrink-0" />
                  Customer
                </div>
                <div className="text-[10px] text-muted truncate mt-0.5">customer@acme</div>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-secondary">
          Don&apos;t have an account yet?{' '}
          <Link to="/register" className="font-medium text-ink underline hover:text-black">
            Register as Customer
          </Link>
        </p>
      </div>
    </div>
  );
};
