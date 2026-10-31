import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex border-b border-border gap-6 overflow-x-auto select-none ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`pb-3 text-xs md:text-sm font-medium tracking-tight flex items-center gap-2 relative transition-colors duration-150 whitespace-nowrap ${
              isActive ? 'text-ink font-semibold' : 'text-secondary hover:text-ink'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-sm border ${
                  isActive
                    ? 'bg-ink text-white border-ink'
                    : 'bg-[#F2F1EE] text-secondary border-border'
                }`}
              >
                {tab.badge}
              </span>
            )}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-ink animate-in fade-in" />
            )}
          </button>
        );
      })}
    </div>
  );
};
