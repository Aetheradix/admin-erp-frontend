import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import type { DashboardCalendarAndLeave } from '@/types/dashboard';

interface CompactPendingActionsCardProps {
  calendarAndLeave: DashboardCalendarAndLeave | null;
  totalTasks: number;
  completedTasks: number;
}

export const CompactPendingActionsCard: React.FC<CompactPendingActionsCardProps> = ({
  calendarAndLeave,
  totalTasks,
  completedTasks,
}) => {
  const navigate = useNavigate();

  const pendingLeavesCount = calendarAndLeave?.pendingLeavesCount || 0;
  const remainingTasks = Math.max(0, totalTasks - completedTasks);

  const actions = [
    {
      id: 'leaves',
      title: pendingLeavesCount > 0 ? `${pendingLeavesCount} Pending Leave Requests` : 'Leaves All Clear',
      subtitle: pendingLeavesCount > 0 ? 'Awaiting manager approval' : 'No requests pending approval',
      icon: Calendar,
      color: pendingLeavesCount > 0 ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10',
      actionText: 'Review',
      onClick: () => navigate('/calendar'),
    },
    {
      id: 'tasks',
      title: remainingTasks > 0 ? `${remainingTasks} Tasks In Progress` : 'All Tasks Completed',
      subtitle: remainingTasks > 0 ? 'Assigned tasks requiring completion' : 'Zero backlog',
      icon: remainingTasks > 0 ? AlertCircle : CheckCircle2,
      color: remainingTasks > 0 ? 'text-primary bg-primary/10' : 'text-emerald-500 bg-emerald-500/10',
      actionText: 'Tasks',
      onClick: () => navigate('/tasks'),
    },
  ];

  return (
    <div className="bg-white rounded-[12px] p-4 border border-border-subtle shadow-2xs hover:border-border transition-all duration-200 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-1">
            <Bell size={11} className="text-primary" /> Attention
          </span>
          <h3 className="text-sm font-black text-foreground">
            Pending Actions
          </h3>
        </div>

        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-surface-subtle text-muted">
          Real-time
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              onClick={act.onClick}
              className="p-2.5 rounded-xl bg-surface-subtle/50 hover:bg-surface-elevated border border-border-subtle/50 transition-all flex items-center justify-between gap-2.5 cursor-pointer group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${act.color}`}>
                  <Icon size={13} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {act.title}
                  </p>
                  <p className="text-[10px] text-muted truncate">
                    {act.subtitle}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-primary flex items-center gap-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform">
                <span>{act.actionText}</span>
                <ArrowUpRight size={11} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

