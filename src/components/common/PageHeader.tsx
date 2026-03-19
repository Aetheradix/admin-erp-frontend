import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  extraStats?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  actions,
  extraStats 
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400">
            <Icon size={24} />
          </div>
        )}
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-wrap">
        {extraStats}
        {actions}
      </div>
    </div>
  );
};

export default PageHeader;
