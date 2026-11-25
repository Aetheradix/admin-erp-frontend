import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import type { DashboardKpiItem } from '../../types';

export function KpiCard({ kpi }: { kpi: DashboardKpiItem }) {
  const navigate = useNavigate();
  const Icon = kpi.icon;

  const open = () => navigate(kpi.to);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={handleKeyDown}
      className="bg-white rounded-[12px] p-3 border border-border-subtle hover:border-border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs flex flex-col justify-between group">
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[9px] font-black uppercase tracking-wider text-muted truncate">
          {kpi.label}
        </span>
        <Icon
          size={12}
          className={cn(kpi.iconColor, 'shrink-0 group-hover:scale-110 transition-transform')}
        />
      </div>

      <div className="flex items-baseline justify-between gap-1 mt-0.5">
        <span className="text-sm sm:text-base font-black text-foreground tracking-tight truncate">
          {kpi.value}
        </span>
        <span className={cn('text-[8.5px] font-bold px-1.5 rounded shrink-0', kpi.badgeColor)}>
          {kpi.subtext}
        </span>
      </div>
    </div>
  );
}
