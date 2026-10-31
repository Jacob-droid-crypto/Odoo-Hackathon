import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export const PaymentChart = ({ data = [], currencyCode = 'USD', currencySymbol = '$' }) => {
  const chartData = data && data.length > 0 ? data.filter(d => d.amount > 0 || d.count > 0) : [
    { method: 'UPI', count: 0, amount: 0, color: '#8b5cf6' }
  ];

  const totalAmount = data.reduce((sum, d) => sum + (d.amount || 0), 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-800">{item.method}</p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {formatCurrency(item.amount, currencyCode, currencySymbol)}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {item.count} Transactions ({item.percentage || 0}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Payment Methods</h3>
              <p className="text-xs text-slate-500">Breakdown by transaction channel</p>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="relative mt-4 h-[200px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="amount"
                nameKey="method"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || '#8b5cf6'}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-slate-900 truncate px-2">
              {formatCurrency(totalAmount, currencyCode, currencySymbol)}
            </span>
            <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400">Total Paid</span>
          </div>
        </div>
      </div>

      {/* Method Badges */}
      <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
        {data.map((item) => (
          <div key={item.method} className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50">
            <div className="flex items-center gap-2 truncate">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color || '#64748b' }}
              />
              <span className="text-slate-600 font-medium truncate">{item.method}</span>
            </div>
            <span className="font-semibold text-slate-800 shrink-0">
              {formatCurrency(item.amount, currencyCode, currencySymbol)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
