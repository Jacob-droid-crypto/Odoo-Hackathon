import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo',
  badgeText,
  onClick
}) => {
  const colorStyles = {
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badge: 'bg-indigo-50 text-indigo-700',
      border: 'hover:border-indigo-200'
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'bg-emerald-50 text-emerald-700',
      border: 'hover:border-emerald-200'
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: 'bg-amber-50 text-amber-700',
      border: 'hover:border-amber-200'
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      badge: 'bg-rose-50 text-rose-700',
      border: 'hover:border-rose-200'
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      badge: 'bg-blue-50 text-blue-700',
      border: 'hover:border-blue-200'
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      badge: 'bg-purple-50 text-purple-700',
      border: 'hover:border-purple-200'
    }
  };

  const currentTheme = colorStyles[color] || colorStyles.indigo;

  return (
    <div
      onClick={onClick}
      className={`card-hover relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${currentTheme.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
        </div>
        {Icon && (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${currentTheme.iconBg} shadow-2xs`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <span className="text-slate-500 truncate">{subtitle}</span>
        {badgeText && (
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${currentTheme.badge}`}>
            {badgeText}
          </span>
        )}
        {trend && (
          <span
            className={`font-semibold ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
