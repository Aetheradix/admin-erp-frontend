import { useNavigate } from 'react-router-dom';
import { Calendar, LogIn, LogOut, Settings, Shield, Sparkles } from 'lucide-react';
import { useAttendanceToggle } from '@/shared/hooks/useAttendanceToggle';
import type { DashboardSummaryData } from '@/types/dashboard';
import { cn } from '@/utils/cn';
import {
  formatCheckInTime,
  formatWelcomeDate,
  getAttendanceChipState,
  getGreeting,
} from '../utils/welcomeBar';
import { AttendanceStatusChip } from './welcome/AttendanceStatusChip';

interface DashboardWelcomeBarProps {
  userName: string;
  userRole: string;
  attendance: DashboardSummaryData['attendance'] | null;
  isLoading: boolean;
}

export function DashboardWelcomeBar({
  userName,
  userRole,
  attendance,
  isLoading,
}: DashboardWelcomeBarProps) {
  const navigate = useNavigate();
  const isCheckedIn = attendance?.todayStatus === 'checked-in';
  const isCheckedOut = attendance?.todayStatus === 'checked-out';
  const { toggle, isSubmitting } = useAttendanceToggle(isCheckedIn);

  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const formattedDate = formatWelcomeDate(now);
  const chipState = getAttendanceChipState(
    isCheckedIn,
    isCheckedOut,
    formatCheckInTime(attendance?.todayRecord?.checkInTime)
  );

  return (
    <div className="bg-white rounded-[12px] p-4 sm:p-5 border border-border-subtle shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1">
            <Sparkles size={11} />
            StartupOS
          </span>
          <span className="text-muted text-xs">•</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-subtle text-[10px] font-bold text-muted border border-border-subtle/60">
            <Shield size={10} className="text-primary" />
            {userRole}
          </span>
          <span className="text-muted text-xs">•</span>
          <span className="text-[11px] font-medium text-muted flex items-center gap-1">
            <Calendar size={11} className="text-muted/80" />
            {formattedDate}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          {greeting}, {userName || 'Team Member'}
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Here is your organization pulse, daily presence, and operational timeline.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <AttendanceStatusChip state={chipState} />

        <button
          type="button"
          onClick={toggle}
          disabled={isLoading || isSubmitting}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-50',
            isCheckedIn
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
              : 'bg-primary hover:bg-primary-hover text-white shadow-primary/20'
          )}>
          {isCheckedIn ? <LogOut size={13} /> : <LogIn size={13} />}
          <span>{isSubmitting ? 'Saving...' : isCheckedIn ? 'Check Out' : 'Check In'}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="p-2 rounded-[10px] bg-surface-subtle hover:bg-surface-elevated border border-border-subtle text-muted hover:text-foreground transition-colors cursor-pointer"
          title="Account Settings"
          aria-label="Account Settings">
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
}
