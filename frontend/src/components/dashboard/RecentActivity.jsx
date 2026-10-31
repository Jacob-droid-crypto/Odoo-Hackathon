import React from 'react';
import {
  CreditCard,
  Receipt,
  Repeat,
  UserPlus,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { getRelativeTime } from '../../utils/formatDate';

export const RecentActivity = ({ activities = [] }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'PAYMENT':
        return <CreditCard className="h-4 w-4 text-emerald-600" />;
      case 'INVOICE':
        return <Receipt className="h-4 w-4 text-blue-600" />;
      case 'SUBSCRIPTION':
        return <Repeat className="h-4 w-4 text-indigo-600" />;
      case 'CUSTOMER':
        return <UserPlus className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status, type) => {
    const s = (status || '').toUpperCase();
    let bg = 'bg-slate-100 text-slate-700';

    if (s === 'COMPLETED' || s === 'PAID' || s === 'ACTIVE') {
      bg = 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
    } else if (s === 'OVERDUE' || s === 'CLOSED' || s === 'CANCELLED') {
      bg = 'bg-rose-50 text-rose-700 border border-rose-200/60';
    } else if (s === 'PAUSED' || s === 'PARTIALLY_PAID') {
      bg = 'bg-amber-50 text-amber-700 border border-amber-200/60';
    } else if (s === 'CONFIRMED' || s === 'ISSUED') {
      bg = 'bg-blue-50 text-blue-700 border border-blue-200/60';
    }

    return (
      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide ${bg}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Real-time feed of subscriptions, invoices, payments & customers
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Feed
        </span>
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {activities && activities.length > 0 ? (
          activities.map((act) => (
            <div
              key={act.id}
              className="group flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/80 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200/70">
                  {getIcon(act.type)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {act.description}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {getRelativeTime(act.date)}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {getStatusBadge(act.status, act.type)}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No recent activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
