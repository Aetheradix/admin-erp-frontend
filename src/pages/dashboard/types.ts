import type { LucideIcon } from 'lucide-react';
import type { Project } from '@/types/models';
import type { DashboardSummaryData, HeatmapCell } from '@/types/dashboard';

export interface DashboardStats {
  averageValue: string;
  valueVsLy: string;
  averageTasks: number;
  tasksVsLy: string;
  totalProjects: number;
  completedTasks: number;
  totalTasks: number;
  totalUsers: number;
  isCheckedIn: boolean;
  attendanceStats: DashboardSummaryData['attendance'] | null;
}

export type RawProjectRow = Project & {
  project_id?: string | number;
  project_name?: string;
  project_status?: string;
  start_date?: string;
  end_date?: string;
};

export interface DashboardKpiItem {
  id: string;
  label: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  iconColor: string;
  badgeColor: string;
  to: string;
}

interface DashboardQuickActionBase {
  id: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  badge: string;
}

export type DashboardQuickAction = DashboardQuickActionBase &
  ({ isAttendance: true } | { isAttendance?: false; to: string });

export interface DashboardPendingAction {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  actionText: string;
  to: string;
}

export interface DashboardActivityItem {
  id: string;
  title: string;
  time: string;
  type: string;
  icon: LucideIcon;
  color: string;
}

export interface HeatmapMonthHeader {
  monthName: string;
  colIndex: number;
}

export interface HeatmapHoverState {
  cell: HeatmapCell;
  x: number;
  y: number;
}
