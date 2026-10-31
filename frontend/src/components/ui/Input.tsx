import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, mono, className = '', id, required, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-ink tracking-tight uppercase"
          >
            {label} {required && <span className="text-terracotta">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3 py-2 bg-surface border text-sm text-ink placeholder:text-muted rounded-sm transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ink focus:border-ink ${
            mono ? 'font-mono' : 'font-sans'
          } ${
            error
              ? 'border-terracotta focus:ring-terracotta focus:border-terracotta'
              : 'border-border hover:border-[#D5D3CC]'
          } ${className}`}
          required={required}
          {...props}
        />
        {error && <p className="text-xs text-terracotta tracking-tight">{error}</p>}
        {helper && !error && <p className="text-xs text-secondary">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
