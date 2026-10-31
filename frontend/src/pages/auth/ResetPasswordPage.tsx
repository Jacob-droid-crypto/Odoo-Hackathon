import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Check, X, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasMinLength = newPassword.length > 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('A valid reset token is required.');
      return;
    }

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
      await authApi.resetPassword({
        token,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-ink font-mono mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>

        <h2 className="text-2xl font-light text-ink tracking-tight editorial-heading">
          Set New Password
        </h2>
        <p className="mt-1 text-xs text-secondary">
          Enter your reset token and new compliant password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface py-8 px-6 sm:px-10 border border-border rounded-md shadow-xs">
          {error && (
            <div className="mb-6 p-3 bg-terracotta-light border border-[#F5C6BE] text-terracotta rounded-sm text-xs leading-relaxed">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#EBF7EE] border border-[#C8E8CE] text-[#1E6930] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-ink">
                Password Reset Successfully!
              </h3>
              <p className="text-xs text-secondary">
                You will be redirected to the login page shortly.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 bg-ink text-white rounded-sm text-xs"
                >
                  Proceed to Login Now
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Reset Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Hexadecimal token string"
                required
                mono
              />

              <div>
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 9 characters"
                  required
                />

                <div className="mt-2.5 p-2.5 bg-[#FAF9F5] border border-border rounded-sm space-y-1 font-mono text-[10px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[#1E6930]' : 'text-muted'}`}>
                    {hasMinLength ? <Check className="w-3 h-3 text-[#1E6930]" /> : <X className="w-3 h-3 text-muted" />}
                    <span>More than 8 characters ({newPassword.length} chars)</span>
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

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                error={confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined}
              />

              <div className="pt-2">
                <Button type="submit" loading={loading} className="w-full">
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
