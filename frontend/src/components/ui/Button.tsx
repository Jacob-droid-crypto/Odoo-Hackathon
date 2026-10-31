import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'terracotta' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ink/20 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-ink text-white hover:bg-ink-light active:bg-black border border-ink shadow-xs',
    terracotta:
      'bg-terracotta text-white hover:bg-terracotta-hover active:bg-[#B33B2B] border border-terracotta shadow-xs',
    outline:
      'bg-surface text-ink hover:bg-[#F2F1EE] active:bg-[#EBE9E4] border border-border shadow-xs',
    ghost:
      'bg-transparent text-secondary hover:text-ink hover:bg-[#EFEFEA] active:bg-[#E8E7E1]',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-red-700 shadow-xs',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 rounded-sm gap-1.5',
    md: 'text-sm px-3.5 py-2 rounded-md gap-2',
    lg: 'text-base px-5 py-2.5 rounded-md gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
