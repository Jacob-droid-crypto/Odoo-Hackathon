import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subvalue?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subvalue,
  trend,
  icon,
  badge,
}) => {
  return (
    <div className="bg-surface border border-border rounded-md p-5 flex flex-col justify-between transition-colors hover:border-[#D5D3CC]">
      <div className="flex items-center justify-between text-secondary mb-3">
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted">
          {label}
        </span>
        {icon && <div className="text-secondary/80">{icon}</div>}
        {badge && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 border border-border rounded-sm bg-[#F6F5F2] text-secondary">
            {badge}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-light text-ink tracking-tight font-sans tabular-nums">
          {value}
        </div>
        {(subvalue || trend) && (
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            {trend && (
              <span
                className={`font-mono font-medium ${
                  trend.isPositive ? 'text-[#1E6930]' : 'text-terracotta'
                }`}
              >
                {trend.value}
              </span>
            )}
            {subvalue && <span className="text-secondary">{subvalue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
