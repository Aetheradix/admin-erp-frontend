import { useGetProjectsQuery } from '@/store/api/projectSlice';
import { useGetTasksQuery } from '@/store/api/taskSlice';
import { useGetReimbursementsQuery } from '@/store/api/financeApiSlice';
import { useGetUsersQuery } from '@/store/api/userSlice';
import { useGetDashboardSummaryQuery } from '@/store/api/dashboardSlice';
import { mapDashboardProjects } from '../utils/dashboardProjects';
import { buildDashboardMetrics } from '../utils/dashboardStats';

export const useDashboardData = () => {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummaryQuery(undefined, {
    pollingInterval: 30000, // Background revalidation every 30s
  });

  const { data: rawProjects, isLoading: isLoadingProjects } = useGetProjectsQuery();
  const { data: rawTasks, isLoading: isLoadingTasks } = useGetTasksQuery();
  const { data: rawReimbursements } = useGetReimbursementsQuery();
  const { data: rawUsers } = useGetUsersQuery();

  const userCount = Array.isArray(rawUsers) ? rawUsers.length : 0;
  const projects = mapDashboardProjects(rawProjects, rawTasks, userCount);
  const tasks = Array.isArray(rawTasks) ? rawTasks : [];
  const { stats } = buildDashboardMetrics({
    projects,
    tasks: rawTasks,
    summary,
    reimbursements: rawReimbursements,
    userCount,
  });

  return {
    summary,
    projects,
    tasks,
    stats,
    isLoading: isLoadingSummary || isLoadingProjects || isLoadingTasks,
  };
};
