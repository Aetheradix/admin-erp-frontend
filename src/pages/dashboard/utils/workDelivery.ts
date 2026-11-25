import { Calendar, Package, UserCheck } from 'lucide-react';
import type { Project } from '@/types/models';
import type {
  DashboardAttendance,
  DashboardCalendarAndLeave,
  DashboardInventory,
} from '@/types/dashboard';
import { ACTIVITY_INVENTORY_LIMIT, ACTIVITY_LEAVE_LIMIT } from '../constants';
import type { DashboardActivityItem } from '../types';

export function filterProjects(projects: Project[], query: string): Project[] {
  const needle = query.toLowerCase();
  return projects.filter(
    (project) =>
      (project.title || '').toLowerCase().includes(needle) ||
      (project.category || '').toLowerCase().includes(needle) ||
      (project.status || '').toLowerCase().includes(needle)
  );
}

export function resolveProjectTagColor(project: Project): string {
  if (project.value === 'Active' || project.status === 'Active') return 'green';
  if (project.value === 'Planning') return 'blue';
  if (project.value === 'Completed') return 'purple';
  return 'orange';
}

export function buildActivityTimeline(
  attendance: DashboardAttendance | null | undefined,
  calendarAndLeave: DashboardCalendarAndLeave | null,
  inventory: DashboardInventory | null
): DashboardActivityItem[] {
  const upcomingLeaves = calendarAndLeave?.myUpcomingLeaves || [];
  const recentActivities = inventory?.recentActivities || [];
  const checkInTime = attendance?.todayRecord?.checkInTime;

  return [
    ...(checkInTime
      ? [
          {
            id: 'punch-in-today',
            title: `Shift Check-in (${attendance?.todayRecord?.workMode === 'wfh' ? 'Remote WFH' : 'Office'})`,
            time: new Date(checkInTime).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
            type: 'attendance',
            icon: UserCheck,
            color: 'text-emerald-500 bg-emerald-500/10',
          },
        ]
      : []),
    ...upcomingLeaves.slice(0, ACTIVITY_LEAVE_LIMIT).map((leave) => ({
      id: `leave-${leave.id}`,
      title: `${leave.type} Application: ${leave.status}`,
      time: `${leave.startDate}${leave.endDate && leave.endDate !== leave.startDate ? ` - ${leave.endDate}` : ''}`,
      type: 'leave',
      icon: Calendar,
      color:
        leave.status === 'Approved'
          ? 'text-blue-500 bg-blue-500/10'
          : 'text-amber-500 bg-amber-500/10',
    })),
    ...recentActivities.slice(0, ACTIVITY_INVENTORY_LIMIT).map((activity) => ({
      id: `inv-${activity.id}`,
      title: `${activity.action}: ${activity.itemName}`,
      time: activity.createdAt
        ? new Date(activity.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        : 'Recently',
      type: 'inventory',
      icon: Package,
      color: 'text-zinc-600 bg-zinc-500/10',
    })),
  ];
}
