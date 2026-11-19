import {
  AlertCircle,
  Calendar,
  CalendarCheck2,
  CheckCircle2,
  FileText,
  Home,
  LogIn,
  LogOut,
  Package,
} from 'lucide-react';
import type { DashboardPendingAction, DashboardQuickAction } from '../types';

export function buildQuickActions(isCheckedIn: boolean): DashboardQuickAction[] {
  return [
    {
      id: 'attendance',
      label: isCheckedIn ? 'Check Out' : 'Check In',
      desc: isCheckedIn ? 'End Shift' : 'Punch In',
      icon: isCheckedIn ? LogOut : LogIn,
      isAttendance: true,
      color: isCheckedIn ? 'text-amber-600' : 'text-primary',
      badge: isCheckedIn ? 'bg-amber-500/10' : 'bg-primary/10',
    },
    {
      id: 'leave',
      label: 'Apply for Leave',
      desc: 'Day Off / Sick',
      icon: Calendar,
      to: '/calendar',
      color: 'text-purple-600',
      badge: 'bg-purple-500/10',
    },
    {
      id: 'wfh',
      label: 'Request WFH',
      desc: 'Remote Day',
      icon: Home,
      to: '/calendar',
      color: 'text-indigo-600',
      badge: 'bg-indigo-500/10',
    },
    {
      id: 'payslips',
      label: 'View Payslips',
      desc: 'Salary & Taxes',
      icon: FileText,
      to: '/finance/my-payslip',
      color: 'text-emerald-600',
      badge: 'bg-emerald-500/10',
    },
    {
      id: 'events',
      label: 'Events & Meetings',
      desc: 'All Schedules',
      icon: CalendarCheck2,
      to: '/events',
      color: 'text-blue-600',
      badge: 'bg-blue-500/10',
    },
    {
      id: 'inventory',
      label: 'Inventory & Assets',
      desc: 'Devices & Track',
      icon: Package,
      to: '/inventory',
      color: 'text-zinc-600',
      badge: 'bg-zinc-500/10',
    },
  ];
}

export function buildPendingActions(
  pendingLeavesCount: number,
  totalTasks: number,
  completedTasks: number
): DashboardPendingAction[] {
  const remainingTasks = Math.max(0, totalTasks - completedTasks);

  return [
    {
      id: 'leaves',
      title:
        pendingLeavesCount > 0 ? `${pendingLeavesCount} Pending Leave Requests` : 'Leaves All Clear',
      subtitle: pendingLeavesCount > 0 ? 'Awaiting manager approval' : 'No requests pending approval',
      icon: Calendar,
      color:
        pendingLeavesCount > 0 ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10',
      actionText: 'Review',
      to: '/calendar',
    },
    {
      id: 'tasks',
      title: remainingTasks > 0 ? `${remainingTasks} Tasks In Progress` : 'All Tasks Completed',
      subtitle: remainingTasks > 0 ? 'Assigned tasks requiring completion' : 'Zero backlog',
      icon: remainingTasks > 0 ? AlertCircle : CheckCircle2,
      color: remainingTasks > 0 ? 'text-primary bg-primary/10' : 'text-emerald-500 bg-emerald-500/10',
      actionText: 'Tasks',
      to: '/tasks',
    },
  ];
}