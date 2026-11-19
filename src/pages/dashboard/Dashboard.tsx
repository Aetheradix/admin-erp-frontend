import { useProfile } from '../profile/hooks/useProfile';
import { useDashboardData } from './hooks/useDashboardData';
import { resolveTaskMetrics } from './utils/dashboardStats';
import { DashboardSection } from './components/DashboardSection';
import { DashboardWelcomeBar } from './components/DashboardWelcomeBar';
import { CompactKpiRow } from './components/CompactKpiRow';
import { CompactAttendanceHeatmap } from './components/CompactAttendanceHeatmap';
import { CompactWorkDeliveryCard } from './components/CompactWorkDeliveryCard';
import { CompactHolidayCalendarCard } from './components/CompactHolidayCalendarCard';
import { CompactPayrollCard } from './components/CompactPayrollCard';
import { CompactPendingActionsCard } from './components/CompactPendingActionsCard';
import { CompactQuickActions } from './components/CompactQuickActions';

export default function Dashboard() {
  const { summary, projects, isLoading, stats, tasks } = useDashboardData();
  const { user } = useProfile();

  const userRole = user.roles?.[0]?.name || user.designation || 'Staff Member';
  const isCheckedIn = summary?.attendance?.todayStatus === 'checked-in';
  const { totalTasks, completedTasks, taskCompletionRate } = resolveTaskMetrics(stats, summary);

  return (
    <div className="space-y-3.5 pb-8 antialiased">
      <h1 className="sr-only">StartupOS Enterprise Dashboard</h1>

      <DashboardSection y={-8} duration={0.3}>
        <DashboardWelcomeBar
          userName={user.name}
          userRole={userRole}
          attendance={summary?.attendance || null}
          isLoading={isLoading}
        />
      </DashboardSection>

      <DashboardSection y={8} delay={0.05}>
        <CompactKpiRow data={summary || null} isLoading={isLoading} />
      </DashboardSection>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3.5">
          <DashboardSection delay={0.1}>
            <CompactAttendanceHeatmap />
          </DashboardSection>

          <DashboardSection delay={0.15} className="flex-1 flex flex-col">
            <CompactWorkDeliveryCard
              projects={projects}
              totalTasks={totalTasks}
              completedTasks={completedTasks}
              taskCompletionRate={taskCompletionRate}
              calendarAndLeave={summary?.calendarAndLeave || null}
              inventory={summary?.inventory || null}
              attendance={summary?.attendance || null}
              tasks={tasks}
            />
          </DashboardSection>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3.5 justify-between">
          <DashboardSection delay={0.12}>
            <CompactHolidayCalendarCard />
          </DashboardSection>

          <DashboardSection delay={0.18}>
            <CompactPayrollCard payroll={summary?.payroll || null} isLoading={isLoading} />
          </DashboardSection>

          <DashboardSection delay={0.22} className="flex-1 flex flex-col">
            <CompactPendingActionsCard
              calendarAndLeave={summary?.calendarAndLeave || null}
              totalTasks={totalTasks}
              completedTasks={completedTasks}
            />
          </DashboardSection>
        </div>
      </div>

      <DashboardSection delay={0.25}>
        <CompactQuickActions isCheckedIn={isCheckedIn} />
      </DashboardSection>
    </div>
  );
}