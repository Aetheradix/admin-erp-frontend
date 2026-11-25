import type { Project, Reimbursement, Task } from '@/types/models';
import type { DashboardSummaryData } from '@/types/dashboard';
import { COMPLETED_TASK_STATUS } from '../constants';
import type { DashboardStats } from '../types';

export interface DashboardMetricsInput {
  projects: Project[];
  tasks: Task[] | undefined;
  summary: DashboardSummaryData | undefined;
  reimbursements: Reimbursement[] | undefined;
  userCount: number;
}

export interface DashboardMetrics {
  stats: DashboardStats;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  liveCounts: {
    projects: number;
    tasks: number;
    reimbursements: number;
    users: number;
    isCheckedIn: boolean;
  };
}

export function resolveTaskMetrics(
  stats: DashboardStats | undefined,
  summary: DashboardSummaryData | undefined
): { totalTasks: number; completedTasks: number; taskCompletionRate: number } {
  return {
    totalTasks: stats?.totalTasks || summary?.projects?.totalTasks || 0,
    completedTasks: stats?.completedTasks || summary?.projects?.completedTasks || 0,
    taskCompletionRate: stats?.tasksVsLy
      ? parseInt(stats.tasksVsLy) || 0
      : summary?.projects?.taskCompletionRate || 0,
  };
}

export function buildDashboardMetrics({
  projects,
  tasks,
  summary,
  reimbursements,
  userCount,
}: DashboardMetricsInput): DashboardMetrics {
  const hasTasks = Array.isArray(tasks);
  const totalTasks = hasTasks ? tasks.length : summary?.projects?.totalTasks || 0;
  const completedTasks = hasTasks
    ? tasks.filter((task) => task?.task_status === COMPLETED_TASK_STATUS).length
    : summary?.projects?.completedTasks || 0;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const reimbursementTotal = Array.isArray(reimbursements)
    ? reimbursements.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0)
    : 0;

  const isCheckedIn = summary?.attendance?.todayStatus === 'checked-in';

  return {
    totalTasks,
    completedTasks,
    taskCompletionRate,
    stats: {
      averageValue: `₹ ${Math.round(reimbursementTotal).toLocaleString('en-IN')}`,
      valueVsLy: `${reimbursementTotal > 0 ? '₹ ' + reimbursementTotal.toLocaleString('en-IN') : 'No Claims'}`,
      averageTasks: projects.length > 0 ? Math.round((totalTasks / projects.length) * 10) / 10 : 0,
      tasksVsLy: `${taskCompletionRate}% DONE`,
      totalProjects: projects.length,
      completedTasks,
      totalTasks,
      totalUsers: userCount,
      isCheckedIn,
      attendanceStats: summary?.attendance || null,
    },
    liveCounts: {
      projects: projects.length,
      tasks: totalTasks,
      reimbursements: Array.isArray(reimbursements) ? reimbursements.length : 0,
      users: userCount,
      isCheckedIn,
    },
  };
}
