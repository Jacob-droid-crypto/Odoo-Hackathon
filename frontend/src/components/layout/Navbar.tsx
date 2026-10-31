import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { systemApi, HealthStatus } from '../../api/system';
import {
  LogOut,
  User as UserIcon,
  Activity,
  Menu,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Briefcase
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const data = await systemApi.health();
        if (mounted) setHealth(data);
      } catch {
        if (mounted) setHealth(null);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-sm bg-ink text-white">
            <ShieldCheck className="w-3 h-3 text-terracotta" />
            ADMIN
          </span>
        );
      case 'STAFF':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-sm bg-[#EEF2FC] text-[#244A9E] border border-[#CFDBF7]">
            <Briefcase className="w-3 h-3" />
            STAFF
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-sm bg-[#F0EFEA] text-ink border border-border">
            <UserCheck className="w-3 h-3" />
            CUSTOMER
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border h-14">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-1.5 text-secondary hover:text-ink hover:bg-[#F2F1EE] rounded-sm transition-colors"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-sm bg-ink flex items-center justify-center text-white font-mono font-bold text-xs tracking-tighter">
              BL
            </div>
            <span className="text-sm font-semibold tracking-tight text-ink group-hover:text-black">
              Brightloop
            </span>
          </Link>

          {/* Backend Status Dot */}
          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-border text-[11px] font-mono text-secondary">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                health?.status === 'UP' ? 'bg-[#22843A] animate-pulse' : 'bg-terracotta'
              }`}
            />
            <span>{health?.status === 'UP' ? 'Backend Live' : 'Backend Connecting'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-sm hover:bg-[#F2F1EE] transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-sm bg-[#EFEFEA] border border-border flex items-center justify-center text-xs font-mono font-medium text-ink">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-medium text-ink leading-none">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-[10px] text-secondary font-mono mt-0.5 leading-none">
                    {user.email}
                  </div>
                </div>
                <div className="hidden md:block">{roleBadge(user.role)}</div>
                <ChevronDown className="w-3.5 h-3.5 text-secondary" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-md shadow-lg py-1 z-50 text-xs animate-in fade-in-50 zoom-in-95">
                    <div className="px-3 py-2 border-b border-border bg-[#FAFAF8]">
                      <p className="font-semibold text-ink">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[11px] text-secondary font-mono truncate">{user.email}</p>
                      <div className="mt-1.5">{roleBadge(user.role)}</div>
                    </div>

                    <div className="py-1">
                      <Link
                        to={
                          user.role === 'ADMIN'
                            ? '/admin/dashboard'
                            : user.role === 'STAFF'
                            ? '/staff/dashboard'
                            : '/customer/dashboard'
                        }
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-secondary hover:text-ink hover:bg-[#F2F1EE] transition-colors"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        Workspace Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-secondary hover:text-ink hover:bg-[#F2F1EE] transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        Profile Settings
                      </Link>
                    </div>

                    <div className="border-t border-border pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-terracotta hover:bg-terracotta-light transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-medium text-ink px-3 py-1.5 hover:text-black transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-medium bg-ink text-white px-3.5 py-1.5 rounded-sm hover:bg-ink-light transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
