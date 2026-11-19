import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Bell } from 'lucide-react';
import type { DashboardCalendarAndLeave } from '@/types/dashboard';
import { cn } from '@/utils/cn';
import { DASHBOARD_CARD_CLASS } from '../constants';
import { buildPendingActions } from '../utils/dashboardActions';
import type { DashboardPendingAction } from '../types';

interface CompactPendingActionsCardProps {
  calendarAndLeave: DashboardCalendarAndLeave | null;
  totalTasks: number;
  completedTasks: number;
}

function PendingActionRow({ action }: { action: DashboardPendingAction }) {
  const navigate = useNavigate();
  const Icon = action.icon;

  const open = () => navigate(action.to);
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
      className="p-2.5 rounded-xl bg-surface-subtle/50 hover:bg-surface-elevated border border-border-subtle/50 transition-all flex items-center justify-between gap-2.5 cursor-pointer group">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
            action.color
          )}>
          <Icon size={13} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
            {action.title}
          </p>
          <p className="text-[10px] text-muted truncate">{action.subtitle}</p>
        </div>
      </div>

      <span className="text-[10px] font-bold text-primary flex items-center gap-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform">
        <span>{action.actionText}</span>
        <ArrowUpRight size={11} />
      </span>
    </div>
  );
}

export function CompactPendingActionsCard({
  calendarAndLeave,
  totalTasks,
  completedTasks,
}: CompactPendingActionsCardProps) {
  const actions = buildPendingActions(
    calendarAndLeave?.pendingLeavesCount || 0,
    totalTasks,
    completedTasks
  );

  return (
    <div className={cn(DASHBOARD_CARD_CLASS, 'h-full flex flex-col justify-between')}>
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-1">
            <Bell size={11} className="text-primary" /> Attention
          </span>
          <h3 className="text-sm font-black text-foreground">Pending Actions</h3>
        </div>

        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-surface-subtle text-muted">
          Real-time
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <PendingActionRow key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
}