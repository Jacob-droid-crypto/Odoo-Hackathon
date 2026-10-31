import React from 'react';
import { Calendar } from 'lucide-react';

export const DateRangePicker = ({ period, onChange }) => {
  const options = [
    { id: 'last_7_days', label: 'Last 7 Days' },
    { id: 'last_30_days', label: 'Last 30 Days' },
    { id: 'last_3_months', label: 'Last 3 Months' },
    { id: 'last_6_months', label: 'Last 6 Months' },
    { id: 'this_year', label: 'This Year' }
  ];

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1 shadow-2xs">
      <div className="hidden sm:flex items-center pl-2 pr-1 text-slate-400">
        <Calendar className="h-3.5 w-3.5" />
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {options.map((opt) => {
          const isSelected = period === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
