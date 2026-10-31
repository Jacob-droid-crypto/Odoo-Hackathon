import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import { TrendingUp } from 'lucide-react';

export const RevenueChart = ({ data = [], currencyCode = 'USD', currencySymbol = '$', period, onPeriodChange }) => {
  // Fallback demo points if data is initially empty
  const chartData = data && data.length > 0 ? data : [
    { date: 'Day 1', revenue: 0 },
    { date: 'Day 5', revenue: 0 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-sm font-bold text-indigo-600">
            {formatCurrency(payload[0].value, currencyCode, currencySymbol)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Recorded Payments</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Revenue Trends</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Actual collected revenue from verified payments over time
          </p>
        </div>
      </div>

      <div className="mt-6 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey={chartData[0]?.date ? 'date' : 'month'}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGrad)"
              activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
