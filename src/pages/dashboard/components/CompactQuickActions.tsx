import { useNavigate } from 'react-router-dom';
import { useAttendanceToggle } from '@/shared/hooks/useAttendanceToggle';
import { cn } from '@/utils/cn';
import { buildQuickActions } from '../utils/dashboardActions';

interface CompactQuickActionsProps {
  isCheckedIn: boolean;
}

export function CompactQuickActions({ isCheckedIn }: CompactQuickActionsProps) {
  const navigate = useNavigate();
  const { toggle, isSubmitting } = useAttendanceToggle(isCheckedIn);

  return (
    <div className="bg-white rounded-[12px] p-3.5 border border-border-subtle shadow-2xs">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">
          Quick Workflow Actions
        </span>
        <span className="text-[9px] text-muted font-medium">1-Click Shortcuts</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {buildQuickActions(isCheckedIn).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.isAttendance ? toggle : () => navigate(item.to)}
              disabled={item.isAttendance && isSubmitting}
              className="p-2.5 rounded-xl bg-surface-subtle/70 hover:bg-surface-elevated border border-border-subtle/60 hover:border-border transition-all cursor-pointer flex items-center gap-2.5 text-left group disabled:opacity-50">
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform',
                  item.badge,
                  item.color
                )}>
                <Icon size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {item.label}
                </p>
                <p className="text-[10px] text-muted truncate">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
