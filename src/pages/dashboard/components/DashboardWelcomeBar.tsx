import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Settings,
  LogIn,
  LogOut,
  Sparkles,
  Shield,
} from 'lucide-react';
import { useCheckInMutation, useCheckOutMutation } from '@/store/api/attendanceSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { broadcastSync } from '@/services/syncService';
import type { DashboardSummaryData } from '@/types/dashboard';

interface DashboardWelcomeBarProps {
  userName: string;
  userRole: string;
  attendance: DashboardSummaryData['attendance'] | null;
  isLoading: boolean;
}

export const DashboardWelcomeBar: React.FC<DashboardWelcomeBarProps> = ({
  userName,
  userRole,
  attendance,
  isLoading,
}) => {
  const navigate = useNavigate();
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();

  const isCheckedIn = attendance?.todayStatus === 'checked-in';
  const isCheckedOut = attendance?.todayStatus === 'checked-out';

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
        ? 'Good afternoon'
        : 'Good evening';

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const checkInTimeStr = attendance?.todayRecord?.checkInTime
    ? new Date(attendance.todayRecord.checkInTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  const handleToggleAttendance = async () => {
    try {
      if (isCheckedIn) {
        await checkOut().unwrap();
        showToast.success('Checked out successfully!');
      } else {
        await checkIn({ work_mode: 'office' }).unwrap();
        showToast.success('Checked in successfully!');
      }
      broadcastSync('attendance');
    } catch (err: any) {
      showToast.error(err?.data?.message || 'Attendance action failed');
    }
  };

  return (
    <div className="bg-white rounded-[12px] p-4 sm:p-5 border border-border-subtle shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left: Greeting & Date */}
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

      {/* Right: Real-time Attendance Status Chip & Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div
          className={`flex items-center gap-2 px-3.5 py-2 rounded-[10px] border text-xs font-bold transition-all ${
            isCheckedIn
              ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25'
              : isCheckedOut
                ? 'bg-zinc-100 text-zinc-700 border-zinc-200'
                : 'bg-amber-500/10 text-amber-800 border-amber-500/25'
          }`}>
          <span
            className={`w-2 h-2 rounded-full ${
              isCheckedIn
                ? 'bg-emerald-500 animate-pulse'
                : isCheckedOut
                  ? 'bg-zinc-400'
                  : 'bg-amber-500'
            }`}
          />
          <span>
            {isCheckedIn
              ? `Working · In at ${checkInTimeStr || 'Morning'}`
              : isCheckedOut
                ? 'Shift Completed'
                : 'Not Checked In'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleAttendance}
          disabled={isLoading || isCheckingIn || isCheckingOut}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-50 ${
            isCheckedIn
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
              : 'bg-primary hover:bg-primary-hover text-white shadow-primary/20'
          }`}>
          {isCheckedIn ? <LogOut size={13} /> : <LogIn size={13} />}
          <span>
            {isCheckingIn || isCheckingOut
              ? 'Saving...'
              : isCheckedIn
                ? 'Check Out'
                : 'Check In'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="p-2 rounded-[10px] bg-surface-subtle hover:bg-surface-elevated border border-border-subtle text-muted hover:text-foreground transition-colors cursor-pointer"
          title="Account Settings">
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
};

