import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  action,
  breadcrumbs,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 text-xs text-secondary font-mono mb-3">
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={b.label}>
                  {b.href ? (
                    <a href={b.href} className="hover:text-ink transition-colors">
                      {b.label}
                    </a>
                  ) : (
                    <span className="text-ink">{b.label}</span>
                  )}
                  {i < breadcrumbs.length - 1 && <span className="text-muted">/</span>}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Editorial Header */}
          {(title || action) && (
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-5 border-b border-border">
              <div>
                {title && (
                  <h1 className="text-2xl md:text-3xl font-light text-ink tracking-tight editorial-heading">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs md:text-sm text-secondary mt-1 max-w-2xl">
                    {subtitle}
                  </p>
                )}
              </div>
              {action && <div className="shrink-0">{action}</div>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};
