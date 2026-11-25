import { Calendar, CheckCircle2, Clock, Flame, Home, Radio, Sparkles } from 'lucide-react';
import type { DashboardSummaryData } from '@/types/dashboard';
import type { DashboardKpiItem } from '../types';

export function buildKpiItems(data: DashboardSummaryData): DashboardKpiItem[] {
  const { attendance, calendarAndLeave } = data;
  const isCheckedIn = attendance?.todayStatus === 'checked-in';
  const streak = attendance?.currentStreak || 0;
  const longestStreak = attendance?.longestStreak || 0;
  const presentDays = attendance?.monthlyStats?.totalCheckedInDays || 0;
  const wfhDays = calendarAndLeave?.wfhStats?.approvedWfhDaysThisMonth || 0;
  const leavesTaken =
    calendarAndLeave?.myUpcomingLeaves?.filter((leave) => leave.type !== 'Work from home').length ||
    0;
  const lateArrivals = attendance?.monthlyStats?.lateArrivals || 0;

  return [
    {
      id: 'status',
      label: 'Today Presence',
      value: isCheckedIn ? 'Checked In' : 'Not In',
      subtext: isCheckedIn ? 'Active Now' : 'Pending Punch',
      icon: Radio,
      iconColor: isCheckedIn ? 'text-emerald-500' : 'text-amber-500',
      badgeColor: isCheckedIn ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
      to: '/checkin',
    },
    {
      id: 'streak',
      label: 'Current Streak',
      value: `${streak} ${streak === 1 ? 'Day' : 'Days'}`,
      subtext: streak > 0 ? 'Consecutive' : 'Starts today',
      icon: Flame,
      iconColor: 'text-orange-500',
      badgeColor: 'bg-orange-50 text-orange-700',
      to: '/checkin',
    },
    {
      id: 'longest',
      label: 'Longest Streak',
      value: `${longestStreak} Days`,
      subtext: 'Personal record',
      icon: Sparkles,
      iconColor: 'text-amber-500',
      badgeColor: 'bg-amber-50 text-amber-700',
      to: '/checkin',
    },
    {
      id: 'present',
      label: 'Present Days',
      value: `${presentDays} Days`,
      subtext: 'This month',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      badgeColor: 'bg-emerald-50 text-emerald-700',
      to: '/calendar',
    },
    {
      id: 'wfh',
      label: 'WFH Days',
      value: `${wfhDays} Days`,
      subtext: 'Remote work',
      icon: Home,
      iconColor: 'text-indigo-500',
      badgeColor: 'bg-indigo-50 text-indigo-700',
      to: '/calendar',
    },
    {
      id: 'leaves',
      label: 'Leaves Taken',
      value: `${leavesTaken} ${leavesTaken === 1 ? 'Day' : 'Days'}`,
      subtext: 'Approved offs',
      icon: Calendar,
      iconColor: 'text-purple-500',
      badgeColor: 'bg-purple-50 text-purple-700',
      to: '/calendar',
    },
    {
      id: 'late',
      label: 'Late Check-ins',
      value: `${lateArrivals} Days`,
      subtext: lateArrivals === 0 ? 'Punctual' : 'Requires care',
      icon: Clock,
      iconColor: lateArrivals === 0 ? 'text-emerald-500' : 'text-rose-500',
      badgeColor:
        lateArrivals === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
      to: '/checkin',
    },
  ];
}
