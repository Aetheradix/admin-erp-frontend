import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import { Tabs } from '@/components/ui/primitives/Tabs';

interface ExplorerBarProps {
  icon?: LucideIcon;
  title: string;
  countLabel: string;
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  action?: React.ReactNode;
}

export const ExplorerBar = ({
  icon: Icon = Sparkles,
  title,
  countLabel,
  tabs,
  activeTab,
  onTabChange,
  action,
}: ExplorerBarProps) => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[40px] border border-border-subtle shadow-soft transition-all duration-500 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
          <Icon size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-foreground uppercase tracking-widest">{title}</h4>
          <p className="text-xs text-muted font-bold italic">{countLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
        <Tabs
          items={tabs}
          activeItem={activeTab}
          onItemChange={onTabChange}
        />
      </div>

      {action ?? (
        <Button variant="secondary" className="h-12 px-6 rounded-2xl! gap-2 border-border-subtle!">
          <Filter size={16} />
          <span className="font-bold text-xs uppercase tracking-widest">Filters</span>
        </Button>
      )}
    </div>
  );
};
