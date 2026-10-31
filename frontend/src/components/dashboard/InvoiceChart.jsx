import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Receipt } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export const InvoiceChart = ({ data = [], outstandingAmount = 0, currencyCode = 'USD', currencySymbol = '$' }) => {
  const COLORS = {
    PAID: '#10b981',
    UNPAID: '#3b82f6',
    PARTIALLY_PAID: '#f59e0b',
    OVERDUE: '#ef4444'
  };

  const chartData = data && data.length > 0 ? data : [
    { status: 'PAID', count: 0 },
    { status: 'UNPAID', count: 0 },
    { status: 'PARTIALLY_PAID', count: 0 },
    { status: 'OVERDUE', count: 0 }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-500">{item.status}</p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {item.count} Invoices
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Invoice Status Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown of billing statuses and receivables</p>
          </div>
        </div>

        {outstandingAmount > 0 && (
          <div className="text-right">
            <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Outstanding Balance</p>
            <p className="text-sm font-bold text-rose-600">
              {formatCurrency(outstandingAmount, currencyCode, currencySymbol)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="status"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.status] || '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
