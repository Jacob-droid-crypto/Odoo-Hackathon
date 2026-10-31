import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Repeat } from 'lucide-react';

export const SubscriptionChart = ({ data = [], dueForRenewal = 0 }) => {
  const COLORS = {
    ACTIVE: '#10b981',
    PAUSED: '#f59e0b',
    CLOSED: '#ef4444',
    DRAFT: '#64748b',
    QUOTATION: '#8b5cf6',
    CONFIRMED: '#3b82f6'
  };

  const chartData = data && data.length > 0 ? data.filter(d => d.count > 0) : [
    { status: 'ACTIVE', count: 1, percentage: 100 }
  ];

  const total = data.reduce((sum, d) => sum + (d.count || 0), 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-800">{item.status}</p>
          <p className="mt-0.5 text-sm font-bold text-slate-900">
            {item.count} <span className="text-xs font-normal text-slate-500">({item.percentage || 0}%)</span>
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
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Repeat className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Subscription Status</h3>
          </div>
          {dueForRenewal > 0 && (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/80">
              {dueForRenewal} Due for renewal
            </span>
          )}
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
                dataKey="count"
                nameKey="status"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.status] || '#94a3b8'}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">{total}</span>
            <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400">Total</span>
          </div>
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
        {data.map((item) => (
          <div key={item.status} className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50">
            <div className="flex items-center gap-2 truncate">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[item.status] || '#94a3b8' }}
              />
              <span className="text-slate-600 font-medium truncate">{item.status}</span>
            </div>
            <span className="font-bold text-slate-800 shrink-0">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
