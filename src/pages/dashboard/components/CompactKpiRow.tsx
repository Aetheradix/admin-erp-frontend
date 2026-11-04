import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Sparkles,
  CheckCircle2,
  Home,
  Calendar,
  Clock,
  Radio,
} from 'lucide-react';
import type { DashboardSummaryData } from '@/types/dashboard';

interface CompactKpiRowProps {
  data: DashboardSummaryData | null;
  isLoading: boolean;
}

export const CompactKpiRow: React.FC<CompactKpiRowProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-[68px] rounded-[12px] bg-white border border-border-subtle p-3 animate-pulse flex flex-col justify-between shadow-2xs">
            <div className="h-3 w-16 bg-surface-subtle rounded" />
            <div className="h-5 w-20 bg-surface-subtle rounded mt-1" />
          </div>
        ))}
      </div>
    );
  }

  const { attendance, calendarAndLeave } = data;
  const isCheckedIn = attendance?.todayStatus === 'checked-in';
  const streak = attendance?.currentStreak || 0;
  const longestStreak = attendance?.longestStreak || 0;
  const presentDays = attendance?.monthlyStats?.totalCheckedInDays || 0;
  const wfhDays = calendarAndLeave?.wfhStats?.approvedWfhDaysThisMonth || 0;
  const leavesTaken = calendarAndLeave?.myUpcomingLeaves?.filter((l) => l.type !== 'Work from home').length || 0;
  const lateArrivals = attendance?.monthlyStats?.lateArrivals || 0;

  const kpis = [
    {
      id: 'status',
      label: 'Today Presence',
      value: isCheckedIn ? 'Checked In' : 'Not In',
      subtext: isCheckedIn ? 'Active Now' : 'Pending Punch',
      icon: Radio,
      iconColor: isCheckedIn ? 'text-emerald-500' : 'text-amber-500',
      badgeColor: isCheckedIn ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
      onClick: () => navigate('/checkin'),
    },
    {
      id: 'streak',
      label: 'Current Streak',
      value: `${streak} ${streak === 1 ? 'Day' : 'Days'}`,
      subtext: streak > 0 ? 'Consecutive' : 'Starts today',
      icon: Flame,
      iconColor: 'text-orange-500',
      badgeColor: 'bg-orange-50 text-orange-700',
      onClick: () => navigate('/checkin'),
    },
    {
      id: 'longest',
      label: 'Longest Streak',
      value: `${longestStreak} Days`,
      subtext: 'Personal record',
      icon: Sparkles,
      iconColor: 'text-amber-500',
      badgeColor: 'bg-amber-50 text-amber-700',
      onClick: () => navigate('/checkin'),
    },
    {
      id: 'present',
      label: 'Present Days',
      value: `${presentDays} Days`,
      subtext: 'This month',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      badgeColor: 'bg-emerald-50 text-emerald-700',
      onClick: () => navigate('/calendar'),
    },
    {
      id: 'wfh',
      label: 'WFH Days',
      value: `${wfhDays} Days`,
      subtext: 'Remote work',
      icon: Home,
      iconColor: 'text-indigo-500',
      badgeColor: 'bg-indigo-50 text-indigo-700',
      onClick: () => navigate('/calendar'),
    },
    {
      id: 'leaves',
      label: 'Leaves Taken',
      value: `${leavesTaken} ${leavesTaken === 1 ? 'Day' : 'Days'}`,
      subtext: 'Approved offs',
      icon: Calendar,
      iconColor: 'text-purple-500',
      badgeColor: 'bg-purple-50 text-purple-700',
      onClick: () => navigate('/calendar'),
    },
    {
      id: 'late',
      label: 'Late Check-ins',
      value: `${lateArrivals} Days`,
      subtext: lateArrivals === 0 ? 'Punctual' : 'Requires care',
      icon: Clock,
      iconColor: lateArrivals === 0 ? 'text-emerald-500' : 'text-rose-500',
      badgeColor: lateArrivals === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
      onClick: () => navigate('/checkin'),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            onClick={kpi.onClick}
            className="bg-white rounded-[12px] p-3 border border-border-subtle hover:border-border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs flex flex-col justify-between group">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-muted truncate">
                {kpi.label}
              </span>
              <Icon size={12} className={`${kpi.iconColor} shrink-0 group-hover:scale-110 transition-transform`} />
            </div>

            <div className="flex items-baseline justify-between gap-1 mt-0.5">
              <span className="text-sm sm:text-base font-black text-foreground tracking-tight truncate">
                {kpi.value}
              </span>
              <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded ${kpi.badgeColor} shrink-0`}>
                {kpi.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

