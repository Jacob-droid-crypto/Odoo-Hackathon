import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, Check, X, ArrowLeft } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password Policy Rules
  const hasMinLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError('Password does not fulfill security requirements (> 8 chars, uppercase, lowercase, special char).');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName,
        lastName,
        companyName: companyName || undefined,
        phone: phone || undefined,
        email,
        password,
      });
      // Registration logs user in automatically and redirects to customer portal
      navigate('/customer/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
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
          Create customer account
        </h2>
        <p className="mt-1 text-xs text-secondary">
          Register to view and manage your self-service subscriptions.
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
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Alice"
                required
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Acme"
                required
              />
            </div>

            <Input
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Corp (Optional)"
            />

            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-555-0102 (Optional)"
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@acme.com"
              required
              autoComplete="email"
            />

            <div>
              <label className="block text-xs font-medium text-ink tracking-tight uppercase mb-1.5">
                Password <span className="text-terracotta">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border hover:border-[#D5D3CC] text-sm text-ink rounded-sm focus:outline-none focus:ring-1 focus:ring-ink focus:border-ink pr-10"
                  placeholder="Min 9 characters"
                  required
                  autoComplete="new-password"
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

              {/* Password Policy Criteria Checklist */}
              <div className="mt-2.5 p-2.5 bg-[#FAF9F5] border border-border rounded-sm space-y-1 font-mono text-[10px]">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[#1E6930]' : 'text-muted'}`}>
                  {hasMinLength ? <Check className="w-3 h-3 text-[#1E6930]" /> : <X className="w-3 h-3 text-muted" />}
                  <span>More than 8 characters ({password.length} chars)</span>
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

            <div>
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                autoComplete="new-password"
                error={confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" loading={loading} className="w-full">
                Register Account
              </Button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-ink underline hover:text-black">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
