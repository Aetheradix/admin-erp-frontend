import { useState, useEffect } from 'react';
import { useGetProjectsQuery } from '@/store/api/projectSlice';
import { useGetTasksQuery } from '@/store/api/taskSlice';
import { useGetReimbursementsQuery } from '@/store/api/financeApiSlice';
import { useGetUsersQuery } from '@/store/api/userSlice';
import { useGetDashboardSummaryQuery } from '@/store/api/dashboardSlice';

const PRESET_COLORS = ['#e8583a', '#3B82F6', '#6366F1', '#9747ff', '#34d399', '#fb7185', '#06B6D4'];

export const useDashboardData = () => {
  const {
    data: summary,
    isLoading: isLoadingSummary,
    isFetching: isFetchingSummary,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useGetDashboardSummaryQuery(undefined, {
    pollingInterval: 30000, // Background revalidation every 30s
  });

  const { data: rawProjects, isLoading: isLoadingProjects } = useGetProjectsQuery();
  const { data: rawTasks, isLoading: isLoadingTasks } = useGetTasksQuery();
  const { data: rawReimbursements } = useGetReimbursementsQuery();
  const { data: rawUsers } = useGetUsersQuery();

  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');

  useEffect(() => {
    if (summary) {
      setLastSyncedTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }
  }, [summary]);

  // Projects strictly from database
  const projects = Array.isArray(rawProjects)
    ? (rawProjects as any[]).map((p: any, idx: number) => {
        const pId = p?.id || p?.project_id || idx + 1;
        const matchingTasks = Array.isArray(rawTasks)
          ? (rawTasks as any[]).filter((t: any) => String(t?.project_id) === String(pId))
          : [];

        return {
          id: String(pId),
          title: p?.title || p?.project_name || p?.name || `Project #${pId}`,
          tasks: matchingTasks.length,
          value: p?.value || p?.project_status || p?.status || 'Active',
          color: p?.color || PRESET_COLORS[idx % PRESET_COLORS.length],
          category: (p?.category || p?.project_status || p?.status || 'PROJECT').toUpperCase(),
          participants: p?.participants || (Array.isArray(rawUsers) ? Math.min(rawUsers.length, 6) : 0),
        };
      })
    : [];

  // Live real task metrics
  const totalTasksCount = Array.isArray(rawTasks) ? rawTasks.length : summary?.projects?.totalTasks || 0;
  const completedTasksCount = Array.isArray(rawTasks)
    ? rawTasks.filter((t) => t?.task_status === 'Completed').length
    : summary?.projects?.completedTasks || 0;
  const taskCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Real financial claims
  const totalReimbursementAmount = Array.isArray(rawReimbursements)
    ? rawReimbursements.reduce((sum, r) => sum + (Number(r?.amount) || 0), 0)
    : 0;

  const totalUsersCount = Array.isArray(rawUsers) ? rawUsers.length : 0;
  const isCheckedIn = summary?.attendance?.todayStatus === 'checked-in';

  const stats = {
    averageValue: `₹ ${Math.round(totalReimbursementAmount).toLocaleString('en-IN')}`,
    valueVsLy: `${totalReimbursementAmount > 0 ? '₹ ' + totalReimbursementAmount.toLocaleString('en-IN') : 'No Claims'}`,
    averageTasks: projects.length > 0 ? Math.round((totalTasksCount / projects.length) * 10) / 10 : 0,
    tasksVsLy: `${taskCompletionRate}% DONE`,
    totalProjects: projects.length,
    completedTasks: completedTasksCount,
    totalTasks: totalTasksCount,
    totalUsers: totalUsersCount,
    isCheckedIn,
    attendanceStats: summary?.attendance || null,
  };

  const handleRefreshAll = () => {
    refetchSummary();
  };

  return {
    summary,
    projects,
    stats,
    isLoading: isLoadingSummary || isLoadingProjects || isLoadingTasks,
    isFetching: isFetchingSummary,
    isError: isSummaryError,
    lastSyncedTime,
    handleRefreshAll,
    liveCounts: {
      projects: projects.length,
      tasks: totalTasksCount,
      reimbursements: Array.isArray(rawReimbursements) ? rawReimbursements.length : 0,
      users: totalUsersCount,
      isCheckedIn,
    },
  };
};
