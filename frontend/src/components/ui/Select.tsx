import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helper, options, children, className = '', id, required, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-ink tracking-tight uppercase"
          >
            {label} {required && <span className="text-terracotta">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full px-3 py-2 bg-surface border text-sm text-ink rounded-sm transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ink focus:border-ink appearance-none cursor-pointer pr-8 ${
              error
                ? 'border-terracotta focus:ring-terracotta focus:border-terracotta'
                : 'border-border hover:border-[#D5D3CC]'
            } ${className}`}
            required={required}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-secondary">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-terracotta tracking-tight">{error}</p>}
        {helper && !error && <p className="text-xs text-secondary">{helper}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
