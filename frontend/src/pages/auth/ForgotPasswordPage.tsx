import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, CheckCircle2, Copy } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    message: string;
    resetToken?: string;
    resetUrl?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.forgotPassword({ email });
      setSuccessData({
        message: res.message || 'Password reset link generated.',
        resetToken: res.data?.resetToken,
        resetUrl: res.data?.resetUrl,
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          Recover Password
        </h2>
        <p className="mt-1 text-xs text-secondary">
          Enter your registered email address to receive a secure reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface py-8 px-6 sm:px-10 border border-border rounded-md shadow-xs">
          {error && (
            <div className="mb-6 p-3 bg-terracotta-light border border-[#F5C6BE] text-terracotta rounded-sm text-xs leading-relaxed">
              {error}
            </div>
          )}

          {successData ? (
            <div className="space-y-4">
              <div className="p-3 bg-[#EBF7EE] border border-[#C8E8CE] text-[#1E6930] rounded-sm text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{successData.message}</p>
                </div>
              </div>

              {successData.resetToken && (
                <div className="p-4 bg-[#FAF9F5] border border-border rounded-sm space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-muted block mb-1">
                      Direct Password Reset URL:
                    </span>
                    <div className="flex items-center justify-between gap-2 p-2 bg-surface border border-border rounded text-[11px] break-all">
                      <span>{successData.resetUrl || `/reset-password?token=${successData.resetToken}`}</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${window.location.origin}/reset-password?token=${successData.resetToken}`
                          )
                        }
                        className="p-1 hover:bg-[#F0EFEA] rounded text-secondary hover:text-ink"
                        title="Copy link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <Link
                    to={`/reset-password?token=${successData.resetToken}`}
                    className="w-full inline-flex items-center justify-center py-2 bg-ink text-white rounded-sm text-xs font-sans hover:bg-ink-light transition-colors"
                  >
                    Proceed to Reset Password
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Registered Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@acme.com"
                required
                autoComplete="email"
              />

              <div className="pt-2">
                <Button type="submit" loading={loading} className="w-full">
                  Send Reset Link
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
